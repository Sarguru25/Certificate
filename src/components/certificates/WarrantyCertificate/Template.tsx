"use client";

import React from "react";
import { WarrantyCertificateData, CustomField } from "@/types/certificate";

interface WarrantyTemplateProps {
  data: WarrantyCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
  onChange?: (newData: WarrantyCertificateData) => void;
}

export const DEFAULT_TERMS_OF_WARRANTY = [
  "This warranty excludes normal wear and tear, improper installation, storage, operation or maintenance, misuse, unauthorized modifications and external causes.",
  "For verified claims notified within the warranty period, our obligation is limited, at our option, to repair, replacement or refund of the price paid for the defective product.",
  "To the maximum extent permitted by law, we exclude liability for indirect or consequential losses, including production downtime and loss of profit. Our aggregate liability shall not exceed the price paid for the affected product, except where prohibited by applicable law.",
];

export const WarrantyCertificateTemplate: React.FC<WarrantyTemplateProps> = ({
  data,
  status,
  onChange,
}) => {
  const generalCustom: CustomField[] = data.customFields?.general || [];
  const productCustom: CustomField[] = data.customFields?.product || [];

  const customerName = data.customerName ?? "";
  const salesOrderNo = data.salesOrderNo ?? data.invoiceNo ?? "";
  const poNumber = data.customerPO ?? data.orderNo ?? "";
  const productDescription =
    data.productDescription ?? "Please refer above Sales Order";

  const companyName =
    data.companyName || "Zeetork Automation & Control Private Limited";
  const companyAddress =
    data.companyAddress ||
    "S.F. No-617/2H2, Vadakku Thottam, L&T Road, Malumichampatti, Coimbatore-641 021, Tamil Nadu, India.";
  const companyWebsite = data.companyWebsite || "www.zeetork.com";
  const companyEmail = data.companyEmail || "sales@zeetork.com";
  const gstNo = data.gstNo || "33AACCZ4754H1Z7";

  const declarationText =
    data.declarationText ??
    "We warrant that the products supplied under our above referred Sales Order conform to the agreed specifications and are free from manufacturing defects in materials and workmanship.";

  const warrantyPeriod =
    data.warrantyPeriod ??
    "18 months from the date of supply or 12 months from the date of installation, whichever occurs earlier. The installation date shall be substantiated by documentary evidence.";

  const termsOfWarranty =
    data.termsOfWarranty && data.termsOfWarranty.length > 0
      ? data.termsOfWarranty
      : DEFAULT_TERMS_OF_WARRANTY;

  const signatoryName = data.issuedBy || data.witnessedBy || "V.A SIVAGANESHAN";
  const signatureUrl =
    data.witnessSignatureUrl || "/signature/signature-sivaganeshan.png";

  const currentStatus = (status || (data as { status?: string }).status || "").toUpperCase();
  const isDraft = currentStatus === "DRAFT" || !currentStatus;
  const showSignatures = !isDraft && Boolean(signatureUrl) && data.showSignatures !== false;

  return (
    <div
      id="certificate-a4-document"
      data-certificate-page="1"
      data-orientation="portrait"
      className="certificate-a4-page relative bg-white mx-auto text-black select-text shadow-lg print:shadow-none print:m-0 box-border flex flex-col justify-between print:!p-[12mm]"
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "44px 54px 34px 54px",
        fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Corner Crop / Registration Marks matching the reference image */}
      {/* <div className="absolute top-5 left-5 w-3.5 h-3.5 border-t border-l border-gray-300 pointer-events-none" />
      <div className="absolute top-5 right-5 w-3.5 h-3.5 border-t border-r border-gray-300 pointer-events-none" />
      <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-gray-300 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-3.5 h-3.5 border-b border-r border-gray-300 pointer-events-none" /> */}

      {/* Main Content Area */}
      <div className="w-full flex flex-col">
        {/* Top Right Logo in thin border box */}
        <div className="flex justify-end mb-6">
          <div className="bg-white inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zeetork-logo.jpeg"
              alt="ZEETORK - the Automation & Controls Expert"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        {/* Left-Aligned Document Title */}
        <div className="mb-10 m-auto">
          <h1 className="text-[20px] sm:text-[20px] font-bold text-black uppercase tracking-wide">
            WARRANTY CERTIFICATE
          </h1>
        </div>

        {/* Customer & Order Reference Metadata */}
        <div className="text-[15px] text-black mb-10 leading-relaxed">
          <table className="border-collapse">
            <tbody>
              <tr>
                <td className="font-bold whitespace-nowrap pr-2 py-0.5 align-top">Customer Name</td>
                <td className="font-bold px-2 py-0.5 align-top text-center">:</td>
                <td className="text-black py-0.5 align-top">{customerName}</td>
              </tr>
              <tr>
                <td className="font-bold whitespace-nowrap pr-2 py-0.5 align-top">Sales Order No.</td>
                <td className="font-bold px-2 py-0.5 align-top text-center">:</td>
                <td className="text-black py-0.5 align-top">{salesOrderNo}</td>
              </tr>
              <tr>
                <td className="font-bold whitespace-nowrap pr-2 py-0.5 align-top">Customer PO No.</td>
                <td className="font-bold px-2 py-0.5 align-top text-center">:</td>
                <td className="text-black py-0.5 align-top">{poNumber}</td>
              </tr>
              <tr>
                <td className="font-bold whitespace-nowrap pr-2 py-0.5 align-top">Product Description</td>
                <td className="font-bold px-2 py-0.5 align-top text-center">:</td>
                <td className="text-black py-0.5 align-top">{productDescription}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Introductory Body Paragraph */}
        <p className="text-[15px] text-black leading-relaxed text-justify mb-8">
          {declarationText}
        </p>

        {/* Warranty Period Section */}
        <p className="text-[15px] text-black leading-relaxed text-justify mb-8">
          <span className="font-bold">Warranty Period: </span>
          {warrantyPeriod}
        </p>

        {/* Terms of Warranty Section */}
        <div className="space-y-2.5 mb-8">
          <div className="font-bold text-[15px] text-black mb-6">
            Terms of Warranty :
          </div>
          <ol className="space-y-5 text-[15px] text-black leading-relaxed">
            {termsOfWarranty.map((term, idx) => (
              <li key={idx} className="flex items-start text-justify">
                <span className="mr-3 font-medium select-none">{idx + 1}.</span>
                <span className="flex-1">{term}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Optional Serial Numbers & Custom Fields */}
        {data.serialNumbers && (
          <div className="text-[15px] text-black mb-4">
            <span className="font-bold">Serial / Identification Numbers: </span>
            <span>{data.serialNumbers}</span>
          </div>
        )}

        {(generalCustom.length > 0 || productCustom.length > 0) && (
          <div className="my-2 space-y-1 text-[15px] text-black">
            {[...generalCustom, ...productCustom].map((cf, idx) => (
              <div key={cf.id || idx}>
                <span className="font-bold">{cf.name}: </span>
                <span>{cf.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Signatory Section */}
        <div className="mt-2 mb-4">
          <div className="font-bold text-[15px] text-black mb-4">
            For and on behalf of {companyName}
          </div>

          <div className="items-end gap-2 text-[15px] text-black">
            <div className="relative inline-flex items-center min-w-[200px]">
              {showSignatures ? (
                <div className="relative flex items-center h-[62px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signatureUrl}
                    alt="Authorized Signature & Stamp"
                    className="h-[52px] w-auto object-contain mix-blend-multiply"
                  />
                </div>
              ) : (
                <div className="w-36 border-b border-black h-8 inline-block relative">
                  <span className="absolute right-0 bottom-0 h-3 border-black" />
                </div>
              )}
            </div>
            <div className="font-bold whitespace-nowrap">Authorized Signatory</div>
          </div>
        </div>
      </div>

      {/* Centered Clean Footer */}
      <div className="w-full text-center mt-auto pt-6 text-black">
        <div className="font-bold text-[11.5px] text-black tracking-wide">
          {companyName},
        </div>
        <div className="text-[10px] text-black mt-0.5 leading-snug">
          {companyAddress}
        </div>
        <div className="text-[10px] text-black mt-0.5 leading-snug">
          <a
            href={
              companyWebsite.startsWith("http")
                ? companyWebsite
                : `https://${companyWebsite}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {companyWebsite}
          </a>
          {" "}| Email:{" "}
          <a
            href={`mailto:${companyEmail}`}
            className="text-blue-600 underline"
          >
            {companyEmail}
          </a>
          {" "}| GST No: {gstNo}
        </div>
      </div>
    </div>
  );
};
