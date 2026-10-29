"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCertificateConfig } from "@/lib/certificateRegistry";
import { CertificateFormRenderer } from "@/components/certificates/CertificateFormRenderer";
import { CertificateRenderer } from "@/components/certificates/CertificateRenderer";
import { ResponsiveCertificatePreview } from "@/components/certificates/common/ResponsiveCertificatePreview";
import { validateCertificate } from "@/lib/certificateValidation";
import { ICertificate, AnyCertificateData } from "@/types/certificate";
import { calculateValveFunctionalTestPages } from "@/lib/certificatePagination";
import { ArrowLeft, Eye, AlertCircle, ShieldAlert, FileText } from "lucide-react";

interface PageProps {
  params: Promise<{
    certificateType: string;
    id: string;
  }>;
}

export default function EditCertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { certificateType, id } = resolvedParams;
  const config = getCertificateConfig(certificateType);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [certificate, setCertificate] = useState<ICertificate | null>(null);
  const [formData, setFormData] = useState<AnyCertificateData>({} as AnyCertificateData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/certificates/${id}`);
        if (!res.ok) throw new Error("Failed to load certificate");
        const json = await res.json();
        if (!ignore) {
          setCertificate(json.certificate);
          setFormData(json.certificate.certificateData || {});
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setGlobalError(err instanceof Error ? err.message : "Failed to load data");
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#FF2D01] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          Loading certificate form...
        </span>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center">
        Certificate not found.
      </div>
    );
  }

  // Guard: Editing is strictly allowed ONLY for DRAFT or REJECTED
  if (certificate.status === "APPROVED") {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          Approved Certificates Are Immutable
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Certificate {certificate.certificateNumber} (Rev {certificate.revision}) is fully approved and locked.
          Any modifications must occur through a controlled revision workflow.
        </p>
        <div>
          <Link
            href={`/${certificateType}/${id}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
          >
            <span>Return to Certificate View</span>
          </Link>
        </div>
      </div>
    );
  }

  if (certificate.status === "PENDING_APPROVAL") {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          Certificate Is Under Review
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          This certificate is currently in the approval queue. Changes cannot be made while
          approvers are reviewing.
        </p>
        <div>
          <Link
            href={`/${certificateType}/${id}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
          >
            <span>View Approval Status</span>
          </Link>
        </div>
      </div>
    );
  }

  const lineItemCount =
    certificateType === "valve-functional-test"
      ? calculateValveFunctionalTestPages(formData)
      : (formData as unknown as { lineItems?: unknown[] })?.lineItems?.length || 1;

  const handleSave = async (submitAfterSave = false) => {
    if (submitAfterSave && certificateType === "solenoid-valve") {
      const val = validateCertificate(formData, certificateType);
      if (!val.isValid) {
        setErrors(val.errors as Record<string, string>);
        setGlobalError("Please correct validation errors before submitting.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setIsSaving(true);
    setGlobalError(null);

    try {
      // 1. Update data (if was REJECTED, backend automatically resets to DRAFT)
      const res = await fetch(`/api/certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateData: formData }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update certificate");
      }

      // 2. If user also clicked "Submit", trigger submit endpoint
      if (submitAfterSave) {
        const submitRes = await fetch(`/api/certificates/${id}/submit`, {
          method: "POST",
        });
        const submitJson = await submitRes.json();
        if (!submitRes.ok) {
          throw new Error(submitJson.error || "Failed to submit certificate");
        }
      }

      router.push(`/${certificateType}/${id}`);
      router.refresh();
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to save changes");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${certificateType}/${id}`}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-400">
                {certificate.certificateNumber} (Rev {certificate.revision})
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-slate-600">Edit Certificate</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Edit {config?.name || "Certificate"}
            </h1>
          </div>
        </div>

        {/* VIEW TOGGLE TABS (Full width single page layout for desktop & mobile) */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-2xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex-1 sm:flex-initial sm:px-6 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
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
            className={`flex-1 sm:flex-initial sm:px-6 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Eye className="w-4 h-4 text-[#FF2D01]" />
            <span>
              Document Preview {lineItemCount > 1 ? `(${lineItemCount} Pages)` : ""}
            </span>
          </button>
        </div>
      </div>

      {certificate.status === "REJECTED" && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-2xl">
          Notice: This certificate was previously rejected. Saving changes will return it to DRAFT status so it can be resubmitted for review.
        </div>
      )}

      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
          {globalError}
        </div>
      )}

      {/* SINGLE-PANEL FULL-WIDTH VIEW */}
      {activeTab === "form" ? (
        <div className="w-full">
          <CertificateFormRenderer
            certificateType={certificateType}
            data={formData}
            onChange={setFormData}
            errors={errors}
            onSaveDraft={() => handleSave(false)}
            onSubmitForApproval={() => handleSave(true)}
            onCancel={() => router.push(`/${certificateType}/${id}`)}
            isSaving={isSaving}
            submitLabel="Save & Submit for Approval"
            onSwitchToPreview={() => setActiveTab("preview")}
          />
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FF2D01]" />
              <span className="text-xs font-bold text-slate-800">
                Official Document Preview — {lineItemCount} {lineItemCount === 1 ? "Page" : "Pages"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#FF2D01] bg-[#FF2D01]/10 hover:bg-[#FF2D01]/20 rounded-xl transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Back to Form Editor</span>
            </button>
          </div>

          <ResponsiveCertificatePreview
            title="Updated Preview"
            orientation={certificateType === "pneumatic-actuator" ? "landscape" : "portrait"}
            badge={`${certificate.certificateNumber} - R${certificate.revision}`}
          >
            <CertificateRenderer
              certificateType={certificateType}
              data={formData}
              certificateNumber={certificate.certificateNumber}
              revision={certificate.revision}
              status={certificate.status}
            />
          </ResponsiveCertificatePreview>
        </div>
      )}
    </div>
  );
}
