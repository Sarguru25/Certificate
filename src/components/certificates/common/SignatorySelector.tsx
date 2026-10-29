"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export interface SignatoryUser {
  _id: string;
  name: string;
  email: string;
  signature?: string;
  roleName?: string;
}

export interface SignatorySelectorProps {
  witnessedBy?: string;
  verifiedBy?: string;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  onChangeWitnessedBy: (name: string, signatureUrl?: string) => void;
  onChangeVerifiedBy: (name: string, signatureUrl?: string) => void;
  errors?: Record<string, string>;
  isWarranty?: boolean;
  issuedBy?: string;
  onChangeIssuedBy?: (name: string, signatureUrl?: string) => void;
}

export const SignatorySelector: React.FC<SignatorySelectorProps> = ({
  witnessedBy = "",
  verifiedBy = "",
  witnessSignatureUrl = "",
  verifiedSignatureUrl = "",
  onChangeWitnessedBy,
  onChangeVerifiedBy,
  errors = {},
  isWarranty = false,
  issuedBy = "",
  onChangeIssuedBy,
}) => {
  const [signatories, setSignatories] = useState<SignatoryUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadSignatories() {
      try {
        const res = await fetch("/api/users/signatories");
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.signatories) {
            setSignatories(json.signatories);
          }
        }
      } catch (e) {
        console.error("Failed to load signatories:", e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadSignatories();
    return () => {
      ignore = true;
    };
  }, []);

  // For Warranty Certificate (Single Signatory)
  if (isWarranty) {
    const currentName = issuedBy || witnessedBy || "";
    const matchedUser = signatories.find(
      (u) => u.name.toLowerCase() === currentName.toLowerCase()
    );

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Authorized Signatory / Issued By <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <select
              value={matchedUser?._id || ""}
              onChange={(e) => {
                const selected = signatories.find((u) => u._id === e.target.value);
                if (selected) {
                  onChangeIssuedBy?.(selected.name, selected.signature || "");
                  onChangeWitnessedBy(selected.name, selected.signature || "");
                }
              }}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
            >
              <option value="">-- Select Signatory Employee --</option>
              {signatories.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} {u.roleName ? `(${u.roleName})` : ""} {u.signature ? "• [Sign Assigned]" : "• [No Sign]"}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={currentName}
              onChange={(e) => {
                onChangeIssuedBy?.(e.target.value, witnessSignatureUrl);
                onChangeWitnessedBy(e.target.value, witnessSignatureUrl);
              }}
              placeholder="Or enter custom name"
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] text-slate-600 bg-slate-50/50"
            />
          </div>

          {witnessSignatureUrl ? (
            <div className="mt-2.5 p-2 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-20 bg-white border border-emerald-100 rounded-lg p-1 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={witnessSignatureUrl}
                    alt="Authorized Sign"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Signature Linked</span>
                  </div>
                  <p className="text-[10px] font-mono text-emerald-700/80">{witnessSignatureUrl.split("/").pop()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>No digital signature image linked for this signatory.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard 2-Signatory Selector (Performed By & Verified / Approved By)
  const matchedWitness = signatories.find(
    (u) => u.name.toLowerCase() === (witnessedBy || "").toLowerCase()
  );
  const matchedVerifier = signatories.find(
    (u) => u.name.toLowerCase() === (verifiedBy || "").toLowerCase()
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. PERFORMED BY */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#FF2D01]" />
            <span>Employee Who Performed (Signatory 1)</span>
            <span className="text-red-500">*</span>
          </span>
        </label>

        <select
          value={matchedWitness?._id || ""}
          onChange={(e) => {
            const selected = signatories.find((u) => u._id === e.target.value);
            if (selected) {
              onChangeWitnessedBy(selected.name, selected.signature || "");
            }
          }}
          className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer ${
            errors.witnessedBy ? "border-red-400 bg-red-50/30" : "border-slate-300"
          }`}
        >
          <option value="">-- Select Performed Employee --</option>
          {signatories.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} {u.roleName ? `(${u.roleName})` : ""} {u.signature ? "• [Sign Assigned]" : "• [No Sign]"}
            </option>
          ))}
        </select>

        <input
          type="text"
          data-field="witnessedBy"
          value={witnessedBy}
          onChange={(e) => onChangeWitnessedBy(e.target.value, witnessSignatureUrl)}
          placeholder="Or type custom name"
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] text-slate-600 bg-slate-50/50"
        />

        {errors.witnessedBy && (
          <p className="text-xs text-red-600">{errors.witnessedBy}</p>
        )}

        {witnessSignatureUrl ? (
          <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-18 bg-white border border-emerald-100 rounded-lg p-0.5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={witnessSignatureUrl}
                  alt="Performed Sign"
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 block">Sign Linked</span>
                <span className="text-[10px] font-mono text-emerald-700/80">{witnessSignatureUrl.split("/").pop()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
            No signature image assigned
          </div>
        )}
      </div>

      {/* 2. APPROVED / VERIFIED BY */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Employee Who Approved (Signatory 2)</span>
            <span className="text-red-500">*</span>
          </span>
        </label>

        <select
          value={matchedVerifier?._id || ""}
          onChange={(e) => {
            const selected = signatories.find((u) => u._id === e.target.value);
            if (selected) {
              onChangeVerifiedBy(selected.name, selected.signature || "");
            }
          }}
          className={`w-full text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer ${
            errors.verifiedBy ? "border-red-400 bg-red-50/30" : "border-slate-300"
          }`}
        >
          <option value="">-- Select Approver Employee --</option>
          {signatories.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} {u.roleName ? `(${u.roleName})` : ""} {u.signature ? "• [Sign Assigned]" : "• [No Sign]"}
            </option>
          ))}
        </select>

        <input
          type="text"
          data-field="verifiedBy"
          value={verifiedBy}
          onChange={(e) => onChangeVerifiedBy(e.target.value, verifiedSignatureUrl)}
          placeholder="Or type custom name"
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] text-slate-600 bg-slate-50/50"
        />

        {errors.verifiedBy && (
          <p className="text-xs text-red-600">{errors.verifiedBy}</p>
        )}

        {verifiedSignatureUrl ? (
          <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-18 bg-white border border-emerald-100 rounded-lg p-0.5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={verifiedSignatureUrl}
                  alt="Verified Sign"
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 block">Sign Linked</span>
                <span className="text-[10px] font-mono text-emerald-700/80">{verifiedSignatureUrl.split("/").pop()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
            No signature image assigned
          </div>
        )}
      </div>
    </div>
  );
};
