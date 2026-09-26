"use client";

import React from "react";
import { SolenoidValveCertificateData, CustomField } from "@/types/certificate";

interface CertificateTableProps {
  data: SolenoidValveCertificateData;
}

export const CertificateTable: React.FC<CertificateTableProps> = ({ data }) => {
  // Format quantity display as "X nos" (matching Image 2)
  const quantityDisplay = data.quantity ? `${data.quantity} nos` : "-";

  // Protection row label & detail
  const isWeather = data.protectionType !== "Exproof";
  const exproofValue = data.exproofType || "Exdb IIIC T6 Gb";
  const protectionItemLabel = isWeather
    ? "Weather :IP66"
    : `Exproof : ${exproofValue}`;
  const protectionDetail = isWeather
    ? data.protectionRating || "IP66"
    : exproofValue;

  // --- SECTION 1: General Information Rows ---
  const generalCustom: CustomField[] = data.customFields?.general || [];
  const generalRows: Array<{ item: string; details: string; result: string }> = [
    {
      item: "Product",
      details: data.valveType || "Solenoid Valve",
      result: "-",
    },
    {
      item: "Model Number",
      details: data.modelNumber || "-",
      result: "-",
    },
    {
      item: "Quentity",
      details: quantityDisplay,
      result: "-",
    },
    ...generalCustom.map((cf) => ({
      item: cf.name || "Custom Field",
      details: cf.value || "-",
      result: cf.result || "-",
    })),
  ];

  // --- SECTION 2: Product Information Rows ---
  const productCustom: CustomField[] = data.customFields?.product || [];
  const productRows: Array<{ item: string; details: string; result: string }> = [
    {
      item: "Configuration",
      details: data.configuration || "5/2 Way",
      result: "-",
    },
    {
      item: "Operating Voltage",
      details: data.operatingVoltage || "24 V DC",
      result: "-",
    },
    {
      item: "Fail Type",
      details: data.coilType || "Normally Closed (NC)",
      result: "-",
    },
    {
      item: "Mounting",
      details: data.mounting || "Namur",
      result: "-",
    },
    {
      item: "Port Size",
      details: data.portSize || '1/4" BSP',
      result: "-",
    },
    {
      item: protectionItemLabel,
      details: protectionDetail,
      result: "-",
    },
    ...productCustom.map((cf) => ({
      item: cf.name || "Custom Field",
      details: cf.value || "-",
      result: cf.result || "-",
    })),
  ];

  // --- SECTION 3: Test Parameters & Results Rows ---
  // Respect user checkboxes for omitting unwanted tests (Requirement 8)
  const enabledTests = data.enabledTests || {};
  const testRows: Array<{ item: string; details: string; result: string }> = [];

  if (enabledTests.switchingTest !== false) {
    testRows.push({
      item: "Switching Test",
      details: data.switchingTestCriteria || data.operatingVoltage || "24V DC",
      result: data.switchingTestResult || "OK",
    });
  }

  if (enabledTests.responseTime !== false) {
    testRows.push({
      item: "Response Time",
      details: data.responseTimeCriteria || "< 20 ms",
      result: data.responseTimeResult || "15 ms",
    });
  }

  if (enabledTests.leakTest !== false) {
    testRows.push({
      item: "Leak Test",
      details: data.leakTestCriteria || "Air @ 6 bar",
      result: data.leakTestResult || "No leakage",
    });
  }

  if (enabledTests.operatingPressure !== false) {
    testRows.push({
      item: "Operating Pressure",
      details: data.operatingPressureCriteria || "0.5 – 10 bar",
      result: data.operatingPressureResult || "OK",
    });
  }

  // Custom test parameters added by the creator
  const testCustom: CustomField[] = data.customFields?.tests || [];
  testCustom.forEach((cf) => {
    testRows.push({
      item: cf.name || "Custom Test",
      details: cf.value || "-",
      result: cf.result || "OK",
    });
  });

  // Fallback if creator disabled all tests
  if (testRows.length === 0) {
    testRows.push({
      item: "Quality & Functional Inspection",
      details: "Per standard specification",
      result: "OK",
    });
  }

  return (
    <div className="w-full text-black">
      <table className="w-full table-fixed border-collapse text-[11px] sm:text-[12px] leading-6">
        <colgroup>
          <col style={{ width: "22%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "35%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr className="bg-white font-bold text-center">
            <th className="border-b border-r border-black py-1.5 px-2">
              Section
            </th>
            <th className="border-b border-r border-black py-1.5 px-2">
              Item
            </th>
            <th className="border-b border-r border-black py-1.5 px-2">
              Details/Criteria
            </th>
            <th className="border-b border-black py-1.5 px-2">
              Result
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
              <td className="border-b border-r border-black px-2 py-1.5 text-center font-medium">
                {row.item}
              </td>
              <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                {row.details}
              </td>
              <td className="border-b border-black px-2 py-1.5 text-center font-medium">
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
              <td className="border-b border-r border-black px-2 py-1.5 text-center font-medium">
                {row.item}
              </td>
              <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                {row.details}
              </td>
              <td className="border-b border-black px-2 py-1.5 text-center font-medium">
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
                  Test Parameters & Results
                </td>
              )}
              <td className="border-b border-r border-black px-2 py-1.5 text-center font-medium">
                {row.item}
              </td>
              <td className="border-b border-r border-black px-2 py-1.5 text-center font-normal">
                {row.details}
              </td>
              <td className="border-b border-black px-2 py-1.5 text-center font-bold">
                {row.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
