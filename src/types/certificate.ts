export type CertificateType =
  | "solenoid-valve"
  | "electric-actuator"
  | "limit-switch"
  | "pneumatic-actuator"
  | "warranty-certificate";

export type CertificateStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "REJECTED"
  | "APPROVED";

export interface CustomField {
  id: string;
  name: string;
  value: string;
  result?: string;
}

export interface SectionCustomFields {
  [sectionKey: string]: CustomField[];
}

export type ConfigurationType =
  | "5/2 Way"
  | "3/2 Way"
  | "5/2 & 3/2 Way (Bistable)"
  | string;

export type OperatingVoltageType =
  | "24 V DC"
  | "220 V AC"
  | "110 V DC"
  | string;

export type CoilType =
  | "Normally Closed (NC)"
  | "Normally Open (NO)"
  | string;

export type MountingType = "Namur" | "Non Namur" | string;
export type PortSizeType = "1/4\" BSP" | "1/2\" BSP" | string;
export type ProtectionType = "Weather" | "Exproof" | string;
export type ExproofType = "Exdb IIIC T6 Gb" | "Extb IIICT80°C Db" | string;
export type TestResultStatus = "OK" | "Not OK" | "Pass" | "Fail" | string;

export interface SolenoidValveCertificateData {
  customerName: string;
  salesOrderNo: string;
  salesOrderDate?: string;
  customerPO: string;
  customerPODate: string;
  certificateDate: string;
  testingLocation?: string;

  valveType?: string;
  configuration?: ConfigurationType;
  operatingVoltage?: OperatingVoltageType;
  coilType?: CoilType;
  manufacturer?: string;
  modelNumber?: string;
  quantity?: number | string;
  mounting?: MountingType;
  portSize?: PortSizeType;
  protectionType?: ProtectionType;
  protectionRating?: string;
  exproofType?: ExproofType;

  switchingTestCriteria?: string;
  switchingTestResult?: TestResultStatus;
  responseTimeCriteria?: string;
  responseTimeResult?: string;
  leakTestCriteria?: string;
  leakTestResult?: string;
  operatingPressureCriteria?: string;
  operatingPressureResult?: TestResultStatus;

  witnessedBy?: string;
  verifiedBy?: string;
  showSignatures?: boolean;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  remarks?: string;

  customFields?: SectionCustomFields;
  enabledTests?: Record<string, boolean>;
}

export type CertificateData = SolenoidValveCertificateData;

export interface ElectricActuatorCertificateData {
  customerName: string;
  salesOrderNo: string;
  salesOrderDate?: string;
  customerPO: string;
  customerPODate?: string;
  certificateDate: string;
  testingLocation?: string;

  productName?: string;
  modelNumber?: string;
  serialNumber?: string;
  quantity?: number | string;
  operatingVoltage?: string;
  actuatorType?: string;
  ratedTorque?: string;
  torque?: string;
  temperature?: string;
  dateOfTest?: string;

  visualInspectionCriteria?: string;
  visualInspectionMeasured?: string;
  visualInspectionResult?: string;

  supplyVoltageCriteria?: string;
  supplyVoltageMeasured?: string;
  supplyVoltageResult?: string;

  currentConsumptionCriteria?: string;
  currentConsumptionMeasured?: string;
  currentConsumptionResult?: string;

  rotationAngleCriteria?: string;
  rotationAngleMeasured?: string;
  rotationAngleResult?: string;

  operatingTimeCriteria?: string;
  operatingTimeMeasured?: string;
  operatingTimeResult?: string;

  functionalTestCriteria?: string;
  functionalTestMeasured?: string;
  functionalTestResult?: string;

  witnessedBy: string;
  verifiedBy: string;
  showSignatures?: boolean;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  remarks?: string;

  customFields?: SectionCustomFields;
  enabledTests?: Record<string, boolean>;
}

export interface LimitSwitchCertificateData {
  customerName: string;
  salesOrderNo: string;
  salesOrderDate?: string;
  customerPO: string;
  customerPODate?: string;
  certificateDate: string;
  testingLocation?: string;

  productName?: string;
  modelNumber: string;
  serialNumber?: string;
  quantity: number | string;
  switchType?: string;
  contactType?: string;
  operatingVoltage?: string;
  ratedCurrent?: string;
  temperature?: string;
  enclosure?: string;
  dateOfTest?: string;

  visualInspectionCriteria?: string;
  visualInspectionMeasured?: string;
  visualInspectionResult?: string;

  mechanicalOperationCriteria?: string;
  mechanicalOperationMeasured?: string;
  mechanicalOperationResult?: string;

  contactFunctionalityCriteria?: string;
  contactFunctionalityMeasured?: string;
  contactFunctionalityResult?: string;

  witnessedBy: string;
  verifiedBy: string;
  showSignatures?: boolean;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  remarks?: string;

  customFields?: SectionCustomFields;
  enabledTests?: Record<string, boolean>;
}

export interface WarrantyCertificateData {
  customerName: string;
  salesOrderNo?: string;
  salesOrderDate?: string;
  customerPO?: string;
  customerPODate?: string;
  certificateDate?: string;
  testingLocation?: string;

  invoiceNo?: string;
  invoiceDate?: string;
  orderNo?: string;

  productDescription?: string;
  salutation?: string;
  warrantyPeriod?: string;
  warrantyNote?: string;
  serialNumbers?: string;
  declarationText?: string;

  issuedBy?: string;
  authorizedSignatory?: string;
  witnessedBy?: string;
  verifiedBy?: string;
  showSignatures?: boolean;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  remarks?: string;

  customFields?: SectionCustomFields;
  enabledTests?: Record<string, boolean>;
}

export interface PneumaticActuatorLineItem {
  id?: string;
  sNo: number;
  actuatorMake: string;
  actuatorModel: string;
  springQty: string;
  actuatorSerialNo: string;
  accessoriesCheck: string;
  testPrBar: string;
  stroke1Open: string;
  stroke1Close: string;
  stroke2Open: string;
  stroke2Close: string;
  stroke3Open: string;
  stroke3Close: string;
  result: string;
}

export interface PneumaticActuatorCertificateData {
  customerName: string;
  salesOrderNo: string;
  salesOrderDate?: string;
  customerPO: string;
  customerPODate?: string;
  certificateDate: string;
  testingLocation?: string;

  lineItems: PneumaticActuatorLineItem[];

  witnessedBy: string;
  verifiedBy: string;
  showSignatures?: boolean;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  remarks?: string;

  customFields?: SectionCustomFields;
}

export type AnyCertificateData =
  | SolenoidValveCertificateData
  | ElectricActuatorCertificateData
  | LimitSwitchCertificateData
  | WarrantyCertificateData
  | PneumaticActuatorCertificateData;

export type CertificateErrors = Record<string, string>;

export interface AuditEntry {
  action: string;
  performedBy: unknown;
  performedByName: string;
  performedAt: Date | string;
  note?: string;
}

export interface ApprovalRecord {
  userId: unknown;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: Date | string;
  note?: string;
  userName?: string;
  userEmail?: string;
}

export interface CertificateApproval {
  requiredApprovers: unknown[];
  approvals: ApprovalRecord[];
}

export interface CertificateCreator {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface ICertificate {
  _id: string;
  certificateNumber: string;
  certificateType: CertificateType;
  revision: number;
  parentCertificateId?: string;
  status: CertificateStatus;
  createdBy: CertificateCreator | { _id?: string; name?: string; email?: string };
  updatedBy?: CertificateCreator | { _id?: string; name?: string; email?: string };
  submittedAt?: Date | string;
  approvedAt?: Date | string;
  certificateData: AnyCertificateData | Record<string, unknown>;
  approval?: CertificateApproval;
  approvalHistory: AuditEntry[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
