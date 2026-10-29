"use client";

import React from "react";
import {
  ValveFunctionalTestCertificateData,
  ValveFunctionalTestLineItem,
  ValveFunctionalTestProductGroup,
} from "@/types/certificate";

interface ValveFunctionalTestTemplateProps {
  data: ValveFunctionalTestCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
  activePageIndex?: number;
  showAllPages?: boolean;
}

/**
 * Calculate the incremental certificate number for each page.
 * E.g., if base is "ZIN2600053", page 1 (offset 0) => "ZIN2600053", page 2 (offset 1) => "ZIN2600054", etc.
 */
function getPageCertificateNumber(baseNumber?: string, pageIndex: number = 0): string {
  if (!baseNumber) return "DRAFT";
  if (baseNumber.toUpperCase() === "DRAFT") return "DRAFT";
  if (pageIndex <= 0) return baseNumber;

  const match = baseNumber.match(/^(.*?)(\d+)$/);
  if (!match) {
    return baseNumber;
  }

  const prefix = match[1];
  const numStr = match[2];
  const numDigits = numStr.length;
  const currentNum = parseInt(numStr, 10);
  if (isNaN(currentNum)) return baseNumber;

  const nextNum = currentNum + pageIndex;
  const nextNumStr = String(nextNum).padStart(numDigits, "0");
  return `${prefix}${nextNumStr}`;
}

export interface RenderPageData {
  pageIndex: number; // 0-indexed across all pages
  pageNumber: number; // 1-indexed across all pages
  pageCertificateNumber: string;
  group: ValveFunctionalTestProductGroup;
  groupIndex: number;
  pageInGroup: number;
  totalGroupPages: number;
  items: ValveFunctionalTestLineItem[];
  startItemNumber: number;
}

/**
 * Normalizes certificate data into identical product groups.
 * Handles both new productGroups and legacy lineItems seamlessly.
 */
export function normalizeProductGroups(
  data: ValveFunctionalTestCertificateData
): ValveFunctionalTestProductGroup[] {
  if (Array.isArray(data.productGroups) && data.productGroups.length > 0) {
    return data.productGroups;
  }

  // Backward compatibility: Convert legacy lineItems to product groups
  if (Array.isArray(data.lineItems) && data.lineItems.length > 0) {
    const first = data.lineItems[0];
    return [
      {
        id: "group-legacy-1",
        groupName: `${first.valveType || "Valve"} ${first.valveSize || ""}`,
        valveType: first.valveType || data.valveType || "Butterfly",
        valveSize: first.valveSize || data.valveSizeAndClass || '10"',
        endConnection: first.endConnection || "Flanged",
        pressureRating: "4 bar",
        moc: first.moc || "WCB Body ss316/PTF",
        actType: first.actType || "Pneumatic actuator",
        actuatorModel: first.model || "ZRC20SA",
        failPosition: first.failPosition || "Fail Close",
        hasLsb: Boolean(first.hasLsb),
        lsbModelNo: first.lsbModelNo || "",
        lsbFunction: first.lsbFunction || "Pass",
        hasSov: Boolean(first.hasSov),
        sovModelNo: first.sovModelNo || "",
        sovFunction: first.sovFunction || "Pass",
        hasPositioner: Boolean(first.hasPositioner),
        posinier: first.posinier || "",
        poFunction: first.poFunction || "Pass",
        hasAfr: Boolean(first.hasAfr),
        afrModelNo: first.afrModelNo || "",
        afrFunction: first.afrFunction || "Pass",
        hasValve: true,
        valveFunction: first.valveFunction || "Pass",
        hasActuator: true,
        actuatorFunction: "Pass",
        valveAssemblyFunction: first.valveFunction || "Pass",
        items: data.lineItems.map((item, idx) => ({
          id: item.id || `item-${idx + 1}`,
          sNo: item.sNo || idx + 1,
          tagNo: item.tagNo || String(idx + 1),
          actuatorSerialNo: item.actuatorSerialNo || "",
          stroke1Open: item.stroke1Open || "3.0 sec",
          stroke1Close: item.stroke1Close || "3.0 sec",
          stroke2Open: item.stroke2Open || "3.0 sec",
          stroke2Close: item.stroke2Close || "3.0 sec",
          stroke3Open: item.stroke3Open || "3.0 sec",
          stroke3Close: item.stroke3Close || "3.0 sec",
          valveFunction: item.valveFunction || "Pass",
        })),
      },
    ];
  }

  return [
    {
      id: "group-1",
      groupName: "Butterfly Valve 10\"",
      valveType: "Butterfly",
      valveSize: "10\"",
      endConnection: "Flanged",
      pressureRating: "4 bar",
      moc: "WCB Body ss316/PTF",
      actType: "Pneumatic actuator",
      actuatorModel: "ZRC20SA",
      failPosition: "Fail Close",
      hasLsb: false,
      lsbModelNo: "",
      lsbFunction: "Pass",
      hasSov: false,
      sovModelNo: "",
      sovFunction: "Pass",
      hasPositioner: false,
      posinier: "",
      poFunction: "Pass",
      hasAfr: false,
      afrModelNo: "",
      afrFunction: "Pass",
      hasValve: true,
      valveFunction: "Pass",
      hasActuator: true,
      actuatorFunction: "Pass",
      valveAssemblyFunction: "Pass",
      items: [
        {
          id: "item-1",
          sNo: 1,
          tagNo: "1",
          actuatorSerialNo: "",
          stroke1Open: "3.0 sec",
          stroke1Close: "3.0 sec",
          stroke2Open: "3.0 sec",
          stroke2Close: "3.0 sec",
          stroke3Open: "3.0 sec",
          stroke3Close: "3.0 sec",
          valveFunction: "Pass",
        },
      ],
    },
  ];
}

/**
 * Splits identical product groups into pages of up to 15 items per page.
 * Returns an array of RenderPageData, each corresponding to 1 physical A4 page.
 */
export function preparePages(
  data: ValveFunctionalTestCertificateData,
  baseCertNo?: string
): RenderPageData[] {
  const groups = normalizeProductGroups(data);
  const pages: RenderPageData[] = [];
  let globalPageIndex = 0;
  let runningItemCount = 1;

  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    const items = Array.isArray(group.items) ? group.items : [];
    const totalGroupPages = Math.max(1, Math.ceil(items.length / 15));

    for (let pInGroup = 0; pInGroup < totalGroupPages; pInGroup++) {
      const pageItems = items.slice(pInGroup * 15, (pInGroup + 1) * 15);
      const pageCertNo = getPageCertificateNumber(baseCertNo, globalPageIndex);

      pages.push({
        pageIndex: globalPageIndex,
        pageNumber: globalPageIndex + 1,
        pageCertificateNumber: pageCertNo,
        group,
        groupIndex: gIdx,
        pageInGroup: pInGroup + 1,
        totalGroupPages,
        items: pageItems,
        startItemNumber: runningItemCount,
      });

      runningItemCount += pageItems.length;
      globalPageIndex++;
    }
  }

  return pages;
}

export const ValveFunctionalTestTemplate: React.FC<ValveFunctionalTestTemplateProps> = ({
  data,
  certificateNumber,
  status,
  activePageIndex,
  showAllPages = true,
}) => {
  // Normalize certificate status
  const currentStatus = (status || data.status || "DRAFT").toUpperCase();
  const isDraft = currentStatus === "DRAFT" || !currentStatus;
  const isApproved = currentStatus === "APPROVED";

  // Signature stage rules:
  // 1. DRAFT: 0 signatures
  // 2. PENDING_APPROVAL / REJECTED: 1 signature (performed by only)
  // 3. APPROVED: 2 signatures (performed by + approved by)
  const showWitnessSignature = !isDraft && Boolean(data.witnessSignatureUrl);
  const showVerifiedSignature = isApproved && Boolean(data.verifiedSignatureUrl);

  const allPages = preparePages(data, certificateNumber);
  const pagesToRender =
    !showAllPages && typeof activePageIndex === "number"
      ? [allPages[activePageIndex] || allPages[0]]
      : allPages;

  return (
    <div id="certificate-a4-document" className="w-full flex flex-col items-center gap-6">
      {pagesToRender.map((pageData) => {
        const { group, items, pageCertificateNumber } = pageData;

        return (
          <div
            key={`page-${pageData.pageIndex}`}
            data-certificate-page={pageData.pageNumber}
            className="certificate-a4-page bg-white shadow-2xl print:shadow-none print:m-0 mx-auto text-black flex flex-col box-border print:!p-[10mm]"
            style={{
              width: "210mm",
              height: "297mm",
              minHeight: "297mm",
              maxHeight: "297mm",
              boxSizing: "border-box",
              padding: "10mm",
            }}
          >
            {/* Complete, Unified Outer Border Container enclosing the entire certificate */}
            <div className="w-full h-full border-[1.5px] border-black flex flex-col box-border bg-white overflow-hidden">
              {/* ============================================================== */}
              {/* 1. TITLE BAR                                                   */}
              {/* ============================================================== */}
              <div className="py-2.5 px-4 text-center border-b-[1.5px] border-black relative flex items-center justify-center min-h-[46px]">
                <h1 className="text-[17px] font-bold tracking-wider uppercase text-black">
                  VALVE FUNCTIONAL TEST REPORT
                </h1>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/zeetork-logo.jpeg"
                    alt="Zeetork Logo"
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </div>

              {/* ============================================================== */}
              {/* 2. CUSTOMER & ORDER INFORMATION (2 EQUAL COLUMNS)              */}
              {/* ============================================================== */}
              <table className="w-full table-fixed border-collapse border-b-[1.5px] border-black text-xs">
                <colgroup>
                  <col style={{ width: "50%" }} />
                  <col style={{ width: "50%" }} />
                </colgroup>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">Customer Name : </span>
                      <span className="font-normal text-slate-900">{data.customerName || ""}</span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      <span className="font-bold">Certificate No : </span>
                      <span className="font-mono font-bold text-slate-900">
                        {pageCertificateNumber}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">Sales Order No : </span>
                      <span className="font-normal text-slate-900">{data.salesOrderNo || ""}</span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      <span className="font-bold">Customer PO : </span>
                      <span className="font-normal text-slate-900">{data.customerPO || ""}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">Date Of Test : </span>
                      <span className="font-normal text-slate-900">{data.dateOfTest || ""}</span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      {data.testedBy ? (
                        <>
                          <span className="font-bold">Tested By : </span>
                          <span className="font-normal text-slate-900">{data.testedBy}</span>
                        </>
                      ) : null}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ============================================================== */}
              {/* 3. IDENTICAL PRODUCT SPECIFICATIONS (2 EQUAL COLUMNS)          */}
              {/* ============================================================== */}
              <table className="w-full table-fixed border-collapse border-b-[1.5px] border-black text-xs">
                <colgroup>
                  <col style={{ width: "50%" }} />
                  <col style={{ width: "50%" }} />
                </colgroup>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">Valve Type : </span>
                      <span className="font-normal text-slate-900">{group.valveType || ""}</span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      <span className="font-bold">Valve Size : </span>
                      <span className="font-normal text-slate-900">{group.valveSize || ""}</span>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">End Connection : </span>
                      <span className="font-normal text-slate-900">{group.endConnection || ""}</span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      <span className="font-bold">Pressure Rating : </span>
                      <span className="font-normal text-slate-900">
                        {group.pressureRating || group.moc || "4 bar"}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">Actuator Type : </span>
                      <span className="font-normal text-slate-900">{group.actType || ""}</span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      <span className="font-bold">Actuator Model : </span>
                      <span className="font-normal text-slate-900">{group.actuatorModel || ""}</span>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">Fail position : </span>
                      <span className="font-normal text-slate-900">{group.failPosition || ""}</span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      <span className="font-bold">LSB Model No : </span>
                      <span className="font-normal text-slate-900">
                        {group.hasLsb && group.lsbModelNo && group.lsbModelNo.toUpperCase() !== "NA"
                          ? group.lsbModelNo
                          : ""}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">SOV model No : </span>
                      <span className="font-normal text-slate-900">
                        {group.hasSov && group.sovModelNo && group.sovModelNo.toUpperCase() !== "NA"
                          ? group.sovModelNo
                          : ""}
                      </span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      <span className="font-bold">Positioner model No : </span>
                      <span className="font-normal text-slate-900">
                        {group.hasPositioner && group.posinier && group.posinier.toUpperCase() !== "NA"
                          ? group.posinier
                          : ""}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 px-3 border-r border-black truncate">
                      <span className="font-bold">AFR Model No : </span>
                      <span className="font-normal text-slate-900">
                        {group.hasAfr && group.afrModelNo && group.afrModelNo.toUpperCase() !== "NA"
                          ? group.afrModelNo
                          : ""}
                      </span>
                    </td>
                    <td className="p-1.5 px-3 truncate">
                      {group.moc && (
                        <>
                          <span className="font-bold">MOC : </span>
                          <span className="font-normal text-slate-900">{group.moc}</span>
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ============================================================== */}
              {/* 4. SECTION HEADER: TEST PARAMETERS                             */}
              {/* ============================================================== */}
              <div className="py-1 px-4 text-center border-b border-black bg-slate-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  Test Parameters
                </span>
              </div>

              {/* ============================================================== */}
              {/* 5. TEST PARAMETERS TABLE (ABSORBS FREE SPACE EQUALLY)          */}
              {/* ============================================================== */}
              <div className="flex-1 flex flex-col min-h-0 border-b-[1.5px] border-black">
                <table className="w-full h-full table-fixed border-collapse text-xs">
                  <colgroup>
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "9%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-black text-center font-bold text-[11px] bg-slate-50/30">
                      <th rowSpan={2} className="p-1 border-r border-black align-middle">
                        Serial<br />No.
                      </th>
                      <th rowSpan={2} className="p-1 border-r border-black align-middle">
                        Valve Tag No. /<br />Serial No.
                      </th>
                      <th rowSpan={2} className="p-1 border-r border-black align-middle">
                        Actuator Tag No. /<br />Serial No.
                      </th>
                      <th colSpan={2} className="p-1 border-r border-black">
                        Stroke 1
                      </th>
                      <th colSpan={2} className="p-1 border-r border-black">
                        Stroke 2
                      </th>
                      <th colSpan={2} className="p-1">
                        Stroke 3
                      </th>
                    </tr>
                    <tr className="border-b border-black text-center font-bold text-[11px] bg-slate-50/30">
                      <th className="p-0.5 border-r border-black font-normal lowercase">open</th>
                      <th className="p-0.5 border-r border-black font-normal lowercase">close</th>
                      <th className="p-0.5 border-r border-black font-normal lowercase">open</th>
                      <th className="p-0.5 border-r border-black font-normal lowercase">close</th>
                      <th className="p-0.5 border-r border-black font-normal lowercase">open</th>
                      <th className="p-0.5 font-normal lowercase">close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 15 }).map((_, rIdx) => {
                      const item = items[rIdx];
                      const displaySNo = item
                        ? item.sNo !== undefined && item.sNo !== ""
                          ? item.sNo
                          : rIdx + 1
                        : rIdx + 1;

                      return (
                        <tr
                          key={`row-${rIdx}`}
                          className="border-b border-black text-center text-xs last:border-b-0"
                          style={{ height: "calc(100% / 15)" }}
                        >
                          <td className="border-r border-black font-mono font-bold py-0.5 px-1 align-middle">
                            {displaySNo}
                          </td>
                          <td className="border-r border-black font-semibold text-slate-900 py-0.5 px-1 truncate align-middle">
                            {item?.tagNo || ""}
                          </td>
                          <td className="border-r border-black font-mono text-slate-800 py-0.5 px-1 truncate align-middle">
                            {item?.actuatorSerialNo || ""}
                          </td>
                          <td className="border-r border-black py-0.5 px-1 text-slate-700 align-middle">
                            {item?.stroke1Open || (item ? "3.0 sec" : "")}
                          </td>
                          <td className="border-r border-black py-0.5 px-1 text-slate-700 align-middle">
                            {item?.stroke1Close || (item ? "3.0 sec" : "")}
                          </td>
                          <td className="border-r border-black py-0.5 px-1 text-slate-700 align-middle">
                            {item?.stroke2Open || (item ? "3.0 sec" : "")}
                          </td>
                          <td className="border-r border-black py-0.5 px-1 text-slate-700 align-middle">
                            {item?.stroke2Close || (item ? "3.0 sec" : "")}
                          </td>
                          <td className="border-r border-black py-0.5 px-1 text-slate-700 align-middle">
                            {item?.stroke3Open || (item ? "3.0 sec" : "")}
                          </td>
                          <td className="py-0.5 px-1 text-slate-700 align-middle">
                            {item?.stroke3Close || (item ? "3.0 sec" : "")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ============================================================== */}
              {/* 6. TEST RESULT HEADER & DYNAMIC RESULTS TABLE                  */}
              {/* ============================================================== */}
              <div className="py-1 px-4 text-center border-b border-black bg-slate-50/50 flex-shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  Test Result
                </span>
              </div>

              {(() => {
                // Dynamic test columns in requested order:
                // valve | Actuator | Positioner | SOV | LSB | AFR
                const testColumns: Array<{ label: string; result: string }> = [];

                if (group.hasValve !== false) {
                  testColumns.push({
                    label: "Valve",
                    result: group.valveFunction || group.valveAssemblyFunction || "Pass",
                  });
                }

                if (group.hasActuator !== false) {
                  testColumns.push({
                    label: "Actuator",
                    result: group.actuatorFunction || "Pass",
                  });
                }

                if (group.hasPositioner) {
                  testColumns.push({
                    label: "Positioner",
                    result: group.poFunction || "Pass",
                  });
                }

                if (group.hasSov) {
                  testColumns.push({
                    label: "SOV",
                    result: group.sovFunction || "Pass",
                  });
                }

                if (group.hasLsb) {
                  testColumns.push({
                    label: "LSB",
                    result: group.lsbFunction || "Pass",
                  });
                }

                if (group.hasAfr) {
                  testColumns.push({
                    label: "AFR",
                    result: group.afrFunction || "Pass",
                  });
                }

                const totalCols = testColumns.length + 1; // +1 for Equipments / Result header column
                const colWidthPercent = `${(100 / totalCols).toFixed(2)}%`;

                return (
                  <table className="w-full table-fixed border-collapse border-b-[1.5px] border-black text-xs text-left flex-shrink-0">
                    <colgroup>
                      {Array.from({ length: totalCols }).map((_, i) => (
                        <col key={i} style={{ width: colWidthPercent }} />
                      ))}
                    </colgroup>
                    <tbody>
                      <tr className="border-b border-black h-[22px]">
                        <td className="border-r border-black font-bold p-1 px-2 text-left pl-2">
                          Equipments
                        </td>
                        {testColumns.map((col, idx) => (
                          <td
                            key={`col-hdr-${idx}`}
                            className={`p-1 px-2 font-bold text-left pl-2 ${
                              idx < testColumns.length - 1 ? "border-r border-black" : ""
                            }`}
                          >
                            {col.label}
                          </td>
                        ))}
                      </tr>
                      <tr className="h-[22px]">
                        <td className="border-r border-black font-bold p-1 px-2 text-left pl-2">
                          Result
                        </td>
                        {testColumns.map((col, idx) => (
                          <td
                            key={`col-res-${idx}`}
                            className={`p-1 px-2 font-semibold text-slate-900 text-left pl-2 ${
                              idx < testColumns.length - 1 ? "border-r border-black" : ""
                            }`}
                          >
                            {col.result || "Pass"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                );
              })()}

              {/* ============================================================== */}
              {/* 7. DECLARATION TEXT                                            */}
              {/* ============================================================== */}
              <div className="p-2 text-center text-[11px] leading-tight text-slate-800 border-b-[1.5px] border-black flex-shrink-0">
                <p>
                  This is to certify that the products listed above are tested and inspected according to the applicable standards.
                </p>
                <p className="mt-0.5">
                  It has passed all specified tests and is in compliance with the stated performance standards.
                </p>
              </div>

              {/* ============================================================== */}
              {/* 8. SIGNATURES (PERFORMED BY / VERIFIED BY)                     */}
              {/* ============================================================== */}
              <div className="grid grid-cols-2 border-b-[1.5px] border-black text-center min-h-[72px] flex-shrink-0">
                <div className="p-2 border-r border-black flex flex-col justify-between items-center">
                  <span className="text-xs font-bold text-black uppercase tracking-wide">
                    Performed By
                  </span>
                  <div className="h-10 flex items-center justify-center">
                    {showWitnessSignature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.witnessSignatureUrl}
                        alt="Performed By Signature"
                        className="max-h-10 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Signature Pending</span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-900">
                    {data.witnessedBy || "SIVAGANESHAN.V.A"}
                  </span>
                </div>

                <div className="p-2 flex flex-col justify-between items-center">
                  <span className="text-xs font-bold text-black uppercase tracking-wide">
                    Verified By
                  </span>
                  <div className="h-10 flex items-center justify-center">
                    {showVerifiedSignature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.verifiedSignatureUrl}
                        alt="Verified By Signature"
                        className="max-h-10 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Approval Pending</span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-900">
                    {data.verifiedBy || "KARTHIKEYAN.A"}
                  </span>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 9. COMPANY FOOTER                                              */}
              {/* ============================================================== */}
              <div className="p-2 text-center flex-shrink-0">
                <p className="text-xs font-bold text-black uppercase tracking-wide">
                  {data.companyName || "ZEETORK AUTOMATION & CONTROLS PRIVATE LIMITED"}
                </p>
                <p className="text-[10px] text-slate-700 mt-0.5">
                  {data.companyAddress ||
                    "S.F No. 617/ 2H2, Vadakku Thottam, L&T Road, MALUMICHAMPATTI post, Coimbatore- 641021, Tamil Nadu"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
