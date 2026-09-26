import { CertificateData } from "@/types/certificate";

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "-";
  // If already formatted like DD-MM-YYYY or DD.MM.YYYY
  if (/^\d{2}[-.]\d{2}[-.]\d{4}$/.test(dateStr.trim())) {
    return dateStr.trim().replace(/\./g, "-");
  }
  // If YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return dateStr;
}

export function formatPoDate(dateStr?: string): string {
  if (!dateStr) return "";
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  }
  return dateStr;
}

export function formatVoltageCriteria(voltage: string): string {
  if (!voltage) return "24V DC";
  // 24 V DC -> 24V DC
  return voltage.replace(/\s+V\s+/, "V ");
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DEFAULT_CERTIFICATE_DATA: CertificateData = {
  customerName: "",
  salesOrderNo: "",
  customerPO: "",
  customerPODate: getTodayIsoDate(),
  certificateDate: getTodayIsoDate(),

  valveType: "Solenoid Valve",
  configuration: "5/2 Way",
  operatingVoltage: "24 V DC",
  coilType: "Normally Closed (NC)",
  manufacturer: "Zeetork",
  modelNumber: "ZLV310F30A",
  quantity: 6,
  mounting: "Namur",
  portSize: "1/4\" BSP",
  protectionType: "Weather",
  protectionRating: "IP66",
  exproofType: "Exdb IIIC T6 Gb",

  switchingTestCriteria: "24V DC",
  switchingTestResult: "OK",
  responseTimeCriteria: "< 20 ms",
  responseTimeResult: "15 ms",
  leakTestCriteria: "Air @ 6 bar",
  leakTestResult: "No leakage",
  operatingPressureCriteria: "0.5 – 10 bar",
  operatingPressureResult: "OK",

  witnessedBy: "SIVAGANESHAN.V.A",
  verifiedBy: "KARTHIKEYAN.A",
  showSignatures: true,
  witnessSignatureUrl: "/signature-sivaganeshan.png",
  verifiedSignatureUrl: "/signature-karthikeyan.jpeg",
};

export const SAMPLE_CERTIFICATE_DATA: CertificateData = {
  customerName: "Armatury Bauen Olomouc Controls Private Limited",
  salesOrderNo: "ZIS26270145",
  customerPO: "PO00900",
  customerPODate: "2026-09-10",
  certificateDate: "2026-09-14",

  valveType: "Solenoid Valve",
  configuration: "5/2 Way",
  operatingVoltage: "24 V DC",
  coilType: "Normally Closed (NC)",
  manufacturer: "Zeetork",
  modelNumber: "ZLV310F30A",
  quantity: 6,
  mounting: "Namur",
  portSize: "1/4\" BSP",
  protectionType: "Weather",
  protectionRating: "IP66",
  exproofType: "Exdb IIIC T6 Gb",

  switchingTestCriteria: "24V DC",
  switchingTestResult: "OK",
  responseTimeCriteria: "< 20 ms",
  responseTimeResult: "15 ms",
  leakTestCriteria: "Air @ 6 bar",
  leakTestResult: "No leakage",
  operatingPressureCriteria: "0.5 – 10 bar",
  operatingPressureResult: "OK",

  witnessedBy: "SIVAGANESHAN.V.A",
  verifiedBy: "KARTHIKEYAN.A",
  showSignatures: true,
  witnessSignatureUrl: "/signature-sivaganeshan.png",
  verifiedSignatureUrl: "/signature-karthikeyan.jpeg",
};

export const MANUFACTURER_OPTIONS = ["Zeetork"];
export const CONFIGURATION_OPTIONS = [
  "5/2 Way",
  "3/2 Way",
  "5/2 & 3/2 Way (Bistable)",
] as const;
export const OPERATING_VOLTAGE_OPTIONS = [
  "24 V DC",
  "220 V AC",
  "110 V DC",
] as const;
export const COIL_TYPE_OPTIONS = [
  "Normally Closed (NC)",
  "Normally Open (NO)",
] as const;
export const MOUNTING_OPTIONS = ["Namur", "Non Namur"] as const;
export const PORT_SIZE_OPTIONS = ["1/4\" BSP", "1/2\" BSP"] as const;
export const PROTECTION_TYPE_OPTIONS = ["Weather", "Exproof"] as const;
export const EXPROOF_TYPE_OPTIONS = [
  "Exdb IIIC T6 Gb",
  "Extb IIICT80°C Db",
] as const;
export const TEST_STATUS_OPTIONS = ["OK", "Not OK"] as const;
