"use client";

import React from "react";

export interface SignatureSectionData {
  showSignatures?: boolean;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  witnessedBy?: string;
  verifiedBy?: string;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface SignatureSectionProps {
  data: SignatureSectionData;
  status?: string;
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({ data, status }) => {
  // Normalize certificate status
  const currentStatus = (status || data.status || "").toUpperCase();

  // Signature stage rules:
  // 1. DRAFT: 0 signatures (blank line for both)
  // 2. PENDING_APPROVAL: 1 signature (performed by only)
  // 3. APPROVED: 2 signatures (performed by + verified/approved by)
  // 4. REJECTED: 1 signature (performed by)
  const isDraft = currentStatus === "DRAFT" || !currentStatus;
  const isApproved = currentStatus === "APPROVED";

  const showPerformedSignature =
    !isDraft && Boolean(data.witnessSignatureUrl);

  const showVerifiedSignature =
    isApproved && Boolean(data.verifiedSignatureUrl);

  return (
    <div className="w-full text-black">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <tbody>
          <tr>
            {/* Performed By Column (Signatory 1) */}
            <td className="border-r border-black p-2 align-top">
              <div className="flex flex-col items-center justify-between min-h-[120px]">
                <div className="font-bold text-[12px] uppercase tracking-wide">
                  Performed By
                </div>

                <div className="my-1 flex items-center justify-center h-[70px] w-full">
                  {showPerformedSignature && data.witnessSignatureUrl ? (
                    <div
                      data-signature-img="true"
                      className="signature-image signature-image-container relative h-[65px] w-[140px]"
                    >
                      {/* Standard img tag for html2canvas & print compatibility */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.witnessSignatureUrl}
                        alt="Witness Signature"
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>
                  ) : (
                    <div
                      data-signature-blank="true"
                      className="signature-blank-line w-4/5 border-b border-dashed border-[#9ca3af] mt-10"
                    />
                  )}
                </div>

                <div className="font-bold text-[11px] sm:text-[12px] uppercase text-center">
                  {data.witnessedBy || "SIVAGANESHAN.V.A"}
                </div>
              </div>
            </td>

            {/* Verified By / Approved By Column (Signatory 2) */}
            <td className="p-2 align-top">
              <div className="flex flex-col items-center justify-between min-h-[120px]">
                <div className="font-bold text-[12px] uppercase tracking-wide">
                  Verified By
                </div>

                <div className="my-1 flex items-center justify-center h-[70px] w-full">
                  {showVerifiedSignature && data.verifiedSignatureUrl ? (
                    <div
                      data-signature-img="true"
                      className="signature-image signature-image-container relative h-[65px] w-[140px]"
                    >
                      {/* Standard img tag for html2canvas & print compatibility */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.verifiedSignatureUrl}
                        alt="Verified Signature"
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>
                  ) : (
                    <div
                      data-signature-blank="true"
                      className="signature-blank-line w-4/5 border-b border-dashed border-[#9ca3af] mt-10"
                    />
                  )}
                </div>

                <div className="font-bold text-[11px] sm:text-[12px] uppercase text-center">
                  {data.verifiedBy || "KARTHIKEYAN.A"}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
