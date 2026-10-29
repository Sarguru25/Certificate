import mongoose from "mongoose";
import { Certificate, ICertificateDocument } from "@/models/Certificate";
import { CertificateSequence } from "@/models/CertificateSequence";
import {
  generateCertificateNumber,
  getPageCertificateNumber,
  calculateValveFunctionalTestPages,
} from "@/services/certificateNumberService";
import { submitCertificateForApproval } from "@/services/approvalService";
import { CertificateType, CertificateStatus } from "@/types/certificate";
import { SessionUser } from "@/types/auth";
import { connectToDatabase } from "@/lib/mongodb";

export interface CreateCertificateInput {
  certificateType: CertificateType;
  certificateData: Record<string, unknown>;
  initialStatus?: "DRAFT" | "PENDING_APPROVAL";
}

export interface ListCertificatesParams {
  certificateType?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function createCertificate(
  input: CreateCertificateInput,
  user: SessionUser
): Promise<ICertificateDocument> {
  await connectToDatabase();

  const lineItems = (input.certificateData as { lineItems?: unknown[] })?.lineItems;
  const pageCountInput =
    input.certificateType === "valve-functional-test"
      ? calculateValveFunctionalTestPages(input.certificateData)
      : Array.isArray(lineItems) && lineItems.length > 0
        ? lineItems.length
        : 1;

  // Atomically generate the official certificate number range reserving required page slots
  const certNumberResult = await generateCertificateNumber(input.certificateType, pageCountInput);
  const certificateNumber = certNumberResult.certificateNumber;
  const lastCertificateNumber = certNumberResult.lastCertificateNumber;
  const pageCount = certNumberResult.pageCount;

  const newCert = new Certificate({
    certificateNumber,
    lastCertificateNumber,
    pageCount,
    certificateType: input.certificateType,
    revision: 0,
    status: "DRAFT",
    createdBy: new mongoose.Types.ObjectId(user.id),
    updatedBy: new mongoose.Types.ObjectId(user.id),
    certificateData: input.certificateData,
    approval: {
      requiredApprovers: [],
      approvals: [],
    },
    approvalHistory: [
      {
        action: "CREATED",
        performedBy: new mongoose.Types.ObjectId(user.id),
        performedByName: user.name,
        performedAt: new Date(),
        note:
          pageCount > 1
            ? `Certificate draft created for ${pageCount} pages (${certificateNumber} - ${lastCertificateNumber})`
            : `Certificate draft created with number ${certificateNumber}`,
      },
    ],
  });

  await newCert.save();

  // If user requested immediate submission
  if (input.initialStatus === "PENDING_APPROVAL") {
    return await submitCertificateForApproval(newCert._id.toString(), user);
  }

  return newCert;
}

export async function getCertificateById(id: string): Promise<ICertificateDocument | null> {
  await connectToDatabase();

  return await Certificate.findById(id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("approval.requiredApprovers", "name email")
    .populate("approval.approvals.userId", "name email");
}

export async function updateCertificate(
  id: string,
  certificateData: Record<string, unknown>,
  user: SessionUser
): Promise<ICertificateDocument> {
  await connectToDatabase();

  const certificate = await Certificate.findById(id);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (certificate.status === "APPROVED") {
    throw new Error("Approved certificates are immutable and sealed.");
  }

  if (certificate.status === "PENDING_APPROVAL") {
    throw new Error("Cannot edit a certificate currently undergoing approval.");
  }

  // If editing a rejected certificate, it automatically returns to DRAFT
  const wasRejected = certificate.status === "REJECTED";
  if (wasRejected) {
    certificate.status = "DRAFT";
  }

  certificate.certificateData = certificateData;
  certificate.updatedBy = new mongoose.Types.ObjectId(user.id);

  // Recalculate pageCount and lastCertificateNumber if multi-page
  const lineItems = (certificateData as { lineItems?: unknown[] })?.lineItems;
  const newPageCount =
    certificate.certificateType === "valve-functional-test"
      ? calculateValveFunctionalTestPages(certificateData)
      : Array.isArray(lineItems) && lineItems.length > 0
        ? lineItems.length
        : 1;

  certificate.pageCount = newPageCount;
  certificate.lastCertificateNumber = getPageCertificateNumber(certificate.certificateNumber, newPageCount - 1);

  // If the new end certificate number extends the sequence, bump CertificateSequence so future certs won't collide
  const currentYear = new Date().getFullYear();
  const yyStr = String(currentYear).slice(-2);
  const match = certificate.lastCertificateNumber?.match(new RegExp(`^(?:ZIC|ZIN)${yyStr}(\\d{5})$`));
  if (match) {
    const endSeq = parseInt(match[1], 10);
    if (!isNaN(endSeq)) {
      await CertificateSequence.findOneAndUpdate(
        { certificateType: "ALL", year: currentYear, month: 0 },
        { $max: { lastSequence: endSeq } }
      );
    }
  }

  certificate.approvalHistory.push({
    action: "UPDATED",
    performedBy: new mongoose.Types.ObjectId(user.id),
    performedByName: user.name,
    performedAt: new Date(),
    note: wasRejected
      ? "Certificate corrected after rejection and returned to Draft."
      : "Draft certificate details updated.",
  });

  await certificate.save();
  return certificate;
}

export async function deleteCertificate(id: string, user: SessionUser): Promise<void> {
  await connectToDatabase();

  const certificate = await Certificate.findById(id);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (
    certificate.status !== "DRAFT" &&
    certificate.status !== "REJECTED" &&
    user.roleName !== "Administrator"
  ) {
    throw new Error(
      `Cannot delete certificate with status ${certificate.status}. Only DRAFT or REJECTED certificates may be deleted.`
    );
  }

  // Only creator, admin, or user with certificates.delete permission can delete
  if (
    certificate.createdBy.toString() !== user.id &&
    user.roleName !== "Administrator" &&
    !user.permissions.includes("certificates.delete")
  ) {
    throw new Error("You are not authorized to delete this certificate.");
  }

  await Certificate.findByIdAndDelete(id);
}

export async function cloneCertificate(
  id: string,
  user: SessionUser
): Promise<ICertificateDocument> {
  await connectToDatabase();

  const source = await Certificate.findById(id);
  if (!source) {
    throw new Error("Source certificate not found");
  }

  const lineItems = (source.certificateData as { lineItems?: unknown[] })?.lineItems;
  const pageCountInput =
    source.certificateType === "valve-functional-test"
      ? calculateValveFunctionalTestPages(source.certificateData)
      : Array.isArray(lineItems) && lineItems.length > 0
        ? lineItems.length
        : 1;

  const certNumberResult = await generateCertificateNumber(
    source.certificateType as CertificateType,
    pageCountInput
  );
  const certificateNumber = certNumberResult.certificateNumber;
  const lastCertificateNumber = certNumberResult.lastCertificateNumber;
  const pageCount = certNumberResult.pageCount;

  const cloned = new Certificate({
    certificateNumber,
    lastCertificateNumber,
    pageCount,
    certificateType: source.certificateType,
    revision: 0,
    status: "DRAFT",
    createdBy: new mongoose.Types.ObjectId(user.id),
    updatedBy: new mongoose.Types.ObjectId(user.id),
    certificateData: { ...source.certificateData },
    approval: {
      requiredApprovers: [],
      approvals: [],
    },
    approvalHistory: [
      {
        action: "CREATED",
        performedBy: new mongoose.Types.ObjectId(user.id),
        performedByName: user.name,
        performedAt: new Date(),
        note:
          pageCount > 1
            ? `Certificate cloned from ${source.certificateNumber} as new draft range (${certificateNumber} - ${lastCertificateNumber})`
            : `Certificate cloned from ${source.certificateNumber} as new draft ${certificateNumber}`,
      },
    ],
  });

  await cloned.save();
  return cloned;
}

export async function listCertificates(params: ListCertificatesParams) {
  await connectToDatabase();

  const {
    certificateType,
    status,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const query: Record<string, unknown> = {};

  if (certificateType && certificateType !== "all") {
    query.certificateType = certificateType;
  }

  if (status && status !== "all") {
    query.status = status.toUpperCase() as CertificateStatus;
  }

  if (search && search.trim()) {
    const term = search.trim();
    const regex = new RegExp(term, "i");
    query.$or = [
      { certificateNumber: regex },
      { lastCertificateNumber: regex },
      { "certificateData.customerName": regex },
      { "certificateData.salesOrderNo": regex },
      { "certificateData.modelNumber": regex },
      { "certificateData.customerPO": regex },
      { "certificateData.productName": regex },
      { "certificateData.productDescription": regex },
      { "certificateData.valveType": regex },
      { "certificateData.actuatorModel": regex },
    ];
  }

  if (startDate || endDate) {
    const dateQuery: Record<string, unknown> = {};
    if (startDate) {
      dateQuery.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }
    query.createdAt = dateQuery;
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  // Base query without status filter to calculate status breakdown for the current search/filters
  const queryWithoutStatus = { ...query };
  delete queryWithoutStatus.status;

  const [items, total, draftCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    Certificate.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .populate("approval.requiredApprovers", "name email")
      .populate("updatedBy", "name email")
      .lean(),
    Certificate.countDocuments(query),
    Certificate.countDocuments({ ...queryWithoutStatus, status: "DRAFT" }),
    Certificate.countDocuments({ ...queryWithoutStatus, status: "PENDING_APPROVAL" }),
    Certificate.countDocuments({ ...queryWithoutStatus, status: "APPROVED" }),
    Certificate.countDocuments({ ...queryWithoutStatus, status: "REJECTED" }),
  ]);

  // Ensure items are plain objects with string IDs for Next.js Server->Client Component serialization
  const plainItems = JSON.parse(JSON.stringify(items)) as typeof items;

  return {
    items: plainItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    counts: {
      total,
      draft: draftCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
    },
  };
}

export async function getDashboardStats() {
  await connectToDatabase();

  const [
    totalCount,
    draftCount,
    pendingCount,
    rejectedCount,
    approvedCount,
    typeCounts,
  ] = await Promise.all([
    Certificate.countDocuments(),
    Certificate.countDocuments({ status: "DRAFT" }),
    Certificate.countDocuments({ status: "PENDING_APPROVAL" }),
    Certificate.countDocuments({ status: "REJECTED" }),
    Certificate.countDocuments({ status: "APPROVED" }),
    Certificate.aggregate([
      {
        $group: {
          _id: "$certificateType",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const countsByType: Record<string, number> = {
    "solenoid-valve": 0,
    "electric-actuator": 0,
    "limit-switch": 0,
    "pneumatic-actuator": 0,
    "warranty-certificate": 0,
    "valve-functional-test": 0,
  };

  typeCounts.forEach((item) => {
    if (item._id in countsByType) {
      countsByType[item._id] = item.count;
    }
  });

  return {
    total: totalCount,
    draft: draftCount,
    pending: pendingCount,
    rejected: rejectedCount,
    approved: approvedCount,
    countsByType,
  };
}
