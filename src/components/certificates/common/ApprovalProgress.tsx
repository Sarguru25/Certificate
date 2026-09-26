import React from "react";
import { CertificateApproval, CertificateStatus } from "@/types/certificate";
import { CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";
import { formatDisplayDate } from "@/lib/certificateDefaults";

interface ApprovalProgressProps {
  status: CertificateStatus;
  approval: CertificateApproval;
  approvedAt?: string | Date;
}

export const ApprovalProgress: React.FC<ApprovalProgressProps> = ({
  status,
  approval,
  approvedAt,
}) => {
  const approvals = approval?.approvals || [];
  const approvedRecord = approvals.find((a) => a.status === "APPROVED");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* HEADER WITH OVERALL STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${status === "APPROVED" ? "text-emerald-600" : "text-[#FF2D01]"}`} />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
            Approval Status & Verification
          </h3>
        </div>
        <div>
          {status === "APPROVED" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Approved
            </span>
          ) : status === "REJECTED" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-xs">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Rejected
            </span>
          ) : status === "PENDING_APPROVAL" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Pending Approval
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Draft (Unsubmitted)
            </span>
          )}
        </div>
      </div>

      {/* WORKFLOW SUMMARY SUBTEXT */}
      {status === "PENDING_APPROVAL" && (
        <p className="text-xs text-slate-500 leading-relaxed">
          Awaiting review by an authorized approver. Once any authorized approver approves this certificate, it will be marked as certified and sealed.
        </p>
      )}

      {status === "APPROVED" && (
        <p className="text-xs text-slate-500 leading-relaxed">
          This certificate has passed engineering quality inspection and is officially approved and sealed.
        </p>
      )}

      {/* APPROVER LIST: FULL-WIDTH VERTICAL STACK TO PREVENT HORIZONTAL CUTOFF */}
      <div className="flex flex-col gap-3">
        {approvals.map((app, idx) => {
          const isAppApproved = app.status === "APPROVED";
          const isAppRejected = app.status === "REJECTED";
          const isAppPending = app.status === "PENDING";

          // User details may be populated object or string ID
          const userObj = typeof app.userId === "object" && app.userId !== null
            ? (app.userId as { name?: string; email?: string })
            : null;
          const displayName = app.userName || userObj?.name || `Approver ${idx + 1}`;
          const displayEmail = app.userEmail || userObj?.email || "";

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all shadow-2xs ${
                isAppApproved
                  ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200/50"
                  : isAppRejected
                  ? "bg-red-50/70 border-red-300"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isAppApproved
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : isAppRejected
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-slate-200/80 text-slate-600 border border-slate-300"
                    }`}
                  >
                    {isAppApproved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isAppRejected ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight truncate">
                      {displayName}
                    </h4>
                    {displayEmail && (
                      <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isAppApproved && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Approved
                    </span>
                  )}
                  {isAppRejected && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-md border border-red-200">
                      <XCircle className="w-3 h-3 text-red-600" />
                      Rejected
                    </span>
                  )}
                  {isAppPending && (
                    <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {app.approvedAt && (
                <div className="mt-2.5 pt-2 border-t border-emerald-200/70 text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="text-slate-500">Approved on:</span>
                  <span className="font-semibold text-emerald-900 font-mono">
                    {formatDisplayDate(new Date(app.approvedAt).toISOString().slice(0, 10))}
                  </span>
                </div>
              )}

              {app.note && (
                <div className="mt-2 text-[11px] text-slate-700 italic bg-white/90 p-2 rounded-lg border border-slate-200">
                  &ldquo;{app.note}&rdquo;
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FINAL CERTIFICATION SEAL BANNER */}
      {status === "APPROVED" && (
        <div className="mt-4 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-emerald-900">
              Certificate Verified & Sealed
            </span>
            <p className="text-[11px] text-emerald-800">
              {approvedRecord
                ? `Approved by ${approvedRecord.userName || "authorized reviewer"}. Document is official and immutable.`
                : approvedAt
                ? `Approved on ${new Date(approvedAt).toLocaleDateString()}. Document is official and immutable.`
                : "Document is verified and immutable."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
