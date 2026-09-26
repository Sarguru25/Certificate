"use client";

import React, { useState } from "react";
import {
  LimitSwitchCertificateData,
  CustomField,
} from "@/types/certificate";
import {
  FileText,
  Settings,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CustomFieldsEditor } from "../common/CustomFieldsEditor";

interface LimitSwitchFormProps {
  data: LimitSwitchCertificateData;
  onChange: (newData: LimitSwitchCertificateData) => void;
  errors?: Record<string, string>;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
}

export const LimitSwitchForm: React.FC<LimitSwitchFormProps> = ({
  data,
  onChange,
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

  const handleChange = <K extends keyof LimitSwitchCertificateData>(
    field: K,
    value: LimitSwitchCertificateData[K]
  ) => {
    onChange({ ...data, [field]: value });
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
      {/* SECTION 1: GENERAL CERTIFICATE INFORMATION */}
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
                value={data.customerName ?? ""}
                onChange={(e) => handleChange("customerName", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="TruFlow Solutions Private"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sales Order No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.salesOrderNo ?? ""}
                onChange={(e) => handleChange("salesOrderNo", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="ZIS26270142"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer PO <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.customerPO ?? ""}
                onChange={(e) => handleChange("customerPO", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="INP2627163"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Certificate Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={data.certificateDate ?? ""}
                onChange={(e) => handleChange("certificateDate", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Test
              </label>
              <input
                type="text"
                value={data.dateOfTest ?? data.certificateDate ?? ""}
                onChange={(e) => handleChange("dateOfTest", e.target.value)}
                placeholder="09/09/2026"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
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
            <span>2. Product Information</span>
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
                Product Name
              </label>
              <input
                type="text"
                value={data.productName ?? "Limit Switch Box"}
                onChange={(e) => handleChange("productName", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={data.modelNumber ?? "ZLS-AP-Ex"}
                onChange={(e) => handleChange("modelNumber", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={data.quantity ?? 4}
                onChange={(e) => handleChange("quantity", Number(e.target.value))}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            {/* Switch Type: Honeywell type, Standard Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Switch Type
              </label>
              <select
                value={data.switchType ?? "Honeywell type"}
                onChange={(e) => handleChange("switchType", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
              >
                <option value="Honeywell type">Honeywell type</option>
                <option value="Standard Type">Standard Type</option>
              </select>
            </div>

            {/* Contact Type: SPDT *2 , SPDT*4, DPDT*2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Type
              </label>
              <select
                value={data.contactType ?? "SPDT *2"}
                onChange={(e) => handleChange("contactType", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
              >
                <option value="SPDT *2">SPDT *2</option>
                <option value="SPDT*4">SPDT*4</option>
                <option value="DPDT*2">DPDT*2</option>
              </select>
            </div>

            {/* Operating Voltage: 125-250V AC (default & editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Voltage
              </label>
              <input
                type="text"
                value={data.operatingVoltage ?? "125-250V AC"}
                onChange={(e) => handleChange("operatingVoltage", e.target.value)}
                placeholder="125-250V AC"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            {/* Rated Current: 16A (default & editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rated Current
              </label>
              <input
                type="text"
                value={data.ratedCurrent ?? "16A"}
                onChange={(e) => handleChange("ratedCurrent", e.target.value)}
                placeholder="16A"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            {/* Temp Range: -20°C TO +60°C manual */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temp Range
              </label>
              <input
                type="text"
                value={data.temperature ?? "-20°C TO +60°C"}
                onChange={(e) => handleChange("temperature", e.target.value)}
                placeholder="-20°C TO +60°C"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            {/* Enclosure Rating: Weatherproof : IP66 , Ex-proof : Ex d IIB T6 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enclosure Rating
              </label>
              <select
                value={data.enclosure ?? "Weatherproof : IP66"}
                onChange={(e) => handleChange("enclosure", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
              >
                <option value="Weatherproof : IP66">Weatherproof : IP66</option>
                <option value="Ex-proof : Ex d IIB T6">Ex-proof : Ex d IIB T6</option>
              </select>
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

      {/* SECTION 3: TEST PARAMETERS & RESULTS (3 Tests) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("tests")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-200 text-left font-bold text-slate-800 text-sm hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF2D01]" />
            <span>3. Test Parameters &amp; Results</span>
          </div>
          {openSections.tests ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.tests && (
          <div className="p-4 space-y-4">
            {/* TEST 1: Visual Inspection */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("visualInspection")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("visualInspection")}
                    onChange={(e) => handleTestToggle("visualInspection", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    1. Visual Inspection
                  </span>
                </label>
                {!isTestEnabled("visualInspection") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("visualInspection") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Criteria)
                    </label>
                    <input
                      type="text"
                      value={data.visualInspectionCriteria ?? "No physical damage, corrosion, or defects"}
                      onChange={(e) => handleChange("visualInspectionCriteria", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value
                    </label>
                    <input
                      type="text"
                      value={data.visualInspectionMeasured ?? "No damage"}
                      onChange={(e) => handleChange("visualInspectionMeasured", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.visualInspectionResult ?? "Pass"}
                      onChange={(e) => handleChange("visualInspectionResult", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01] bg-white cursor-pointer font-bold"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* TEST 2: Mechanical Operation */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("mechanicalOperation")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("mechanicalOperation")}
                    onChange={(e) => handleTestToggle("mechanicalOperation", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    2. Mechanical Operation
                  </span>
                </label>
                {!isTestEnabled("mechanicalOperation") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("mechanicalOperation") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Criteria)
                    </label>
                    <input
                      type="text"
                      value={data.mechanicalOperationCriteria ?? "Manual actuation of lever"}
                      onChange={(e) => handleChange("mechanicalOperationCriteria", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value
                    </label>
                    <input
                      type="text"
                      value={data.mechanicalOperationMeasured ?? "Smooth"}
                      onChange={(e) => handleChange("mechanicalOperationMeasured", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.mechanicalOperationResult ?? "Pass"}
                      onChange={(e) => handleChange("mechanicalOperationResult", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01] bg-white cursor-pointer font-bold"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* TEST 3: Contact Functionality Test */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("contactFunctionality")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("contactFunctionality")}
                    onChange={(e) => handleTestToggle("contactFunctionality", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    3. Contact Functionality Test
                  </span>
                </label>
                {!isTestEnabled("contactFunctionality") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("contactFunctionality") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Criteria)
                    </label>
                    <input
                      type="text"
                      value={data.contactFunctionalityCriteria ?? "NO/NC contacts toggle correctly"}
                      onChange={(e) => handleChange("contactFunctionalityCriteria", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value
                    </label>
                    <input
                      type="text"
                      value={data.contactFunctionalityMeasured ?? "Functional"}
                      onChange={(e) => handleChange("contactFunctionalityMeasured", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.contactFunctionalityResult ?? "Pass"}
                      onChange={(e) => handleChange("contactFunctionalityResult", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01] bg-white cursor-pointer font-bold"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
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
            <span>4. Verification &amp; Signatures</span>
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
                Performed By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.witnessedBy ?? ""}
                onChange={(e) => handleChange("witnessedBy", e.target.value)}
                placeholder="SIVAGANESHAN.V.A"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.verifiedBy ?? ""}
                onChange={(e) => handleChange("verifiedBy", e.target.value)}
                placeholder="KARTHIKEYAN.A"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
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
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        )}

        {onSubmitForApproval && (
          <button
            type="button"
            onClick={onSubmitForApproval}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#FF2D01] hover:bg-[#e02700] rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSaving ? "Processing..." : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
};
