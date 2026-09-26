import React from "react";
import { CertificateStatus } from "@/types/certificate";
import { CheckCircle2, Clock, XCircle, FileEdit } from "lucide-react";

interface StatusBadgeProps {
  status: CertificateStatus | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
  size = "md",
}) => {
  const normStatus = (status || "").toUpperCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2 font-semibold",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  switch (normStatus) {
    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]} ${className}`}
        >
          <CheckCircle2 className={`${iconSizes[size]} text-emerald-600 flex-shrink-0`} />
          <span>Approved</span>
        </span>
      );

    case "PENDING_APPROVAL":
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses[size]} ${className}`}
        >
          <Clock className={`${iconSizes[size]} text-amber-600 flex-shrink-0 animate-pulse`} />
          <span>Pending Approval</span>
        </span>
      );

    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses[size]} ${className}`}
        >
          <XCircle className={`${iconSizes[size]} text-red-600 flex-shrink-0`} />
          <span>Rejected</span>
        </span>
      );

    case "DRAFT":
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses[size]} ${className}`}
        >
          <FileEdit className={`${iconSizes[size]} text-slate-500 flex-shrink-0`} />
          <span>Draft</span>
        </span>
      );
  }
};
