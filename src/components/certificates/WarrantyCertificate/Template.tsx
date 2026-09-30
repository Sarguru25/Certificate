"use client";

import React from "react";
import { WarrantyCertificateData, CustomField } from "@/types/certificate";
import { CertificateHeader } from "../common/CertificateHeader";
import { CertificateFooter } from "../common/CertificateFooter";

interface WarrantyTemplateProps {
  data: WarrantyCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
}

export const WarrantyCertificateTemplate: React.FC<WarrantyTemplateProps> = ({
  data,
  certificateNumber,
}) => {
  const generalCustom: CustomField[] = data.customFields?.general || [];
  const productCustom: CustomField[] = data.customFields?.product || [];

  // Helper to format date into DD.MM.YYYY
  const formatDisplayDate = (d?: string) => {
    if (!d) return "10.09.2026";
    if (d.includes("-")) {
      const parts = d.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      if (parts.length === 3) {
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
      }
    }
    return d;
  };

  const poNumber = data.customerPO || data.orderNo || "PO00900";
  const poDate = formatDisplayDate(data.customerPODate || data.invoiceDate || "10.09.2026");
  const salutation = data.salutation || "To whom so here it my concern,";
  const warrantyPeriod =
    data.warrantyPeriod ||
    "18 months from the date of supply or 12 months from the date of installation, whichever is earlier.";
  const warrantyNote =
    data.warrantyNote ||
    "The warranty is applicable only to manufacturing defects and does not cover normal wear and tear, improper usage, mishandling, or damage caused by improper installation or maintenance.";
  const signatoryName = data.issuedBy || data.witnessedBy || "V.A SIVAGANESHAN";
  const signatureUrl = data.witnessSignatureUrl || "/signature-sivaganeshan.png";
  const showSignatures = data.showSignatures !== false;

  return (
    <div
      id="certificate-a4-document"
      className="bg-white text-black font-sans box-border relative shadow-lg print:shadow-none print:transform-none"
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "24px 28px",
      }}
    >
      <div className="w-full border border-black flex flex-col p-0 box-border bg-white">
        {/* Header without subtitle bar */}
          <CertificateHeader
            title="WARRANTY CERTIFICATE"
            certificateNumber={certificateNumber}
            customerName={data.customerName}
            salesOrderNo={data.salesOrderNo || data.invoiceNo || data.orderNo}
            salesOrderDate={data.salesOrderDate}
            customerPO={data.customerPO || data.orderNo}
            customerPODate={data.customerPODate}
            certificateDate={data.certificateDate || data.invoiceDate}
            testingLocation={data.testingLocation}
          />

          {/* Clean Content Area without box borders */}
          <div className="px-10 py-6 space-y-4 text-black text-[12.5px] sm:text-[13px] leading-relaxed">
            {/* Product Description line */}
            <div className="font-bold text-[12.5px] sm:text-[13px] text-black">
              Product Description:
              {data.productDescription ? (
                <span className="font-medium ml-2 text-slate-900">
                  {data.productDescription}
                </span>
              ) : null}
            </div>

            {/* Salutation - Bold */}
            <div className="font-bold text-[13px] text-black pt-1">
              {salutation}
            </div>

            {/* Paragraph 1 - Justified */}
            <p className="text-justify indent-6" style={{ textAlign: "justify" }}>
              We hereby confirm that the supplied items are in accordance with Purchase
              Order No. <span className="font-semibold text-black">{poNumber}</span>, dated{" "}
              <span className="font-semibold text-black">{poDate}</span>.
            </p>

            {/* Paragraph 2 - Justified */}
            <p className="text-justify indent-6" style={{ textAlign: "justify" }}>
              The products supplied under the above-mentioned Purchase Order are
              manufactured to the highest standards and in accordance with the specified
              requirements. We confirm that the products carry a standard warranty period
              of {warrantyPeriod}
            </p>

            {/* Paragraph 3 - Note - Justified */}
            <p className="text-justify indent-6" style={{ textAlign: "justify" }}>
              <span className="font-bold text-black">Note:</span> {warrantyNote}
            </p>

            {/* Optional Serial Numbers */}
            {data.serialNumbers && (
              <div className="pt-2 text-[12px] font-mono text-slate-700">
                <span className="font-bold text-black font-sans">
                  Serial / Identification Numbers:
                </span>{" "}
                {data.serialNumbers}
              </div>
            )}

            {/* Optional Custom Fields */}
            {(generalCustom.length > 0 || productCustom.length > 0) && (
              <div className="pt-2 border-t border-dashed border-slate-300">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
                  {[...generalCustom, ...productCustom].map((cf, idx) => (
                    <div key={cf.id || idx} className="flex items-start gap-1.5">
                      {cf.name && (
                        <span className="font-bold text-black">{cf.name}</span>
                      )}
                      {cf.value && (
                        <span className="text-slate-800">{cf.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Statement, Single Signature, and Footer */}
        <div>
          {/* Statement with top and bottom border matching reference */}
          <div className="border-t border-b border-black p-3.5 text-center bg-white">
            <p className="text-[12px] sm:text-[12.5px] leading-relaxed font-bold text-black">
              This certificate confirms warranty coverage in accordance with standard Zeetork
              quality management and customer warranty provisions.
            </p>
          </div>

          {/* Single Signature Section with margin matching other certificates */}
          <div className="w-full text-black bg-white">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "50%" }} />
                <col style={{ width: "50%" }} />
              </colgroup>
              <tbody>
                <tr>
                  <td className="p-4 pl-10 align-top">
                    <div className="flex flex-col items-start min-h-[120px]">
                      <div className="font-bold text-[12.5px] text-black">
                        Yours sincerely,
                      </div>

                      <div className="my-2 flex items-center h-[70px]">
                        {showSignatures ? (
                          <>
                            <div
                              data-signature-img="true"
                              className="signature-image signature-image-container print-hide-signature relative h-[65px] w-[140px]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={signatureUrl}
                                alt="Authorized Signature"
                                className="h-full w-full object-contain mix-blend-multiply"
                              />
                            </div>
                            <div
                              data-signature-blank="true"
                              className="signature-blank-line print-show-blank hidden w-[140px] border-b border-dashed border-gray-400 mt-8"
                            />
                          </>
                        ) : (
                          <div className="w-[140px] border-b border-dashed border-gray-400 mt-8" />
                        )}
                      </div>

                      <div className="font-bold text-[12px] sm:text-[12.5px] uppercase text-black tracking-wide">
                        {signatoryName}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    {/* Empty right column so signature is in the left 50% matching other certificates */}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <CertificateFooter />
      </div>
    </div>
  );
};
