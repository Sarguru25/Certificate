"use client";

import React, { useState } from "react";
import {
  CertificateData,
  CertificateErrors,
  ConfigurationType,
  OperatingVoltageType,
  CoilType,
  MountingType,
  PortSizeType,
  ProtectionType,
  ExproofType,
  TestResultStatus,
} from "@/types/certificate";
import {
  CONFIGURATION_OPTIONS,
  OPERATING_VOLTAGE_OPTIONS,
  COIL_TYPE_OPTIONS,
  MOUNTING_OPTIONS,
  PORT_SIZE_OPTIONS,
  PROTECTION_TYPE_OPTIONS,
  EXPROOF_TYPE_OPTIONS,
  TEST_STATUS_OPTIONS,
  MANUFACTURER_OPTIONS,
  formatVoltageCriteria,
} from "@/lib/certificateDefaults";
import {
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  Eye,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CertificateFormProps {
  data: CertificateData;
  onChange: (newData: CertificateData) => void;
  errors: CertificateErrors;
  onGeneratePdf: () => void;
  onReset: () => void;
  onLoadSample: () => void;
  onScrollToPreview: () => void;
  isGeneratingPdf?: boolean;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  data,
  onChange,
  errors,
  onGeneratePdf,
  onReset,
  onLoadSample,
  onScrollToPreview,
  isGeneratingPdf = false,
}) => {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<{
    info: boolean;
    product: boolean;
    tests: boolean;
    verification: boolean;
  }>({
    info: true,
    product: true,
    tests: true,
    verification: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = <K extends keyof CertificateData>(
    field: K,
    value: CertificateData[K]
  ) => {
    const updated = { ...data, [field]: value };

    // When operating voltage changes, automatically update switchingTestCriteria if default
    if (field === "operatingVoltage") {
      updated.switchingTestCriteria = formatVoltageCriteria(value as string);
    }

    // When protection type changes, handle defaults
    if (field === "protectionType") {
      if (value === "Weather") {
        updated.protectionRating = "IP66";
      } else if (value === "Exproof" && !updated.exproofType) {
        updated.exproofType = "Exdb IIIC T6 Gb";
      }
    }

    onChange(updated);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGeneratePdf();
      }}
      className="space-y-4 text-slate-800"
    >
      {/* HEADER ACTIONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Certificate Details
          </h2>
          <p className="text-xs text-slate-500">
            Fill in the parameters below to generate the certificate
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Load Sample Button */}
          <button
            type="button"
            onClick={onLoadSample}
            title="Load standard sample data for Solenoid Valve"
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Sample Data
          </button>

          {/* Jump to preview on mobile */}
          <button
            type="button"
            onClick={onScrollToPreview}
            className="lg:hidden inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
            View Preview
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            title="Reset form to defaults"
            className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VALIDATION ERROR BANNER */}
      {hasErrors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">
              Please complete all required fields ({Object.keys(errors).length}{" "}
              missing or invalid):
            </div>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-red-600">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 1: CERTIFICATE INFORMATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("info")}
          className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition border-b border-slate-200"
        >
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              1
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Certificate Information
            </span>
          </div>
          {openSections.info ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {openSections.info && (
          <div className="p-4 space-y-3">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="e.g. Armatury Bauen Olomouc Controls Private Limited"
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                  errors.customerName
                    ? "border-red-500 focus:ring-red-400"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                } focus:outline-none focus:ring-1 transition`}
              />
              {errors.customerName && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sales Order Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sales Order No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.salesOrderNo}
                  onChange={(e) => handleChange("salesOrderNo", e.target.value)}
                  placeholder="e.g. ZIS26270145"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.salesOrderNo
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.salesOrderNo && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.salesOrderNo}
                  </p>
                )}
              </div>

              {/* Customer PO */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer PO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.customerPO}
                  onChange={(e) => handleChange("customerPO", e.target.value)}
                  placeholder="e.g. PO00900"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.customerPO
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.customerPO && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.customerPO}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer PO Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer PO Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.customerPODate}
                  onChange={(e) =>
                    handleChange("customerPODate", e.target.value)
                  }
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.customerPODate
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition bg-white`}
                />
                {errors.customerPODate && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.customerPODate}
                  </p>
                )}
              </div>

              {/* Certificate Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Certificate Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.certificateDate}
                  onChange={(e) =>
                    handleChange("certificateDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.certificateDate
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition bg-white`}
                />
                {errors.certificateDate && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.certificateDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PRODUCT INFORMATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("product")}
          className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition border-b border-slate-200"
        >
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              2
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Product Information
            </span>
          </div>
          {openSections.product ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {openSections.product && (
          <div className="p-4 space-y-3">
            {/* Valve Type & Manufacturer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Valve Type (Fixed)
                </label>
                <input
                  type="text"
                  value={data.valveType}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Manufacturer <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.manufacturer}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {MANUFACTURER_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Configuration & Operating Voltage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Configuration <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.configuration}
                  onChange={(e) =>
                    handleChange(
                      "configuration",
                      e.target.value as ConfigurationType
                    )
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {CONFIGURATION_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Operating Voltage <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.operatingVoltage}
                  onChange={(e) =>
                    handleChange(
                      "operatingVoltage",
                      e.target.value as OperatingVoltageType
                    )
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {OPERATING_VOLTAGE_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coil Type & Mounting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coil Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.coilType}
                  onChange={(e) =>
                    handleChange("coilType", e.target.value as CoilType)
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {COIL_TYPE_OPTIONS.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mounting <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.mounting}
                  onChange={(e) =>
                    handleChange("mounting", e.target.value as MountingType)
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {MOUNTING_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model Number & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Model Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.modelNumber}
                  onChange={(e) => handleChange("modelNumber", e.target.value)}
                  placeholder="e.g. ZLV310F30A"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.modelNumber
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.modelNumber && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.modelNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quantity (Nos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="e.g. 6"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.quantity
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.quantity && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.quantity}
                  </p>
                )}
              </div>
            </div>

            {/* Port Size & Protection Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Port Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.portSize}
                  onChange={(e) =>
                    handleChange("portSize", e.target.value as PortSizeType)
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {PORT_SIZE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Protection Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.protectionType}
                  onChange={(e) =>
                    handleChange(
                      "protectionType",
                      e.target.value as ProtectionType
                    )
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {PROTECTION_TYPE_OPTIONS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CONDITIONAL PROTECTION DETAILS */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              {data.protectionType === "Weather" ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Protection Rating (Automatic for Weather)
                  </label>
                  <input
                    type="text"
                    value={data.protectionRating || "IP66"}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Certificate will display:{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                      Weather : IP66
                    </code>
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Exproof Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={data.exproofType ?? "Exdb IIIC T6 Gb"}
                    onChange={(e) =>
                      handleChange("exproofType", e.target.value as ExproofType)
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                  >
                    {EXPROOF_TYPE_OPTIONS.map((et) => (
                      <option key={et} value={et}>
                        {et}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Certificate will display:{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                      Exproof : {data.exproofType ?? "Exdb IIIC T6 Gb"}
                    </code>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: TEST PARAMETERS & RESULTS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("tests")}
          className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition border-b border-slate-200"
        >
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              3
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Test Parameters & Results
            </span>
          </div>
          {openSections.tests ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {openSections.tests && (
          <div className="p-4 space-y-3">
            {/* Switching Test */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Switching Test Criteria
                </label>
                <input
                  type="text"
                  value={data.switchingTestCriteria}
                  onChange={(e) =>
                    handleChange("switchingTestCriteria", e.target.value)
                  }
                  placeholder="e.g. 24V DC"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Switching Test Result <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.switchingTestResult}
                  onChange={(e) =>
                    handleChange(
                      "switchingTestResult",
                      e.target.value as TestResultStatus
                    )
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {TEST_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Response Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Response Time Criteria
                </label>
                <input
                  type="text"
                  value={data.responseTimeCriteria}
                  onChange={(e) =>
                    handleChange("responseTimeCriteria", e.target.value)
                  }
                  placeholder="< 20 ms"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Response Time Result <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.responseTimeResult}
                  onChange={(e) =>
                    handleChange("responseTimeResult", e.target.value)
                  }
                  placeholder="e.g. 15 ms"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.responseTimeResult
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.responseTimeResult && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.responseTimeResult}
                  </p>
                )}
              </div>
            </div>

            {/* Leak Test */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Leak Test Criteria
                </label>
                <input
                  type="text"
                  value={data.leakTestCriteria}
                  onChange={(e) =>
                    handleChange("leakTestCriteria", e.target.value)
                  }
                  placeholder="Air @ 6 bar"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Leak Test Result <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.leakTestResult}
                  onChange={(e) =>
                    handleChange("leakTestResult", e.target.value)
                  }
                  placeholder="e.g. No leakage"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.leakTestResult
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.leakTestResult && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.leakTestResult}
                  </p>
                )}
              </div>
            </div>

            {/* Operating Pressure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Operating Pressure Criteria
                </label>
                <input
                  type="text"
                  value={data.operatingPressureCriteria}
                  onChange={(e) =>
                    handleChange("operatingPressureCriteria", e.target.value)
                  }
                  placeholder="0.5 – 10 bar"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Operating Pressure Result{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.operatingPressureResult}
                  onChange={(e) =>
                    handleChange(
                      "operatingPressureResult",
                      e.target.value as TestResultStatus
                    )
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white transition"
                >
                  {TEST_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: VERIFICATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("verification")}
          className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition border-b border-slate-200"
        >
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
              4
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Verification & Signatures
            </span>
          </div>
          {openSections.verification ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {openSections.verification && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Witnessed By */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Witnessed By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.witnessedBy}
                  onChange={(e) => handleChange("witnessedBy", e.target.value)}
                  placeholder="e.g. SIVAGANESHAN.V.A"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.witnessedBy
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.witnessedBy && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.witnessedBy}
                  </p>
                )}
              </div>

              {/* Verified By */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Verified By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.verifiedBy}
                  onChange={(e) => handleChange("verifiedBy", e.target.value)}
                  placeholder="e.g. KARTHIKEYAN.A"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                    errors.verifiedBy
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-400"
                  } focus:outline-none focus:ring-1 transition`}
                />
                {errors.verifiedBy && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.verifiedBy}
                  </p>
                )}
              </div>
            </div>

            {/* Signature toggle */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showSignatures}
                  onChange={(e) =>
                    handleChange("showSignatures", e.target.checked)
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Include Official Company Seal & Authorized Signatures</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6 mt-0.5">
                Uncheck if blank physical signature lines are required for manual signing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="submit"
          disabled={isGeneratingPdf}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition transform active:scale-[0.99]"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl border border-slate-300 shadow-sm transition"
        >
          <RotateCcw className="w-4 h-4 mr-2 text-slate-500" />
          Reset Form
        </button>
      </div>
    </form>
  );
};
