"use client";

import React, { useState, useEffect } from "react";
import {
  SolenoidValveCertificateData,
  CertificateErrors,
  ConfigurationType,
  OperatingVoltageType,
  CoilType,
  MountingType,
  PortSizeType,
  ProtectionType,
  ExproofType,
  TestResultStatus,
  CustomField,
} from "@/types/certificate";
import { CustomFieldsEditor } from "../common/CustomFieldsEditor";
import {
  CONFIGURATION_OPTIONS,
  OPERATING_VOLTAGE_OPTIONS,
  COIL_TYPE_OPTIONS,
  MOUNTING_OPTIONS,
  PORT_SIZE_OPTIONS,
  PROTECTION_TYPE_OPTIONS,
  EXPROOF_TYPE_OPTIONS,
  TEST_STATUS_OPTIONS,
  formatVoltageCriteria,
} from "@/lib/certificateDefaults";
import {
  FileText,
  Settings,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SolenoidValveFormProps {
  data: SolenoidValveCertificateData;
  onChange: (newData: SolenoidValveCertificateData) => void;
  errors: CertificateErrors;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
}

export const SolenoidValveForm: React.FC<SolenoidValveFormProps> = ({
  data,
  onChange,
  errors,
  onSaveDraft,
  onSubmitForApproval,
  onCancel,
  isSaving = false,
  submitLabel = "Save & Submit for Approval",
}) => {
  const [openSections, setOpenSections] = useState({
    info: true,
    product: true,
    tests: true,
    verification: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-expand sections when errors exist in them
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;
    const errorKeys = Object.keys(errors);
    const infoFields = ["customerName", "salesOrderNo", "certificateDate", "customerPO"];
    const productFields = ["configuration", "operatingVoltage", "coilType", "modelNumber", "quantity", "mounting", "portSize", "protectionType", "exproofType"];
    const testFields = ["switchingTestResult", "responseTimeResult", "leakTestResult", "operatingPressureResult"];
    const verificationFields = ["witnessedBy", "verifiedBy"];

    setOpenSections((prev) => ({
      info: prev.info || errorKeys.some((k) => infoFields.includes(k)),
      product: prev.product || errorKeys.some((k) => productFields.includes(k)),
      tests: prev.tests || errorKeys.some((k) => testFields.includes(k)),
      verification: prev.verification || errorKeys.some((k) => verificationFields.includes(k)),
    }));
  }, [errors]);

  const handleChange = <K extends keyof SolenoidValveCertificateData>(
    field: K,
    value: SolenoidValveCertificateData[K]
  ) => {
    const updated = { ...data, [field]: value };

    if (field === "operatingVoltage") {
      updated.switchingTestCriteria = formatVoltageCriteria(value as string);
    }

    if (field === "protectionType") {
      if (value === "Weather") {
        updated.protectionRating = "IP66";
      } else if (value === "Exproof" && !updated.exproofType) {
        updated.exproofType = "Exdb IIIC T6 Gb";
      }
    }

    onChange(updated);
  };

  const handleCustomFieldsChange = (
    section: "general" | "product" | "tests",
    fields: CustomField[]
  ) => {
    const customFields = {
      ...(data.customFields || {}),
      [section]: fields,
    };
    onChange({ ...data, customFields });
  };

  const handleTestToggle = (testKey: string, enabled: boolean) => {
    const enabledTests = {
      ...(data.enabledTests || {}),
      [testKey]: enabled,
    };
    onChange({ ...data, enabledTests });
  };

  const isTestEnabled = (testKey: string) => {
    return data.enabledTests?.[testKey] !== false;
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: CERTIFICATE INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("info")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-200 text-left font-bold text-slate-800 text-sm hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FF2D01]" />
            <span>1. General Certificate Information</span>
          </div>
          {openSections.info ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.info && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                data-field="customerName"
                value={data.customerName ?? ""}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="e.g. Armatury Bauen Olomouc Controls Private Limited"
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.customerName ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.customerName && (
                <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sales Order No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                data-field="salesOrderNo"
                value={data.salesOrderNo ?? ""}
                onChange={(e) => handleChange("salesOrderNo", e.target.value)}
                placeholder="e.g. ZIS26270145"
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.salesOrderNo ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.salesOrderNo && (
                <p className="text-xs text-red-600 mt-1">{errors.salesOrderNo}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Certificate Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                data-field="certificateDate"
                value={data.certificateDate ?? ""}
                onChange={(e) => handleChange("certificateDate", e.target.value)}
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.certificateDate ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.certificateDate && (
                <p className="text-xs text-red-600 mt-1">{errors.certificateDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer PO <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                data-field="customerPO"
                value={data.customerPO ?? ""}
                onChange={(e) => handleChange("customerPO", e.target.value)}
                placeholder="e.g. PO00900"
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.customerPO ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.customerPO && (
                <p className="text-xs text-red-600 mt-1">{errors.customerPO}</p>
              )}
            </div>

            <div className="sm:col-span-2 pt-2">
              <CustomFieldsEditor
                label="Custom General Fields"
                sectionName="General Information"
                fields={data.customFields?.general || []}
                onChange={(fields) => handleCustomFieldsChange("general", fields)}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PRODUCT INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("product")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-200 text-left font-bold text-slate-800 text-sm hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#FF2D01]" />
            <span>2. Product Parameters</span>
          </div>
          {openSections.product ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.product && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valve Type
              </label>
              <input
                type="text"
                disabled
                value={data.valveType ?? "Solenoid Valve"}
                className="w-full text-sm border border-slate-200 bg-slate-100 text-slate-500 rounded-xl px-3 py-2 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Configuration <span className="text-red-500">*</span>
              </label>
              <select
                data-field="configuration"
                value={data.configuration}
                onChange={(e) => handleChange("configuration", e.target.value as ConfigurationType)}
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.configuration ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              >
                {CONFIGURATION_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.configuration && (
                <p className="text-xs text-red-600 mt-1">{errors.configuration}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Voltage <span className="text-red-500">*</span>
              </label>
              <select
                data-field="operatingVoltage"
                value={data.operatingVoltage}
                onChange={(e) => handleChange("operatingVoltage", e.target.value as OperatingVoltageType)}
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.operatingVoltage ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              >
                {OPERATING_VOLTAGE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {errors.operatingVoltage && (
                <p className="text-xs text-red-600 mt-1">{errors.operatingVoltage}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coil Type <span className="text-red-500">*</span>
              </label>
              <select
                data-field="coilType"
                value={data.coilType}
                onChange={(e) => handleChange("coilType", e.target.value as CoilType)}
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.coilType ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              >
                {COIL_TYPE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.coilType && (
                <p className="text-xs text-red-600 mt-1">{errors.coilType}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                data-field="modelNumber"
                value={data.modelNumber ?? ""}
                onChange={(e) => handleChange("modelNumber", e.target.value)}
                placeholder="e.g. ZLV310F30A"
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.modelNumber ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.modelNumber && (
                <p className="text-xs text-red-600 mt-1">{errors.modelNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                data-field="quantity"
                value={data.quantity ?? ""}
                onChange={(e) => handleChange("quantity", e.target.value === "" ? "" : Number(e.target.value))}
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.quantity ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.quantity && (
                <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mounting <span className="text-red-500">*</span>
              </label>
              <select
                data-field="mounting"
                value={data.mounting}
                onChange={(e) => handleChange("mounting", e.target.value as MountingType)}
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.mounting ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              >
                {MOUNTING_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.mounting && (
                <p className="text-xs text-red-600 mt-1">{errors.mounting}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Port Size <span className="text-red-500">*</span>
              </label>
              <select
                data-field="portSize"
                value={data.portSize}
                onChange={(e) => handleChange("portSize", e.target.value as PortSizeType)}
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.portSize ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              >
                {PORT_SIZE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.portSize && (
                <p className="text-xs text-red-600 mt-1">{errors.portSize}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Protection Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  data-field="protectionType"
                  value={data.protectionType}
                  onChange={(e) => handleChange("protectionType", e.target.value as ProtectionType)}
                  className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                    errors.protectionType ? "border-red-400 bg-red-50/30" : "border-slate-300"
                  }`}
                >
                  {PROTECTION_TYPE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                {data.protectionType === "Weather" ? (
                  <input
                    type="text"
                    disabled
                    value="IP66"
                    className="w-full text-sm border border-slate-200 bg-slate-100 text-slate-600 rounded-xl px-3 py-2 text-center"
                  />
                ) : (
                  <select
                    data-field="exproofType"
                    value={data.exproofType ?? "Exdb IIIC T6 Gb"}
                    onChange={(e) => handleChange("exproofType", e.target.value as ExproofType)}
                    className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                      errors.exproofType ? "border-red-400 bg-red-50/30" : "border-slate-300"
                    }`}
                  >
                    {EXPROOF_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {errors.protectionType && (
                <p className="text-xs text-red-600 mt-1">{errors.protectionType}</p>
              )}
              {errors.exproofType && (
                <p className="text-xs text-red-600 mt-1">{errors.exproofType}</p>
              )}
            </div>

            <div className="sm:col-span-2 pt-2">
              <CustomFieldsEditor
                label="Custom Product Fields"
                sectionName="Product Information"
                fields={data.customFields?.product || []}
                onChange={(fields) => handleCustomFieldsChange("product", fields)}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: TEST PARAMETERS & RESULTS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("tests")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-200 text-left font-bold text-slate-800 text-sm hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF2D01]" />
            <span>3. Test Parameters & Inspection Results</span>
          </div>
          {openSections.tests ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.tests && (
          <div className="p-4 space-y-3">
            {/* Switching Test */}
            <div className={`p-3 rounded-xl border transition ${
              isTestEnabled("switchingTest")
                ? "bg-slate-50/80 border-slate-200"
                : "bg-slate-100/60 border-slate-200/60 opacity-70"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("switchingTest")}
                    onChange={(e) => handleTestToggle("switchingTest", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Switching Test
                  </span>
                </label>
                {!isTestEnabled("switchingTest") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("switchingTest") && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-200/60">
                  <div className="sm:col-span-4 text-xs text-slate-600">
                    Voltage: {data.switchingTestCriteria || data.operatingVoltage}
                  </div>
                  <div className="sm:col-span-8">
                    <select
                      data-field="switchingTestResult"
                      value={data.switchingTestResult}
                      onChange={(e) => handleChange("switchingTestResult", e.target.value as TestResultStatus)}
                      className={`w-full text-sm border rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] font-semibold text-slate-800 bg-white ${
                        errors.switchingTestResult ? "border-red-400 bg-red-50/30" : "border-slate-300"
                      }`}
                    >
                      {TEST_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.switchingTestResult && (
                      <p className="text-xs text-red-600 mt-1">{errors.switchingTestResult}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Response Time */}
            <div className={`p-3 rounded-xl border transition ${
              isTestEnabled("responseTime")
                ? "bg-slate-50/80 border-slate-200"
                : "bg-slate-100/60 border-slate-200/60 opacity-70"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("responseTime")}
                    onChange={(e) => handleTestToggle("responseTime", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Response Time
                  </span>
                </label>
                {!isTestEnabled("responseTime") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("responseTime") && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-200/60">
                  <div className="sm:col-span-4 text-xs text-slate-600">
                    Criteria: &lt; 20 ms
                  </div>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      data-field="responseTimeResult"
                      value={data.responseTimeResult ?? ""}
                      onChange={(e) => handleChange("responseTimeResult", e.target.value)}
                      placeholder="e.g. 15 ms"
                      className={`w-full text-sm border rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white font-medium ${
                        errors.responseTimeResult ? "border-red-400 bg-red-50/30" : "border-slate-300"
                      }`}
                    />
                    {errors.responseTimeResult && (
                      <p className="text-xs text-red-600 mt-1">{errors.responseTimeResult}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Leak Test */}
            <div className={`p-3 rounded-xl border transition ${
              isTestEnabled("leakTest")
                ? "bg-slate-50/80 border-slate-200"
                : "bg-slate-100/60 border-slate-200/60 opacity-70"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("leakTest")}
                    onChange={(e) => handleTestToggle("leakTest", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Leak Test
                  </span>
                </label>
                {!isTestEnabled("leakTest") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("leakTest") && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-200/60">
                  <div className="sm:col-span-4 text-xs text-slate-600">
                    Criteria: Air @ 6 bar
                  </div>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      data-field="leakTestResult"
                      value={data.leakTestResult ?? ""}
                      onChange={(e) => handleChange("leakTestResult", e.target.value)}
                      placeholder="e.g. No leakage"
                      className={`w-full text-sm border rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white font-medium ${
                        errors.leakTestResult ? "border-red-400 bg-red-50/30" : "border-slate-300"
                      }`}
                    />
                    {errors.leakTestResult && (
                      <p className="text-xs text-red-600 mt-1">{errors.leakTestResult}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Operating Pressure */}
            <div className={`p-3 rounded-xl border transition ${
              isTestEnabled("operatingPressure")
                ? "bg-slate-50/80 border-slate-200"
                : "bg-slate-100/60 border-slate-200/60 opacity-70"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("operatingPressure")}
                    onChange={(e) => handleTestToggle("operatingPressure", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Operating Pressure
                  </span>
                </label>
                {!isTestEnabled("operatingPressure") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("operatingPressure") && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-200/60">
                  <div className="sm:col-span-4 text-xs text-slate-600">
                    Criteria: 0.5 – 10 bar
                  </div>
                  <div className="sm:col-span-8">
                    <select
                      data-field="operatingPressureResult"
                      value={data.operatingPressureResult}
                      onChange={(e) => handleChange("operatingPressureResult", e.target.value as TestResultStatus)}
                      className={`w-full text-sm border rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] font-semibold text-slate-800 bg-white ${
                        errors.operatingPressureResult ? "border-red-400 bg-red-50/30" : "border-slate-300"
                      }`}
                    >
                      {TEST_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.operatingPressureResult && (
                      <p className="text-xs text-red-600 mt-1">{errors.operatingPressureResult}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Test Parameters */}
            <div className="pt-2">
              <CustomFieldsEditor
                label="Custom Test Parameters"
                sectionName="Test Parameters & Results"
                fields={data.customFields?.tests || []}
                showResultField={true}
                onChange={(fields) => handleCustomFieldsChange("tests", fields)}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: SIGNATORIES */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("verification")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-200 text-left font-bold text-slate-800 text-sm hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FF2D01]" />
            <span>4. Verification & Signatures</span>
          </div>
          {openSections.verification ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.verification && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Performed By (Approver A) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                data-field="witnessedBy"
                value={data.witnessedBy ?? ""}
                onChange={(e) => handleChange("witnessedBy", e.target.value)}
                placeholder="SIVAGANESHAN.V.A"
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.witnessedBy ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.witnessedBy && (
                <p className="text-xs text-red-600 mt-1">{errors.witnessedBy}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified By (Approver B) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                data-field="verifiedBy"
                value={data.verifiedBy ?? ""}
                onChange={(e) => handleChange("verifiedBy", e.target.value)}
                placeholder="KARTHIKEYAN.A"
                className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                  errors.verifiedBy ? "border-red-400 bg-red-50/30" : "border-slate-300"
                }`}
              />
              {errors.verifiedBy && (
                <p className="text-xs text-red-600 mt-1">{errors.verifiedBy}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FORM VALIDATION ERRORS BANNER */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs space-y-2 animate-fadeIn">
          <div className="font-bold text-red-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Please complete all required fields before saving:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-red-700">
            {Object.entries(errors).map(([key, msg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="text-red-400">•</span>
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM ACTION BUTTONS (MOBILE FIRST: FULL WIDTH ON SMALL SCREENS) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        )}

        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition"
          >
            Save as Draft
          </button>
        )}

        {onSubmitForApproval && (
          <button
            type="button"
            onClick={onSubmitForApproval}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{submitLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
