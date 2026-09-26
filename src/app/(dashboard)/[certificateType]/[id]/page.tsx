"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AuditTimeline } from "@/components/certificates/common/AuditTimeline";
import { CertificateRenderer } from "@/components/certificates/CertificateRenderer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { generateCertificatePdf, printCertificate } from "@/lib/pdfGenerator";
import { ICertificate, AuditEntry } from "@/types/certificate";
import { SessionUser } from "@/types/auth";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Download,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    certificateType: string;
    id: string;
  }>;
}

export default function CertificateViewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { certificateType, id } = resolvedParams;
  const router = useRouter();

  const [certificate, setCertificate] = useState<ICertificate | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Zoom control state
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [certRes, userRes] = await Promise.all([
        fetch(`/api/certificates/${id}`),
        fetch("/api/auth/me"),
      ]);

      if (!certRes.ok) {
        throw new Error("Failed to load certificate details.");
      }

      const certJson = await certRes.json();
      const userJson = await userRes.json();

      setCertificate(certJson.certificate);
      if (userJson.authenticated) {
        setCurrentUser(userJson.user);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [certRes, userRes] = await Promise.all([
          fetch(`/api/certificates/${id}`),
          fetch("/api/auth/me"),
        ]);
        if (!certRes.ok) throw new Error("Failed to load certificate details.");
        const certJson = await certRes.json();
        const userJson = await userRes.json();
        if (!ignore) {
          setCertificate(certJson.certificate);
          if (userJson.authenticated) {
            setCurrentUser(userJson.user);
          }
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load data");
          setIsLoading(false);
        }
      }
    }
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
          Loading certificate records...
        </span>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">
          Certificate Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested certificate does not exist or has been removed.
        </p>
        <Link
          href={`/${certificateType}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#FF2D01] hover:underline"
        >
          Return to List
        </Link>
      </div>
    );
  }

  // Permissions & eligibility logic
  const creatorId =
    typeof certificate.createdBy === "object" && certificate.createdBy !== null
      ? certificate.createdBy._id
      : certificate.createdBy;
  const isCreator = Boolean(currentUser && creatorId === currentUser.id);

  const isAssignedApprover = Boolean(
    currentUser &&
    certificate.approval?.requiredApprovers?.some(
      (app: unknown) =>
        (typeof app === "object" && app !== null
          ? (app as { _id: string })._id
          : String(app)) === currentUser.id
    )
  );

  const hasAlreadyApproved = Boolean(
    currentUser &&
    certificate.approval?.approvals?.some((app) => {
      const uId =
        typeof app.userId === "object" && app.userId !== null
          ? (app.userId as { _id: string })._id
          : String(app.userId);
      return uId === currentUser.id && app.status === "APPROVED";
    })
  );

  const canApprove =
    certificate.status === "PENDING_APPROVAL" &&
    (isAssignedApprover ||
      currentUser?.roleName === "Administrator" ||
      currentUser?.permissions?.includes("certificates.approve")) &&
    (!isCreator || currentUser?.roleName === "Administrator") &&
    !hasAlreadyApproved;

  const canReject =
    certificate.status === "PENDING_APPROVAL" &&
    (isAssignedApprover ||
      currentUser?.roleName === "Administrator" ||
      currentUser?.permissions?.includes("certificates.reject")) &&
    (!isCreator || currentUser?.roleName === "Administrator");

  const canEdit =
    certificate.status === "DRAFT" || certificate.status === "REJECTED";

  const canSubmit =
    certificate.status === "DRAFT" || certificate.status === "REJECTED";

  const canDelete =
    (certificate.status === "DRAFT" || certificate.status === "REJECTED") &&
    (isCreator ||
      currentUser?.roleName === "Administrator" ||
      currentUser?.permissions?.includes("certificates.delete"));

  // Rejection entry for alert box
  const lastRejection = certificate.approvalHistory
    ?.slice()
    ?.reverse()
    ?.find((h: AuditEntry) => h.action === "REJECTED");

  // Handlers for workflow actions
  const handleSubmit = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/certificates/${id}/submit`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit certificate");
      setSuccessMessage(data.message);
      setSubmitModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/certificates/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      setSuccessMessage(data.message);
      setApproveModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!reason || reason.trim().length < 3) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/certificates/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");
      setSuccessMessage(data.message);
      setRejectModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");
      router.push(`/${certificateType}`);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Deletion failed");
      setIsActionLoading(false);
    }
  };

  const handleClone = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/certificates/${id}/clone`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clone certificate");
      router.push(`/${certificateType}/${data.certificate._id}/edit`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Clone failed");
      setIsActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsActionLoading(true);
      await generateCertificatePdf({
        elementId: "certificate-a4-document",
        data: certificate.certificateData,
        certificateNumber: certificate.certificateNumber,
        revision: certificate.revision,
      });
      setSuccessMessage("PDF downloaded successfully!");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP NOTIFICATIONS */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-500">
            ×
          </button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500">
            ×
          </button>
        </div>
      )}

      {/* HEADER & TOP ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${certificateType}`}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xl text-slate-900">
                {certificate.certificateNumber}
              </span>
              <StatusBadge status={certificate.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created on {new Date(certificate.createdAt).toLocaleDateString()} by{" "}
              <strong>
                {typeof certificate.createdBy === "object"
                  ? certificate.createdBy.name
                  : "Employee"}
              </strong>
            </p>
          </div>
        </div>

        {/* WORKFLOW ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {/* Document export actions */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={printCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* EDIT BUTTON (FOR DRAFT OR REJECTED) */}
          {canEdit && (
            <Link
              href={`/${certificateType}/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit</span>
            </Link>
          )}

          {/* SUBMIT BUTTON (FOR DRAFT OR REJECTED) */}
          {canSubmit && (
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] rounded-xl shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </button>
          )}

          {/* APPROVE BUTTON */}
          {canApprove && (
            <button
              type="button"
              onClick={() => setApproveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Certificate</span>
            </button>
          )}

          {/* REJECT BUTTON */}
          {canReject && (
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl shadow-xs transition"
            >
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Reject</span>
            </button>
          )}

          {/* CLONE BUTTON */}
          <button
            type="button"
            onClick={handleClone}
            disabled={isActionLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs"
            title="Clone into new draft"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Clone</span>
          </button>

          {/* DELETE BUTTON (FOR DRAFTS) */}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition shadow-2xs"
              title="Delete Draft"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* REJECTION REASON ALERT BANNER */}
      {certificate.status === "REJECTED" && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-900 uppercase">
                Certificate Rejected — Correction Required
              </h3>
              <p className="text-xs text-red-800 font-medium">
                <strong>Reason:</strong> {lastRejection?.note || "Not specified"}
              </p>
              <div className="text-[11px] text-red-600 pt-1 flex items-center gap-2">
                <span>Rejected by: {lastRejection?.performedByName || "Approver"}</span>
                <span>•</span>
                <span>
                  Date:{" "}
                  {lastRejection?.performedAt
                    ? new Date(lastRejection.performedAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="pt-2">
                <Link
                  href={`/${certificateType}/${id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit & Correct Mistakes</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TWO-COLUMN CONTENT: PREVIEW ON LEFT, METADATA & WORKFLOW ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DOCUMENT PREVIEW (7 cols on lg) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Zoom toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span>Official Document Layout</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.45))}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] text-slate-600 min-w-[38px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.2))}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.85)}
                className="p-1 hover:bg-white rounded text-slate-600 ml-0.5"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {(() => {
            const isLandscape = certificate.certificateType === "pneumatic-actuator";
            const baseWidth = isLandscape ? 1123 : 794;
            const baseHeight = isLandscape ? 794 : 1123;
            return (
              <div className="bg-slate-200/70 rounded-3xl border border-slate-200 overflow-auto p-2 sm:p-8 shadow-inner min-h-[500px]">
                <div
                  className="mx-auto flex-shrink-0"
                  style={{
                    width: `${Math.round(baseWidth * zoomLevel)}px`,
                    height: `${Math.round(baseHeight * zoomLevel)}px`,
                    minWidth: `${Math.round(baseWidth * zoomLevel)}px`,
                    minHeight: `${Math.round(baseHeight * zoomLevel)}px`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${baseWidth}px`,
                      minWidth: `${baseWidth}px`,
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <CertificateRenderer
                      certificateType={certificate.certificateType}
                      data={certificate.certificateData}
                      certificateNumber={certificate.certificateNumber}
                      revision={certificate.revision}
                      status={certificate.status}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* WORKFLOW STATUS & AUDIT TRAIL SIDEBAR (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          {/* CERTIFICATE DETAILS SUMMARY CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Certificate Details
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold uppercase">
                {certificate.certificateType.replace("-", " ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5" title={(certificate.certificateData as unknown as Record<string, string>)?.customerName}>
                  {(certificate.certificateData as unknown as Record<string, string>)?.customerName || "-"}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sales Order</span>
                <span className="font-semibold text-slate-800 font-mono truncate block mt-0.5">
                  {(certificate.certificateData as unknown as Record<string, string>)?.salesOrderNo || "-"}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Model No</span>
                <span className="font-semibold text-slate-800 font-mono truncate block mt-0.5" title={(certificate.certificateData as unknown as Record<string, string>)?.modelNumber}>
                  {(certificate.certificateData as unknown as Record<string, string>)?.modelNumber || "-"}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">
                  {(certificate.certificateData as unknown as Record<string, string>)?.quantity ? `${(certificate.certificateData as unknown as Record<string, string>).quantity} Nos` : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* AUDIT TRAIL TIMELINE */}
          <AuditTimeline history={certificate.approvalHistory} />
        </div>
      </div>

      {/* CONFIRMATION MODALS */}
      {/* SUBMIT MODAL */}
      <ConfirmDialog
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title="Submit for Approval"
        message={`Are you ready to submit Certificate ${certificate.certificateNumber} for formal quality review?\n\nOnce submitted, an authorized approver will review and approve the certificate. You will not be able to modify the certificate while it is pending review.`}
        confirmLabel="Submit for Review"
        type="primary"
        isLoading={isActionLoading}
      />

      {/* APPROVE MODAL */}
      <ConfirmDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApprove}
        title={`Approve & Certify ${certificate.certificateNumber}`}
        message="By approving, you verify that all specified tests, pressure limits, and quality standards meet engineering compliance.\n\nOnce approved, this certificate will become permanently sealed and immutable.\n\nAre you sure you want to approve this certificate?"
        confirmLabel="Confirm Approval"
        type="success"
        isLoading={isActionLoading}
      />

      {/* REJECT MODAL */}
      <ConfirmDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
        title={`Reject Certificate ${certificate.certificateNumber}`}
        message="Rejecting returns this certificate to the creator for necessary corrections. Please specify what needs to be changed."
        confirmLabel="Reject Certificate"
        type="danger"
        requireReason={true}
        reasonPlaceholder="e.g. Response time exceeds 20ms limit, or incorrect PO number."
        isLoading={isActionLoading}
      />



      {/* DELETE DRAFT MODAL */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Draft Certificate"
        message={`Are you sure you want to delete draft certificate ${certificate.certificateNumber}?\n\nThis action cannot be undone.`}
        confirmLabel="Delete Draft"
        type="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
}
