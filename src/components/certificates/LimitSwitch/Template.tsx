"use client";

import React from "react";
import {
  LimitSwitchCertificateData,
  CustomField,
} from "@/types/certificate";
import { CertificateHeader } from "../common/CertificateHeader";
import { CertificateFooter } from "../common/CertificateFooter";
import { SignatureSection } from "@/components/SignatureSection";

interface LimitSwitchTemplateProps {
  data: LimitSwitchCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
}

export const LimitSwitchTemplate: React.FC<LimitSwitchTemplateProps> = ({
  data,
  certificateNumber,
}) => {
  // Quantity display: "X No's"
  const quantityDisplay = data.quantity ? `${data.quantity} No's` : "4 No's";

  // Date of test formatting
  const testDate = data.dateOfTest || data.certificateDate || "-";

  // --- SECTION 1: General Information Rows (matching Solenoid Valve structure) ---
  const generalCustom: CustomField[] = data.customFields?.general || [];
  const generalRows: Array<{
    description: string;
    technicalDetails: string;
    measuredValue: string;
    result: string;
  }> = [
    {
      description: "Product",
      technicalDetails: data.productName || "Limit Switch Box",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Model Number",
      technicalDetails: data.modelNumber || "ZLS-AP-Ex",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Quentity",
      technicalDetails: quantityDisplay,
      measuredValue: "-",
      result: "-",
    },
    ...generalCustom.map((cf) => ({
      description: cf.name || "Custom Field",
      technicalDetails: cf.value || "-",
      measuredValue: "-",
      result: "-",
    })),
  ];

  // --- SECTION 2: Product Information Rows ---
  const productCustom: CustomField[] = data.customFields?.product || [];
  const productRows: Array<{
    description: string;
    technicalDetails: string;
    measuredValue: string;
    result: string;
  }> = [
    {
      description: "Switch Type",
      technicalDetails: data.switchType || "Honeywell type",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Contact Type",
      technicalDetails: data.contactType || "SPDT *2",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Operating Voltage",
      technicalDetails: data.operatingVoltage || "125-250V AC",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Rated Current",
      technicalDetails: data.ratedCurrent || "16A",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Temp Range",
      technicalDetails: data.temperature || "-20°C TO +60°C",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Enclosure Rating",
      technicalDetails: data.enclosure || "Weatherproof : IP66",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Date of Test",
      technicalDetails: testDate,
      measuredValue: "-",
      result: "-",
    },
    ...productCustom.map((cf) => ({
      description: cf.name || "Custom Field",
      technicalDetails: cf.value || "-",
      measuredValue: "-",
      result: "-",
    })),
  ];

  // --- SECTION 3: Test Parameters & Results Rows ---
  const enabledTests = data.enabledTests || {};
  const testRows: Array<{
    description: string;
    technicalDetails: string;
    measuredValue: string;
    result: string;
  }> = [];

  // Test 1: Visual Inspection
  if (enabledTests.visualInspection !== false) {
    testRows.push({
      description: "Visual Inspection",
      technicalDetails:
        data.visualInspectionCriteria || "No physical damage, corrosion, or defects",
      measuredValue: data.visualInspectionMeasured || "No damage",
      result: data.visualInspectionResult || "Pass",
    });
  }

  // Test 2: Mechanical Operation
  if (enabledTests.mechanicalOperation !== false) {
    testRows.push({
      description: "Mechanical Operation",
      technicalDetails:
        data.mechanicalOperationCriteria || "Manual actuation of lever",
      measuredValue: data.mechanicalOperationMeasured || "Smooth",
      result: data.mechanicalOperationResult || "Pass",
    });
  }

  // Test 3: Contact Functionality Test
  if (enabledTests.contactFunctionality !== false) {
    testRows.push({
      description: "Contact Functionality Test",
      technicalDetails:
        data.contactFunctionalityCriteria || "NO/NC contacts toggle correctly",
      measuredValue: data.contactFunctionalityMeasured || "Functional",
      result: data.contactFunctionalityResult || "Pass",
    });
  }

  // Custom Tests added by user
  const testCustom: CustomField[] = data.customFields?.tests || [];
  testCustom.forEach((cf) => {
    testRows.push({
      description: cf.name || "Custom Test",
      technicalDetails: cf.value || "-",
      measuredValue: cf.result || "Functional",
      result: "Pass",
    });
  });

  // Fallback if all disabled
  if (testRows.length === 0) {
    testRows.push({
      description: "Standard Performance Inspection",
      technicalDetails: "Per engineering design specification",
      measuredValue: "Functional",
      result: "Pass",
    });
  }

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
        {/* Header */}
          <CertificateHeader
            title="Certificate of Conformity"
            subtitle="LIMIT SWITCH BOX"
            certificateNumber={certificateNumber}
            customerName={data.customerName}
            salesOrderNo={data.salesOrderNo}
            customerPO={data.customerPO}
            certificateDate={data.certificateDate}
          />

          {/* Table with 5 Columns: Section, Description, Technical Details, Measured value, Pass/Fail */}
          <div className="w-full text-black">
            <table className="w-full table-fixed border-collapse text-[11px] sm:text-[11.5px] leading-snug">
              <colgroup>
                {/* 18% + 32% = 50.00% (aligned with 50% grid divider above) */}
                <col style={{ width: "18%" }} />
                <col style={{ width: "32%" }} />
                {/* 26% + 13% + 11% = 50.00% */}
                <col style={{ width: "26%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "11%" }} />
              </colgroup>
              <thead>
                <tr className="bg-white font-bold text-center">
                  <th className="border-b border-r border-black py-2 px-1.5">
                    Section
                  </th>
                  <th className="border-b border-r border-black py-2 px-1.5">
                    Description
                  </th>
                  <th className="border-b border-r border-black py-2 px-1.5">
                    Technical Details
                  </th>
                  <th className="border-b border-r border-black py-2 px-1.5">
                    Measured value
                  </th>
                  <th className="border-b border-black py-2 px-1.5">
                    Pass/Fail
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* SECTION 1: GENERAL INFORMATION */}
                {generalRows.map((row, idx) => (
                  <tr key={`gen-${idx}`}>
                    {idx === 0 && (
                      <td
                        rowSpan={generalRows.length}
                        className="border-b border-r border-black px-2 py-1.5 font-bold text-center align-middle bg-white"
                      >
                        General Information
                      </td>
                    )}
                    <td className="border-b border-r border-black px-2.5 py-1.5 text-center font-medium">
                      {row.description}
                    </td>
                    <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                      {row.technicalDetails}
                    </td>
                    <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                      {row.measuredValue}
                    </td>
                    <td className="border-b border-black px-2 py-1.5 text-center font-normal">
                      {row.result}
                    </td>
                  </tr>
                ))}

                {/* SECTION 2: PRODUCT INFORMATION */}
                {productRows.map((row, idx) => (
                  <tr key={`prod-${idx}`}>
                    {idx === 0 && (
                      <td
                        rowSpan={productRows.length}
                        className="border-b border-r border-black px-2 py-1.5 font-bold text-center align-middle bg-white"
                      >
                        Product Information
                      </td>
                    )}
                    <td className="border-b border-r border-black px-2.5 py-1.5 text-center font-medium">
                      {row.description}
                    </td>
                    <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                      {row.technicalDetails}
                    </td>
                    <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                      {row.measuredValue}
                    </td>
                    <td className="border-b border-black px-2 py-1.5 text-center font-normal">
                      {row.result}
                    </td>
                  </tr>
                ))}

                {/* SECTION 3: TEST PARAMETERS & RESULTS */}
                {testRows.map((row, idx) => (
                  <tr key={`test-${idx}`}>
                    {idx === 0 && (
                      <td
                        rowSpan={testRows.length}
                        className="border-b border-r border-black px-2 py-1.5 font-bold text-center align-middle bg-white"
                      >
                        Test Parameters &amp; Results
                      </td>
                    )}
                    <td className="border-b border-r border-black px-2.5 py-1.5 text-center font-medium">
                      {row.description}
                    </td>
                    <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                      {row.technicalDetails}
                    </td>
                    <td className="border-b border-r border-black px-2 py-1.5 text-center font-medium">
                      {row.measuredValue}
                    </td>
                    <td className="border-b border-black px-2 py-1.5 text-center font-bold">
                      {row.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statement matching reference */}
          <div className="border-b border-black p-3 text-center bg-white font-bold text-[11.5px] leading-relaxed">
            The limit switch box has been tested as per standard procedures and is verified to be in proper working condition with all parameters within specified limits.
          </div>

          {/* Signatures */}
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

        <CertificateFooter />
      </div>
    </div>
  );
};
