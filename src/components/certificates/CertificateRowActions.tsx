"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Copy, Trash2, Loader2 } from "lucide-react";

interface CertificateRowActionsProps {
  certificateId: string;
  certificateType: string;
  status: string;
}

export const CertificateRowActions: React.FC<CertificateRowActionsProps> = ({
  certificateId,
  certificateType,
  status,
}) => {
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit is only applicable for DRAFT or REJECTED certificates (not locked/approved)
  const canEdit = status === "DRAFT" || status === "REJECTED";

  const handleClone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCloning) return;

    setIsCloning(true);
    try {
      const res = await fetch(`/api/certificates/${certificateId}/clone`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to clone certificate");
      }
      // Navigate to the edit view of the newly cloned draft certificate
      router.push(`/${certificateType}/${data.certificate._id}/edit`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to clone certificate");
      setIsCloning(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isDeleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this certificate? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/certificates/${certificateId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete certificate");
      }
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete certificate");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {/* EDIT ICON (IF APPLICABLE) */}
      {canEdit && (
        <Link
          href={`/${certificateType}/${certificateId}/edit`}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Edit Certificate"
        >
          <Pencil className="w-4 h-4" />
        </Link>
      )}

      {/* CLONE ICON */}
      <button
        type="button"
        onClick={handleClone}
        disabled={isCloning}
        className="p-1.5 text-slate-500 hover:text-[#FF2D01] hover:bg-orange-50 rounded-lg transition disabled:opacity-50"
        title="Clone Certificate"
      >
        {isCloning ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#FF2D01]" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* DELETE ICON */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        title="Delete Certificate"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
