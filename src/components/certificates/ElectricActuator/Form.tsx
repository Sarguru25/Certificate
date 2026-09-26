"use client";

import React, { useState } from "react";
import {
  ElectricActuatorCertificateData,
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

interface ElectricActuatorFormProps {
  data: ElectricActuatorCertificateData;
  onChange: (newData: ElectricActuatorCertificateData) => void;
  errors?: Record<string, string>;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
}

export const ElectricActuatorForm: React.FC<ElectricActuatorFormProps> = ({
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

  const handleChange = <K extends keyof ElectricActuatorCertificateData>(
    field: K,
    value: ElectricActuatorCertificateData[K]
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

  // Torque numeric value helper (strips "Nm" so only digits are typed)
  const rawTorque = String(data.torque ?? "30").replace(/[^0-9.]/g, "");

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
                value={data.productName ?? "Electric Actuator"}
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
                value={data.modelNumber ?? "ZREQT - 03, 24 VDC (S)"}
                onChange={(e) => handleChange("modelNumber", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            {/* Type: Rotary Elecric Actuator, linear type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type
              </label>
              <select
                value={data.actuatorType ?? "Rotary Elecric Actuator"}
                onChange={(e) => handleChange("actuatorType", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
              >
                <option value="Rotary Elecric Actuator">Rotary Elecric Actuator</option>
                <option value="linear type">linear type</option>
              </select>
            </div>

            {/* Operating Voltage: 24v DC, 220v AC, 110v AC */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Voltage
              </label>
              <select
                value={data.operatingVoltage ?? "24v DC"}
                onChange={(e) => handleChange("operatingVoltage", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
              >
                <option value="24v DC">24v DC</option>
                <option value="220v AC">220v AC</option>
                <option value="110v AC">110v AC</option>
              </select>
            </div>

            {/* Rated Torque: manual entry (Nm is const) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rated Torque
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={rawTorque}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                    handleChange("torque", cleaned);
                  }}
                  placeholder="30"
                  className="w-full text-sm border border-slate-300 rounded-xl pl-3 pr-12 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
                <span className="absolute right-3.5 text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none">
                  Nm
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={data.quantity ?? 2}
                onChange={(e) => handleChange("quantity", Number(e.target.value))}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            {/* Temperature: 30c to -60c, -20c to + 60c, -25c to 70c (dropdown and editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temperature
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  list="actuator-temp-options"
                  value={data.temperature ?? "-25c to 70c"}
                  onChange={(e) => handleChange("temperature", e.target.value)}
                  placeholder="Select or enter temperature"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
                <datalist id="actuator-temp-options">
                  <option value="-25c to 70c" />
                  <option value="-20c to + 60c" />
                  <option value="30c to -60c" />
                </datalist>
                <select
                  value={data.temperature ?? "-25c to 70c"}
                  onChange={(e) => handleChange("temperature", e.target.value)}
                  className="text-xs border border-slate-300 rounded-xl px-2 py-2 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                  title="Choose preset"
                >
                  <option value="-25c to 70c">-25c to 70c</option>
                  <option value="-20c to + 60c">-20c to + 60c</option>
                  <option value="30c to -60c">30c to -60c</option>
                </select>
              </div>
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

            {/* TEST 2: Supply / Rated Voltage */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("supplyVoltage")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("supplyVoltage")}
                    onChange={(e) => handleTestToggle("supplyVoltage", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    2. Supply / Rated Voltage
                  </span>
                </label>
                {!isTestEnabled("supplyVoltage") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("supplyVoltage") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Options: 24v DC, 110v AC, 240v AC)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        list="voltage-criteria-options"
                        value={data.supplyVoltageCriteria ?? "24V DC"}
                        onChange={(e) => handleChange("supplyVoltageCriteria", e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                      />
                      <datalist id="voltage-criteria-options">
                        <option value="24V DC" />
                        <option value="110v AC" />
                        <option value="240v AC" />
                      </datalist>
                      <select
                        value={data.supplyVoltageCriteria ?? "24V DC"}
                        onChange={(e) => handleChange("supplyVoltageCriteria", e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                        title="Quick Select"
                      >
                        <option value="24V DC">24V DC</option>
                        <option value="110v AC">110v AC</option>
                        <option value="240v AC">240v AC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value (Editable)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        list="voltage-measured-options"
                        value={data.supplyVoltageMeasured ?? "24V"}
                        onChange={(e) => handleChange("supplyVoltageMeasured", e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                      />
                      <datalist id="voltage-measured-options">
                        <option value="24V" />
                        <option value="110V" />
                        <option value="240V" />
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.supplyVoltageResult ?? "Pass"}
                      onChange={(e) => handleChange("supplyVoltageResult", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01] bg-white cursor-pointer font-bold"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* TEST 3: Current Consumption */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("currentConsumption")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("currentConsumption")}
                    onChange={(e) => handleTestToggle("currentConsumption", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    3. Current Consumption
                  </span>
                </label>
                {!isTestEnabled("currentConsumption") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("currentConsumption") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Manual)
                    </label>
                    <input
                      type="text"
                      value={data.currentConsumptionCriteria ?? "≤1 A"}
                      onChange={(e) => handleChange("currentConsumptionCriteria", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value (Manual)
                    </label>
                    <input
                      type="text"
                      value={data.currentConsumptionMeasured ?? ".25A"}
                      onChange={(e) => handleChange("currentConsumptionMeasured", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.currentConsumptionResult ?? "Pass"}
                      onChange={(e) => handleChange("currentConsumptionResult", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01] bg-white cursor-pointer font-bold"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* TEST 4: Rotation Angle */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("rotationAngle")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("rotationAngle")}
                    onChange={(e) => handleTestToggle("rotationAngle", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    4. Rotation Angle
                  </span>
                </label>
                {!isTestEnabled("rotationAngle") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("rotationAngle") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Default: 90°±2%)
                    </label>
                    <input
                      type="text"
                      value={data.rotationAngleCriteria ?? "90°±2%"}
                      onChange={(e) => handleChange("rotationAngleCriteria", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value
                    </label>
                    <input
                      type="text"
                      value={data.rotationAngleMeasured ?? "90°"}
                      onChange={(e) => handleChange("rotationAngleMeasured", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.rotationAngleResult ?? "Pass"}
                      onChange={(e) => handleChange("rotationAngleResult", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01] bg-white cursor-pointer font-bold"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* TEST 5: Operating Time (90°) */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("operatingTime")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("operatingTime")}
                    onChange={(e) => handleTestToggle("operatingTime", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    5. Operating Time (90°)
                  </span>
                </label>
                {!isTestEnabled("operatingTime") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("operatingTime") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Manual)
                    </label>
                    <input
                      type="text"
                      value={data.operatingTimeCriteria ?? "≤7 Sec"}
                      onChange={(e) => handleChange("operatingTimeCriteria", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value (Manual)
                    </label>
                    <input
                      type="text"
                      value={data.operatingTimeMeasured ?? "7 Sec"}
                      onChange={(e) => handleChange("operatingTimeMeasured", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.operatingTimeResult ?? "Pass"}
                      onChange={(e) => handleChange("operatingTimeResult", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01] bg-white cursor-pointer font-bold"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* TEST 6: Functional Test (Open/Close) */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isTestEnabled("functionalTest")
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestEnabled("functionalTest")}
                    onChange={(e) => handleTestToggle("functionalTest", e.target.checked)}
                    className="w-4 h-4 text-[#FF2D01] rounded border-slate-300 focus:ring-[#FF2D01] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    6. Functional Test (Open/Close)
                  </span>
                </label>
                {!isTestEnabled("functionalTest") && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Omitted from certificate
                  </span>
                )}
              </div>

              {isTestEnabled("functionalTest") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technical Details (Default: Smooth Operation)
                    </label>
                    <input
                      type="text"
                      value={data.functionalTestCriteria ?? "Smooth Operation"}
                      onChange={(e) => handleChange("functionalTestCriteria", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Measured Value
                    </label>
                    <input
                      type="text"
                      value={data.functionalTestMeasured ?? "Smooth"}
                      onChange={(e) => handleChange("functionalTestMeasured", e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#FF2D01]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pass / Fail
                    </label>
                    <select
                      value={data.functionalTestResult ?? "Pass"}
                      onChange={(e) => handleChange("functionalTestResult", e.target.value)}
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
