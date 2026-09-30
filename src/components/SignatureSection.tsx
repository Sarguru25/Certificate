"use client";

import React from "react";
export interface SignatureSectionData {
  showSignatures?: boolean;
  witnessSignatureUrl?: string;
  verifiedSignatureUrl?: string;
  witnessedBy?: string;
  verifiedBy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface SignatureSectionProps {
  data: SignatureSectionData;
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({ data }) => {
  return (
    <div className="w-full text-black">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <tbody>
          <tr>
            {/* Performed By Column */}
            <td className="border-r border-black p-2 align-top">
              <div className="flex flex-col items-center justify-between min-h-[120px]">
                <div className="font-bold text-[12px] uppercase tracking-wide">
                  Performed By
                </div>

                <div className="my-1 flex items-center justify-center h-[70px] w-full">
                  {data.showSignatures && data.witnessSignatureUrl ? (
                    <>
                      <div
                        data-signature-img="true"
                        className="signature-image signature-image-container print-hide-signature relative h-[65px] w-[140px]"
                      >
                        {/* Standard img tag for html2canvas compatibility */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={data.witnessSignatureUrl}
                          alt="Witness Signature"
                          className="h-full w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div
                        data-signature-blank="true"
                        className="signature-blank-line print-show-blank hidden w-4/5 border-b border-dashed border-[#9ca3af] mt-10"
                      />
                    </>
                  ) : (
                    <div className="w-4/5 border-b border-dashed border-[#9ca3af] mt-10"></div>
                  )}
                </div>

                <div className="font-bold text-[11px] sm:text-[12px] uppercase text-center">
                  {data.witnessedBy || "SIVAGANESHAN.V.A"}
                </div>
              </div>
            </td>

            {/* Verified By Column */}
            <td className="p-2 align-top">
              <div className="flex flex-col items-center justify-between min-h-[120px]">
                <div className="font-bold text-[12px] uppercase tracking-wide">
                  Verified By
                </div>

                <div className="my-1 flex items-center justify-center h-[70px] w-full">
                  {data.showSignatures && data.verifiedSignatureUrl ? (
                    <>
                      <div
                        data-signature-img="true"
                        className="signature-image signature-image-container print-hide-signature relative h-[65px] w-[140px]"
                      >
                        {/* Standard img tag for html2canvas compatibility */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={data.verifiedSignatureUrl}
                          alt="Verified Signature"
                          className="h-full w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div
                        data-signature-blank="true"
                        className="signature-blank-line print-show-blank hidden w-4/5 border-b border-dashed border-[#9ca3af] mt-10"
                      />
                    </>
                  ) : (
                    <div className="w-4/5 border-b border-dashed border-[#9ca3af] mt-10"></div>
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
