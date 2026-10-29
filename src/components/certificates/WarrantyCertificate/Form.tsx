"use client";

import React, { useState } from "react";
import { WarrantyCertificateData, CustomField } from "@/types/certificate";
import { FileText, Shield, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { CustomFieldsEditor } from "../common/CustomFieldsEditor";
import { SignatorySelector } from "../common/SignatorySelector";

interface WarrantyCertificateFormProps {
  data: WarrantyCertificateData;
  onChange: (newData: WarrantyCertificateData) => void;
  errors?: Record<string, string>;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
}

export const WarrantyCertificateForm: React.FC<WarrantyCertificateFormProps> = ({
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
    warranty: true,
    signatory: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = <K extends keyof WarrantyCertificateData>(
    field: K,
    value: WarrantyCertificateData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleCustomFieldsChange = (
    section: "general" | "product",
    fields: CustomField[]
  ) => {
    const customFields = {
      ...(data.customFields || {}),
      [section]: fields,
    };
    onChange({ ...data, customFields });
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: GENERAL INFORMATION */}
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
                Customer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.customerName ?? ""}
                onChange={(e) => handleChange("customerName", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="e.g. ABC Private Limited"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Our Sales Order No.
              </label>
              <input
                type="text"
                value={data.salesOrderNo ?? data.invoiceNo ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    ...data,
                    salesOrderNo: val,
                    invoiceNo: val,
                  });
                }}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="e.g. 510"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer PO No.
              </label>
              <input
                type="text"
                value={data.customerPO ?? data.orderNo ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    ...data,
                    customerPO: val,
                    orderNo: val,
                  });
                }}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="e.g. P000900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Description
              </label>
              <input
                type="text"
                value={data.productDescription ?? ""}
                onChange={(e) => handleChange("productDescription", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="e.g. Please refer above Sales Order"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Certificate Date
              </label>
              <input
                type="date"
                value={data.certificateDate ?? data.date ?? data.invoiceDate ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    ...data,
                    certificateDate: val,
                    date: val,
                    invoiceDate: val,
                  });
                }}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Testing / Issue Location
              </label>
              <input
                type="text"
                value={data.testingLocation ?? "Coimbatore"}
                onChange={(e) => handleChange("testingLocation", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
                placeholder="e.g. Coimbatore"
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

      {/* SECTION 2: WARRANTY & DECLARATION DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("warranty")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-200 text-left font-bold text-slate-800 text-sm hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FF2D01]" />
            <span>2. Warranty Declaration & Scope</span>
          </div>
          {openSections.warranty ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.warranty && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Description
              </label>
              <input
                type="text"
                value={data.productDescription ?? ""}
                onChange={(e) => handleChange("productDescription", e.target.value)}
                placeholder="e.g. Please refer above Sales Order"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name (For and on behalf of)
              </label>
              <input
                type="text"
                value={data.companyName ?? "Zeetork Automation & Control Private Limited"}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Introductory Warranty Declaration
              </label>
              <textarea
                rows={2}
                value={
                  data.declarationText ??
                  "We warrant that the products supplied under our above referred Sales Order conform to the agreed specifications and are free from manufacturing defects in materials and workmanship."
                }
                onChange={(e) => handleChange("declarationText", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty Period
              </label>
              <textarea
                rows={3}
                value={
                  data.warrantyPeriod ??
                  "18 months from the date of supply or 12 months from the date of installation, whichever occurs earlier. Installation date must be supported by documentary evidence; otherwise, the supply date shall apply."
                }
                onChange={(e) => handleChange("warrantyPeriod", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serial / Identification Numbers (Optional)
              </label>
              <input
                type="text"
                value={data.serialNumbers ?? ""}
                onChange={(e) => handleChange("serialNumbers", e.target.value)}
                placeholder="e.g. SN-2026-001 to SN-2026-010"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div className="pt-2">
              <CustomFieldsEditor
                label="Custom Warranty & Product Fields"
                sectionName="Warranty Details"
                fields={data.customFields?.product || []}
                onChange={(fields) => handleCustomFieldsChange("product", fields)}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: SIGNATORY INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("signatory")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-200 text-left font-bold text-slate-800 text-sm hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#FF2D01]" />
            <span>3. Signatory Details</span>
          </div>
          {openSections.signatory ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.signatory && (
          <div className="p-4 space-y-4">
            <SignatorySelector
              isWarranty={true}
              issuedBy={data.issuedBy}
              witnessedBy={data.witnessedBy}
              witnessSignatureUrl={data.witnessSignatureUrl}
              onChangeIssuedBy={(name, sigUrl) => {
                handleChange("issuedBy", name);
                handleChange("witnessedBy", name);
                if (sigUrl !== undefined) {
                  handleChange("witnessSignatureUrl", sigUrl);
                }
              }}
              onChangeWitnessedBy={(name, sigUrl) => {
                handleChange("witnessedBy", name);
                handleChange("issuedBy", name);
                if (sigUrl !== undefined) {
                  handleChange("witnessSignatureUrl", sigUrl);
                }
              }}
              onChangeVerifiedBy={() => {}}
            />
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
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] rounded-xl shadow-md transition flex items-center justify-center gap-2"
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
