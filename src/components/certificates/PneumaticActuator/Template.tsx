"use client";

import React from "react";
import {
  PneumaticActuatorCertificateData,
  PneumaticActuatorLineItem,
} from "@/types/certificate";
import { CertificateHeader } from "../common/CertificateHeader";
import { CertificateFooter } from "../common/CertificateFooter";
import { SignatureSection } from "@/components/SignatureSection";

interface PneumaticActuatorTemplateProps {
  data: PneumaticActuatorCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
}

export const PneumaticActuatorTemplate: React.FC<PneumaticActuatorTemplateProps> = ({
  data,
  certificateNumber,
}) => {
  const lineItems: PneumaticActuatorLineItem[] =
    data.lineItems && data.lineItems.length > 0
      ? data.lineItems
      : [
          {
            sNo: 1,
            actuatorMake: "ZEETORK",
            actuatorModel: "ZRC8DA",
            springQty: "N/A for DA",
            actuatorSerialNo: "250106464",
            accessoriesCheck: "NA",
            testPrBar: "6",
            stroke1Open: "0.3S",
            stroke1Close: "0.3S",
            stroke2Open: "0.3S",
            stroke2Close: "0.3S",
            stroke3Open: "0.3S",
            stroke3Close: "0.3S",
            result: "Pass",
          },
        ];

  return (
    <div
      id="certificate-a4-document"
      data-orientation="landscape"
      className="bg-white text-black font-sans box-border relative shadow-lg print:shadow-none print:transform-none"
      style={{
        width: "1123px",
        minHeight: "794px",
        padding: "20px 24px",
      }}
    >
      {/* Force print driver to landscape orientation */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 0mm !important;
          }
        }
      `}</style>

      {/* Outer 1px border container */}
      <div className="w-full h-full border border-black flex flex-col justify-between p-0 box-border bg-white">
        <div>
          {/* Header with 1px borders and 4-box grid */}
          <CertificateHeader
            title="Certificate of Conformity"
            subtitle="Pneumatic Actuator"
            certificateNumber={certificateNumber}
            customerName={data.customerName}
            salesOrderNo={data.salesOrderNo}
            salesOrderDate={data.salesOrderDate}
            customerPO={data.customerPO}
            customerPODate={data.customerPODate}
            certificateDate={data.certificateDate}
            testingLocation={data.testingLocation || "Coimbatore"}
          />

          {/* Pneumatic Actuators Line Items Table in Landscape Orientation */}
          <div className="w-full text-black">
            <table className="w-full table-fixed border-collapse text-[11px] sm:text-[11.5px] leading-snug">
              <colgroup>
                {/* S.No */}
                <col style={{ width: "3.5%" }} />
                {/* Actuator Make */}
                <col style={{ width: "10%" }} />
                {/* Actuator Model */}
                <col style={{ width: "10.5%" }} />
                {/* Spring Qty */}
                <col style={{ width: "9%" }} />
                {/* Actuator Serial No. */}
                <col style={{ width: "13%" }} />
                {/* Accessories Check */}
                <col style={{ width: "8%" }} />
                {/* Test Pr. Bar */}
                <col style={{ width: "6%" }} />
                {/* Stroke 1: Open & Close (5.75% each = 11.5%) */}
                <col style={{ width: "5.75%" }} />
                <col style={{ width: "5.75%" }} />
                {/* Stroke 2: Open & Close (5.75% each = 11.5%) */}
                <col style={{ width: "5.75%" }} />
                <col style={{ width: "5.75%" }} />
                {/* Stroke 3: Open & Close (5.75% each = 11.5%) */}
                <col style={{ width: "5.75%" }} />
                <col style={{ width: "5.75%" }} />
                {/* Result */}
                <col style={{ width: "5.5%" }} />
              </colgroup>

              <thead>
                {/* Tier 1 Header */}
                <tr className="font-bold text-center text-black">
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    S.No.
                  </th>
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Actuator<br />Make
                  </th>
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Actuator<br />Model
                  </th>
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Spring<br />Qty
                  </th>
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Actuator<br />Serial No.
                  </th>
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Accessories<br />Check
                  </th>
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Test Pr.<br />Bar
                  </th>
                  <th
                    colSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Stroke 1
                  </th>
                  <th
                    colSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Stroke 2
                  </th>
                  <th
                    colSpan={2}
                    className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Stroke 3
                  </th>
                  <th
                    rowSpan={2}
                    className="bg-[#e2e8f0] border-b border-black py-1 px-1 align-middle text-center leading-tight text-[11px]"
                  >
                    Result
                  </th>
                </tr>

                {/* Tier 2 Header */}
                <tr className="font-bold text-center text-black text-[10px] sm:text-[10.5px]">
                  <th className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 whitespace-nowrap align-middle">
                    Open(Sec)
                  </th>
                  <th className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 whitespace-nowrap align-middle">
                    Close(Sec)
                  </th>
                  <th className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 whitespace-nowrap align-middle">
                    Open(Sec)
                  </th>
                  <th className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 whitespace-nowrap align-middle">
                    Close(Sec)
                  </th>
                  <th className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 whitespace-nowrap align-middle">
                    Open(Sec)
                  </th>
                  <th className="bg-[#e2e8f0] border-b border-r border-black py-1 px-1 whitespace-nowrap align-middle">
                    Close(Sec)
                  </th>
                </tr>
              </thead>

              <tbody>
                {lineItems.map((item, idx) => (
                  <tr
                    key={item.id || `actuator-row-${idx}`}
                    className="text-center font-normal hover:bg-slate-50/50"
                  >
                    <td className="border-b border-r border-black py-1.5 px-1 font-medium">
                      {item.sNo ?? idx + 1}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1.5 font-semibold uppercase">
                      {item.actuatorMake || "ZEETORK"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1.5 font-semibold">
                      {item.actuatorModel || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1.5">
                      {item.springQty || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1.5 font-mono">
                      {item.actuatorSerialNo || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1">
                      {item.accessoriesCheck || "NA"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1">
                      {item.testPrBar || "6"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1 font-mono">
                      {item.stroke1Open || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1 font-mono">
                      {item.stroke1Close || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1 font-mono">
                      {item.stroke2Open || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1 font-mono">
                      {item.stroke2Close || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1 font-mono">
                      {item.stroke3Open || "-"}
                    </td>
                    <td className="border-b border-r border-black py-1.5 px-1 font-mono">
                      {item.stroke3Close || "-"}
                    </td>
                    <td className="border-b border-black py-1.5 px-1 font-bold">
                      {item.result || "Pass"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statement matching reference and standards */}
          <div className="border-b border-black p-2.5 text-center bg-white font-bold text-[11px] sm:text-[11.5px] leading-relaxed">
            The pneumatic actuator(s) listed above have been tested as per standard procedures and verified to be in proper working condition with all parameters within specified limits.
          </div>

          {/* Signatures matching other certificates */}
          <SignatureSection
            data={{
              ...data,
              showSignatures: true,
              witnessSignatureUrl: data.witnessSignatureUrl || "/signature-sivaganeshan.png",
              verifiedSignatureUrl: data.verifiedSignatureUrl || "/signature-karthikeyan.jpeg",
              witnessedBy: data.witnessedBy || "SIVAGANESHAN.V.A",
              verifiedBy: data.verifiedBy || "KARTHIKEYAN.A",
            }}
          />
        </div>

        <CertificateFooter />
      </div>
    </div>
  );
};
