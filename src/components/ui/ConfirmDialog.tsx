"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { AlertCircle, CheckCircle2, Trash2, ArrowRight } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "success" | "primary";
  requireReason?: boolean;
  reasonPlaceholder?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "primary",
  requireReason = false,
  reasonPlaceholder = "Please provide the reason...",
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleConfirm = async () => {
    if (requireReason && (!reason || reason.trim().length < 3)) {
      setReasonError("A reason of at least 3 characters is required.");
      return;
    }
    setReasonError("");
    await onConfirm(reason);
    setReason("");
  };

  const icons = {
    danger: <Trash2 className="w-6 h-6 text-red-600" />,
    warning: <AlertCircle className="w-6 h-6 text-amber-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    primary: <ArrowRight className="w-6 h-6 text-[#FF2D01]" />,
  };

  const buttonColors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    primary: "bg-[#FF2D01] hover:bg-[#e02800] text-white",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-slate-100 rounded-full">
            {icons[type]}
          </div>
          <div>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {requireReason && (
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder={reasonPlaceholder}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent transition"
            />
            {reasonError && (
              <p className="text-xs text-red-600 font-medium">{reasonError}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition flex items-center gap-2 shadow-sm ${buttonColors[type]} disabled:opacity-50`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
