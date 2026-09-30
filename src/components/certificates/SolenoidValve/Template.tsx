"use client";

import React from "react";
import { SolenoidValveCertificateData } from "@/types/certificate";
import { CertificateHeader } from "../common/CertificateHeader";
import { CertificateFooter } from "../common/CertificateFooter";
import { CertificateTable } from "@/components/CertificateTable";
import { SignatureSection } from "@/components/SignatureSection";

interface SolenoidValveTemplateProps {
  data: SolenoidValveCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
}

export const SolenoidValveTemplate: React.FC<SolenoidValveTemplateProps> = ({
  data,
  certificateNumber,
}) => {
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
      {/* Outer 1px border container */}
      <div className="w-full border border-black flex flex-col p-0 box-border bg-white">
        {/* Header with 1px borders and 4-box grid */}
        <CertificateHeader
          title="Certificate of Conformity"
          subtitle="Solenoid Valve"
          certificateNumber={certificateNumber}
          customerName={data.customerName}
          salesOrderNo={data.salesOrderNo}
          customerPO={data.customerPO}
          certificateDate={data.certificateDate}
        />

        {/* Table with 3 sections and 1px borders */}
        <CertificateTable data={data} />

        {/* Certification statement with 1px bottom border */}
        <div className="border-b border-black p-3 text-center bg-white">
          <p className="text-[11.5px] leading-relaxed font-bold">
            This is to certify that the solenoid valve listed above has been tested and inspected according to the applicable quality standards.
          </p>
          <p className="text-[11.5px] leading-relaxed font-bold mt-1">
            It has passed all specified tests and is compliant with the stated performance and safety requirements.
          </p>
        </div>

        {/* Signature section with 1px middle divider */}
        <SignatureSection data={data} />

        {/* Footer with 1px top border */}
        <CertificateFooter />
      </div>
    </div>
  );
};
