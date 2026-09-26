"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { getCertificateConfig } from "@/lib/certificateRegistry";
import { CertificateFormRenderer } from "@/components/certificates/CertificateFormRenderer";
import { CertificateRenderer } from "@/components/certificates/CertificateRenderer";
import { ResponsiveCertificatePreview } from "@/components/certificates/common/ResponsiveCertificatePreview";
import { validateCertificate } from "@/lib/certificateValidation";
import { AnyCertificateData } from "@/types/certificate";
import { ArrowLeft, Eye, FileText } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ certificateType: string }>;
}

export default function NewCertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const certificateType = resolvedParams.certificateType;
  const config = getCertificateConfig(certificateType);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [formData, setFormData] = useState<AnyCertificateData>(
    config ? ({ ...config.defaultData, certificateDate: new Date().toISOString().slice(0, 10) } as AnyCertificateData) : ({} as AnyCertificateData)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  if (!config) {
    return (
      <div className="p-8 text-center text-sm text-red-600">
        Unknown certificate category.
      </div>
    );
  }

  const handleSave = async (initialStatus: "DRAFT" | "PENDING_APPROVAL") => {
    // If submitting for approval, enforce strict validation
    if (initialStatus === "PENDING_APPROVAL" && certificateType === "solenoid-valve") {
      const val = validateCertificate(formData, certificateType);
      if (!val.isValid) {
        setErrors(val.errors as Record<string, string>);
        const missing = val.missingFieldsList?.join(", ") || "required fields";
        setGlobalError(`Please fill the following required field(s) before submitting: ${missing}`);
        
        // Scroll to the first error element
        if (val.firstErrorField) {
          setTimeout(() => {
            const el = document.querySelector(`[data-field="${val.firstErrorField}"], input[name="${val.firstErrorField}"], select[name="${val.firstErrorField}"]`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              if (el instanceof HTMLElement) el.focus();
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }, 50);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
    }

    setIsSaving(true);
    setGlobalError(null);

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateType,
          certificateData: formData,
          initialStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save certificate");
      }

      router.push(`/${certificateType}/${json.certificate._id}`);
      router.refresh();
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Error saving certificate.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* BREADCRUMB & HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${certificateType}`}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">
                {config.name}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-slate-600">New Certificate</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create New {config.name} Certificate
            </h1>
          </div>
        </div>
      </div>

      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
          {globalError}
        </div>
      )}

      {/* MOBILE VIEW TOGGLE TABS (visible only on < lg screens) */}
      <div className="flex lg:hidden bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "form"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4 text-[#FF2D01]" />
          <span>Form Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "preview"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Eye className="w-4 h-4 text-[#FF2D01]" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* TWO PANEL DESKTOP / RESPONSIVE MOBILE VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORM PANEL (Visible when activeTab === 'form' on mobile; 5 cols on lg) */}
        <div
          className={`${
            activeTab === "form" ? "block" : "hidden"
          } lg:block lg:col-span-5 space-y-4`}
        >
          <CertificateFormRenderer
            certificateType={certificateType}
            data={formData}
            onChange={setFormData}
            errors={errors}
            onSaveDraft={() => handleSave("DRAFT")}
            onSubmitForApproval={() => handleSave("PENDING_APPROVAL")}
            onCancel={() => router.push(`/${certificateType}`)}
            isSaving={isSaving}
          />
        </div>

        {/* PREVIEW PANEL (Visible when activeTab === 'preview' on mobile; 7 cols on lg, sticky on desktop) */}
        <div
          className={`${
            activeTab === "preview" ? "block" : "hidden"
          } lg:block lg:col-span-7 lg:sticky lg:top-20 space-y-3`}
        >
          <ResponsiveCertificatePreview
            title="Document Preview"
            orientation={certificateType === "pneumatic-actuator" ? "landscape" : "portrait"}
            badge="DRAFT"
          >
            <CertificateRenderer
              certificateType={certificateType}
              data={formData}
              certificateNumber="DRAFT"
              revision={0}
              status="DRAFT"
            />
          </ResponsiveCertificatePreview>
        </div>
      </div>
    </div>
  );
}
