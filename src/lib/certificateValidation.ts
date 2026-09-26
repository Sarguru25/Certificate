import {
  AnyCertificateData,
  CertificateErrors,
  CertificateType,
  SolenoidValveCertificateData,
} from "@/types/certificate";

export const FIELD_LABELS: Record<string, string> = {
  customerName: "Customer Name",
  salesOrderNo: "Sales Order No",
  customerPO: "Customer PO",
  certificateDate: "Certificate Date",
  configuration: "Configuration",
  operatingVoltage: "Operating Voltage",
  coilType: "Coil Type",
  modelNumber: "Model Number",
  quantity: "Quantity",
  mounting: "Mounting",
  portSize: "Port Size",
  protectionType: "Protection Type",
  exproofType: "Exproof Type",
  switchingTestResult: "Switching Test Result",
  responseTimeResult: "Response Time Result",
  leakTestResult: "Leak Test Result",
  operatingPressureResult: "Operating Pressure Result",
  witnessedBy: "Performed By",
  verifiedBy: "Verified By",
};

export function validateCertificate(
  inputData: AnyCertificateData | Record<string, unknown>,
  certificateType: CertificateType | string = "solenoid-valve"
): {
  isValid: boolean;
  errors: CertificateErrors;
  firstErrorField?: string;
  missingFieldsList?: string[];
} {
  const d = inputData as Record<string, unknown>;

  if (certificateType !== "solenoid-valve") {
    const genericErrors: CertificateErrors = {};
    if (typeof d.customerName !== "string" || !d.customerName.trim()) {
      genericErrors.customerName = "Customer name is required";
    }
    const keys = Object.keys(genericErrors);
    return {
      isValid: keys.length === 0,
      errors: genericErrors,
      firstErrorField: keys[0],
      missingFieldsList: keys.map((k) => FIELD_LABELS[k] || k),
    };
  }

  const errors: CertificateErrors = {};
  const data = d as unknown as SolenoidValveCertificateData;

  if (!data.customerName?.trim()) {
    errors.customerName = "Customer name is required";
  }

  if (!data.salesOrderNo?.trim()) {
    errors.salesOrderNo = "Sales order number is required";
  }

  if (!data.customerPO?.trim()) {
    errors.customerPO = "Customer PO is required";
  }

  if (!data.certificateDate?.trim()) {
    errors.certificateDate = "Certificate date is required";
  }

  if (!data.configuration) {
    errors.configuration = "Configuration is required";
  }

  if (!data.operatingVoltage) {
    errors.operatingVoltage = "Operating voltage is required";
  }

  if (!data.coilType) {
    errors.coilType = "Coil type is required";
  }

  if (!data.modelNumber?.trim()) {
    errors.modelNumber = "Model number is required";
  }

  if (data.quantity === undefined || data.quantity === null || String(data.quantity).trim() === "") {
    errors.quantity = "Quantity is required";
  } else if (Number(data.quantity) <= 0 || isNaN(Number(data.quantity))) {
    errors.quantity = "Quantity must be a positive number";
  }

  if (!data.mounting) {
    errors.mounting = "Mounting is required";
  }

  if (!data.portSize) {
    errors.portSize = "Port size is required";
  }

  if (!data.protectionType) {
    errors.protectionType = "Protection type is required";
  } else if (data.protectionType === "Exproof" && !data.exproofType) {
    errors.exproofType = "Exproof type is required";
  }

  // Only validate test results if that test has not been explicitly omitted/disabled
  if (data.enabledTests?.switchingTest !== false && !data.switchingTestResult) {
    errors.switchingTestResult = "Switching test result is required";
  }

  if (data.enabledTests?.responseTime !== false && !data.responseTimeResult?.trim()) {
    errors.responseTimeResult = "Response time result is required";
  }

  if (data.enabledTests?.leakTest !== false && !data.leakTestResult?.trim()) {
    errors.leakTestResult = "Leak test result is required";
  }

  if (data.enabledTests?.operatingPressure !== false && !data.operatingPressureResult) {
    errors.operatingPressureResult = "Operating pressure result is required";
  }

  if (!data.witnessedBy?.trim()) {
    errors.witnessedBy = "Performed By is required";
  }

  if (!data.verifiedBy?.trim()) {
    errors.verifiedBy = "Verified By is required";
  }

  const errorKeys = Object.keys(errors);
  return {
    isValid: errorKeys.length === 0,
    errors,
    firstErrorField: errorKeys.length > 0 ? errorKeys[0] : undefined,
    missingFieldsList: errorKeys.map((k) => FIELD_LABELS[k] || k),
  };
}
