import { z } from "zod";

export const solenoidValveCertificateSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  salesOrderNo: z.string().min(1, "Sales order number is required"),
  customerPO: z.string().min(1, "Customer PO is required"),
  customerPODate: z.string().optional(),
  certificateDate: z.string().min(1, "Certificate date is required"),

  valveType: z.string().default("Solenoid Valve"),
  configuration: z.enum([
    "5/2 Way",
    "3/2 Way",
    "5/2 & 3/2 Way (Bistable)",
  ]),
  operatingVoltage: z.enum(["24 V DC", "220 V AC", "110 V DC"]),
  coilType: z.enum(["Normally Closed (NC)", "Normally Open (NO)"]),
  manufacturer: z.string().optional(),
  modelNumber: z.string().min(1, "Model number is required"),
  quantity: z
    .union([z.number(), z.string()])
    .refine((val) => Number(val) > 0, {
      message: "Quantity must be a positive number",
    }),
  mounting: z.enum(["Namur", "Non Namur"]),
  portSize: z.enum(['1/4" BSP', '1/2" BSP']),
  protectionType: z.enum(["Weather", "Exproof"]),
  protectionRating: z.string().default("IP66"),
  exproofType: z.string().optional(),

  switchingTestCriteria: z.string().optional(),
  switchingTestResult: z.enum(["OK", "Not OK"]),
  responseTimeCriteria: z.string().optional(),
  responseTimeResult: z.string().min(1, "Response time result is required"),
  leakTestCriteria: z.string().optional(),
  leakTestResult: z.string().min(1, "Leak test result is required"),
  operatingPressureCriteria: z.string().optional(),
  operatingPressureResult: z.enum(["OK", "Not OK"]),

  witnessedBy: z.string().min(1, "Performed by is required"),
  verifiedBy: z.string().min(1, "Verified by is required"),
  showSignatures: z.boolean().default(true),
  witnessSignatureUrl: z.string().optional(),
  verifiedSignatureUrl: z.string().optional(),
});

export const rejectCertificateSchema = z.object({
  reason: z.string().min(3, "Rejection reason must be at least 3 characters long"),
});

export const approveCertificateSchema = z.object({
  note: z.string().optional(),
});
