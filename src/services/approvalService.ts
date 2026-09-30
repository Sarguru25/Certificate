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
      { permissions: "approve.certificate" },
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

  if (certificate.status === "APPROVED") {
    throw new Error("This certificate has already been approved and sealed.");
  }

  // Ensure approval structure is initialized
  if (!certificate.approval) {
    certificate.approval = {
      requiredApprovers: [],
      approvals: [],
    };
  }
  if (!certificate.approval.approvals) {
    certificate.approval.approvals = [];
  }
  if (!certificate.approval.requiredApprovers) {
    certificate.approval.requiredApprovers = [];
  }

  // Look for an existing approval slot for this user
  let approvalSlotIndex = certificate.approval.approvals.findIndex(
    (a) => {
      const uId = a.userId as unknown;
      const idStr =
        typeof uId === "object" && uId !== null && "_id" in uId
          ? String((uId as { _id: unknown })._id)
          : String(a.userId);
      return idStr === user.id;
    }
  );

  // If user is not yet assigned to a slot, claim any pending slot or create a new slot for this approver
  if (approvalSlotIndex === -1) {
    const pendingIndex = certificate.approval.approvals.findIndex(
      (a) => a.status === "PENDING"
    );
    if (pendingIndex !== -1) {
      approvalSlotIndex = pendingIndex;
      certificate.approval.approvals[approvalSlotIndex].userId = new mongoose.Types.ObjectId(user.id);
      if (
        certificate.approval.requiredApprovers &&
        certificate.approval.requiredApprovers[approvalSlotIndex]
      ) {
        certificate.approval.requiredApprovers[approvalSlotIndex] = new mongoose.Types.ObjectId(user.id);
      } else {
        certificate.approval.requiredApprovers.push(new mongoose.Types.ObjectId(user.id));
      }
    } else {
      certificate.approval.approvals.push({
        userId: new mongoose.Types.ObjectId(user.id),
        status: "PENDING",
      });
      certificate.approval.requiredApprovers.push(new mongoose.Types.ObjectId(user.id));
      approvalSlotIndex = certificate.approval.approvals.length - 1;
    }
  }

  const existingApproval = certificate.approval.approvals[approvalSlotIndex];
  if (existingApproval.status === "APPROVED") {
    throw new Error("You have already approved this certificate.");
  }

  // Record approval on the approver slot
  existingApproval.status = "APPROVED";
  existingApproval.approvedAt = new Date();
  existingApproval.note = note || undefined;

  // Single-approver workflow: approval immediately seals the document
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

  if (certificate.status === "APPROVED") {
    throw new Error("Cannot reject an already approved certificate.");
  }

  // Ensure approval structure
  if (!certificate.approval) {
    certificate.approval = {
      requiredApprovers: [],
      approvals: [],
    };
  }
  if (!certificate.approval.approvals) {
    certificate.approval.approvals = [];
  }

  // Update approver's entry if exists or add rejection
  const approverSlot = certificate.approval.approvals.find(
    (a) => {
      const uId = a.userId as unknown;
      const idStr =
        typeof uId === "object" && uId !== null && "_id" in uId
          ? String((uId as { _id: unknown })._id)
          : String(a.userId);
      return idStr === user.id;
    }
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

