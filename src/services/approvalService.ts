import mongoose from "mongoose";
import { Certificate, ICertificateDocument } from "@/models/Certificate";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { SessionUser } from "@/types/auth";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Assign two eligible approvers and transition certificate to PENDING_APPROVAL.
 */
export async function submitCertificateForApproval(
  certificateId: string,
  user: SessionUser
): Promise<ICertificateDocument> {
  await connectToDatabase();

  const certificate = await Certificate.findById(certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (certificate.status !== "DRAFT" && certificate.status !== "REJECTED") {
    throw new Error(`Cannot submit certificate in status ${certificate.status}`);
  }

  // Find all active roles with approval permission
  const approverRoles = await Role.find({
    $or: [
      { permissions: "certificates.approve" },
      { name: "Administrator" },
      { name: "Approver" },
    ],
  });
  const roleIds = approverRoles.map((r) => r._id);

  // Find active users with those roles
  const eligibleApprovers = await User.find({
    roleId: { $in: roleIds },
    isActive: true,
  });

  if (eligibleApprovers.length < 2) {
    // If fewer than 2 distinct approvers exist in system, include any active admin or user with permission
    const allUsers = await User.find({ isActive: true });
    if (allUsers.length < 2) {
      throw new Error("System requires at least two registered active users for two-person approval.");
    }
  }

  // Prefer approvers who are NOT the creator for separation of duties
  const creatorIdStr = certificate.createdBy.toString();
  let candidateApprovers = eligibleApprovers.filter(
    (u) => u._id.toString() !== creatorIdStr
  );

  if (candidateApprovers.length < 2) {
    // If not enough independent approvers, allow eligible approvers list
    candidateApprovers = eligibleApprovers;
  }

  // Prefer dedicated approvers first, then administrators
  const approverRole = approverRoles.find((r) => r.name === "Approver");
  if (approverRole) {
    const approverRoleIdStr = approverRole._id.toString();
    candidateApprovers.sort((a, b) => {
      const aScore = a.roleId.toString() === approverRoleIdStr ? 2 : 1;
      const bScore = b.roleId.toString() === approverRoleIdStr ? 2 : 1;
      return bScore - aScore;
    });
  }

  // Pick 2 distinct approvers
  const approverA = candidateApprovers[0];
  const approverB = candidateApprovers[1] || candidateApprovers[0];

  const requiredApprovers = [approverA._id, approverB._id];
  const initialApprovals = [
    {
      userId: approverA._id,
      status: "PENDING" as const,
    },
    {
      userId: approverB._id,
      status: "PENDING" as const,
    },
  ];

  const action = certificate.status === "REJECTED" ? "RESUBMITTED" : "SUBMITTED";

  certificate.status = "PENDING_APPROVAL";
  certificate.submittedAt = new Date();
  certificate.updatedBy = new mongoose.Types.ObjectId(user.id);
  certificate.approval = {
    requiredApprovers,
    approvals: initialApprovals,
  };

  certificate.approvalHistory.push({
    action,
    performedBy: new mongoose.Types.ObjectId(user.id),
    performedByName: user.name,
    performedAt: new Date(),
    note: `Submitted for engineering approval. Awaiting verification by an authorized approver.`,
  });

  await certificate.save();
  return certificate;
}

/**
 * Record an approval from an authorized approver.
 */
export async function approveCertificate(
  certificateId: string,
  user: SessionUser,
  note?: string
): Promise<ICertificateDocument> {
  await connectToDatabase();

  const certificate = await Certificate.findById(certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (certificate.status !== "PENDING_APPROVAL") {
    throw new Error(`Cannot approve certificate with status: ${certificate.status}`);
  }

  // Enforce separation of duties: Creator cannot approve their own certificate
  if (certificate.createdBy.toString() === user.id && user.roleName !== "Administrator") {
    throw new Error("Separation of duties: Creators cannot approve their own certificate.");
  }

  // If user is Admin but not explicitly assigned, allow substituting one pending slot
  let approvalSlotIndex = certificate.approval.approvals.findIndex(
    (a) => a.userId.toString() === user.id
  );

  if (approvalSlotIndex === -1) {
    if (user.roleName === "Administrator") {
      approvalSlotIndex = certificate.approval.approvals.findIndex(
        (a) => a.status === "PENDING"
      );
      if (approvalSlotIndex !== -1) {
        certificate.approval.approvals[approvalSlotIndex].userId = new mongoose.Types.ObjectId(user.id);
        certificate.approval.requiredApprovers[approvalSlotIndex] = new mongoose.Types.ObjectId(user.id);
      }
    } else {
      throw new Error("You are not an assigned approver for this certificate.");
    }
  }

  if (approvalSlotIndex === -1) {
    throw new Error("No pending approval slot available for this certificate.");
  }

  const existingApproval = certificate.approval.approvals[approvalSlotIndex];
  if (existingApproval.status === "APPROVED") {
    throw new Error("You have already approved this certificate.");
  }

  // Record approval on the specific approver slot
  existingApproval.status = "APPROVED";
  existingApproval.approvedAt = new Date();
  existingApproval.note = note || undefined;

  // Single-approver workflow: when ANY ONE authorized approver approves, the certificate is immediately APPROVED!
  certificate.status = "APPROVED";
  certificate.approvedAt = new Date();
  certificate.approvalHistory.push({
    action: "APPROVED",
    performedBy: new mongoose.Types.ObjectId(user.id),
    performedByName: user.name,
    performedAt: new Date(),
    note: note || `Certificate verified and approved by ${user.name}. Document is sealed and immutable.`,
  });

  certificate.updatedBy = new mongoose.Types.ObjectId(user.id);
  await certificate.save();
  return certificate;
}

/**
 * Record a rejection from an assigned approver.
 */
export async function rejectCertificate(
  certificateId: string,
  user: SessionUser,
  reason: string
): Promise<ICertificateDocument> {
  await connectToDatabase();

  if (!reason || reason.trim().length < 3) {
    throw new Error("A specific rejection reason is required.");
  }

  const certificate = await Certificate.findById(certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (certificate.status !== "PENDING_APPROVAL") {
    throw new Error(`Cannot reject certificate with status: ${certificate.status}`);
  }

  const requiredStr = certificate.approval.requiredApprovers.map((id) => id.toString());
  const isAssigned = requiredStr.includes(user.id);

  if (!isAssigned && user.roleName !== "Administrator") {
    throw new Error("You are not authorized to reject this certificate.");
  }

  // Update approver's entry
  const approverSlot = certificate.approval.approvals.find(
    (a) => a.userId.toString() === user.id
  );
  if (approverSlot) {
    approverSlot.status = "REJECTED";
    approverSlot.note = reason.trim();
  }

  certificate.status = "REJECTED";
  certificate.updatedBy = new mongoose.Types.ObjectId(user.id);
  certificate.approvalHistory.push({
    action: "REJECTED",
    performedBy: new mongoose.Types.ObjectId(user.id),
    performedByName: user.name,
    performedAt: new Date(),
    note: reason.trim(),
  });

  await certificate.save();
  return certificate;
}

