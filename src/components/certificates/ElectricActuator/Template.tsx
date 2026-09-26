"use client";

import React from "react";
import {
  ElectricActuatorCertificateData,
  CustomField,
} from "@/types/certificate";
import { CertificateHeader } from "../common/CertificateHeader";
import { CertificateFooter } from "../common/CertificateFooter";
import { SignatureSection } from "@/components/SignatureSection";

interface ElectricActuatorTemplateProps {
  data: ElectricActuatorCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
}

export const ElectricActuatorTemplate: React.FC<ElectricActuatorTemplateProps> = ({
  data,
  certificateNumber,
}) => {
  // Quantity formatting matching reference: "X No's"
  const quantityDisplay = data.quantity ? `${data.quantity} No's` : "2 No's";

  // Clean torque display (number + " Nm")
  const rawTorque = String(data.torque ?? "30").replace(/[^0-9.]/g, "");
  const torqueDisplay = rawTorque ? `${rawTorque} Nm` : "30 Nm";

  // Date of test formatting
  const testDate = data.dateOfTest || data.certificateDate || "-";

  // --- SECTION 1: General Information Rows (matching Solenoid Valve structure, no Serial Number) ---
  const generalCustom: CustomField[] = data.customFields?.general || [];
  const generalRows: Array<{
    description: string;
    technicalDetails: string;
    measuredValue: string;
    result: string;
  }> = [
    {
      description: "Product",
      technicalDetails: data.productName || "Electric Actuator",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Model Number",
      technicalDetails: data.modelNumber || "ZREQT - 03, 24 VDC (S)",
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
      description: "Type",
      technicalDetails: data.actuatorType || "Rotary Elecric Actuator",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Rated Torque",
      technicalDetails: torqueDisplay,
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Operating Voltage",
      technicalDetails: data.operatingVoltage || "24v DC",
      measuredValue: "-",
      result: "-",
    },
    {
      description: "Temperature",
      technicalDetails: data.temperature || "-25c to 70c",
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

  // Test 2: Supply / Rated Voltage
  if (enabledTests.supplyVoltage !== false) {
    testRows.push({
      description: "Supply / Rated Voltage",
      technicalDetails:
        data.supplyVoltageCriteria || data.operatingVoltage || "24V DC",
      measuredValue: data.supplyVoltageMeasured || "24V",
      result: data.supplyVoltageResult || "Pass",
    });
  }

  // Test 3: Current Consumption
  if (enabledTests.currentConsumption !== false) {
    testRows.push({
      description: "Current Consumption",
      technicalDetails: data.currentConsumptionCriteria || "≤1 A",
      measuredValue: data.currentConsumptionMeasured || ".25A",
      result: data.currentConsumptionResult || "Pass",
    });
  }

  // Test 4: Rotation Angle
  if (enabledTests.rotationAngle !== false) {
    testRows.push({
      description: "Rotation Angle",
      technicalDetails: data.rotationAngleCriteria || "90°±2%",
      measuredValue: data.rotationAngleMeasured || "90°",
      result: data.rotationAngleResult || "Pass",
    });
  }

  // Test 5: Operating Time (90°)
  if (enabledTests.operatingTime !== false) {
    testRows.push({
      description: "Operating Time (90°)",
      technicalDetails: data.operatingTimeCriteria || "≤7 Sec",
      measuredValue: data.operatingTimeMeasured || "7 Sec",
      result: data.operatingTimeResult || "Pass",
    });
  }

  // Test 6: Functional Test (Open/Close)
  if (enabledTests.functionalTest !== false) {
    testRows.push({
      description: "Functional Test (Open/Close)",
      technicalDetails: data.functionalTestCriteria || "Smooth Operation",
      measuredValue: data.functionalTestMeasured || "Smooth",
      result: data.functionalTestResult || "Pass",
    });
  }

  // Custom Tests added by user
  const testCustom: CustomField[] = data.customFields?.tests || [];
  testCustom.forEach((cf) => {
    testRows.push({
      description: cf.name || "Custom Test",
      technicalDetails: cf.value || "-",
      measuredValue: cf.result || "OK",
      result: "Pass",
    });
  });

  // Fallback if all disabled
  if (testRows.length === 0) {
    testRows.push({
      description: "Standard Performance Inspection",
      technicalDetails: "Per engineering design specification",
      measuredValue: "Compliant",
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
      <div className="w-full h-full border border-black flex flex-col justify-between p-0 box-border bg-white">
        <div>
          {/* Header */}
          <CertificateHeader
            title="Certificate of Conformity"
            subtitle="ELECTRIC ACTUATOR"
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

          {/* Statement matching reference image */}
          <div className="border-b border-black p-3 text-center bg-white font-bold text-[11.5px] leading-relaxed">
            The electric actuator has been tested as per standard procedures and is verified to be in proper working condition with all parameters within specified limits.
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
        </div>

        <CertificateFooter />
      </div>
    </div>
  );
};
