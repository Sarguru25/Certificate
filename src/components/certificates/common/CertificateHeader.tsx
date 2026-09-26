"use client";

import React from "react";

interface CertificateHeaderProps {
  title?: string;
  subtitle?: string;
  certificateNumber?: string;
  customerName?: string;
  salesOrderNo?: string;
  salesOrderDate?: string;
  customerPO?: string;
  customerPODate?: string;
  certificateDate?: string;
  testingLocation?: string;
}

export const CertificateHeader: React.FC<CertificateHeaderProps> = ({
  title = "Certificate of Conformity",
  subtitle,
  certificateNumber = "ZIN2600001",
  customerName = "-",
  salesOrderNo = "-",
  salesOrderDate,
  customerPO = "-",
  customerPODate,
  certificateDate = "-",
  testingLocation,
}) => {
  // Format YYYY-MM-DD or ISO string into DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "-") return "-";
    if (dateStr.includes("T")) {
      const parts = dateStr.split("T")[0].split("-");
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const formattedDate = formatDate(certificateDate);

  return (
    <div className="w-full text-black">
      {/* Top Banner: Title & Logo */}
      <div className="border-b border-black px-6 py-2.5 flex items-center justify-between bg-white">
        <div className="flex-1 text-center pl-16">
          <h1 className="text-[20px] sm:text-[22px] font-bold text-black tracking-tight font-sans">
            {title}
          </h1>
        </div>
        <div className="flex items-center justify-end w-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zeetork-logo.jpeg"
            alt="Zeetork Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>

      {/* Subtitle / Product Bar (rendered only when subtitle is provided) */}
      {subtitle ? (
        <div className="border-b border-black py-3 text-center font-bold text-[14px] sm:text-[15px] bg-white text-black tracking-wide font-sans">
          {subtitle}
        </div>
      ) : null}

      {/* 4-Box Metadata Grid (2 rows x 2 columns) with 50% split */}
      <div className="w-full text-[11px] sm:text-[11.5px] bg-white">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: "50%" }} />
            <col style={{ width: "50%" }} />
          </colgroup>
          <tbody>
            <tr className="border-b border-black">
              {/* Box 1: Customer Name */}
              <td className="border-r border-black px-3 py-1.5 font-bold overflow-hidden align-middle">
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Customer Name :</span>
                  <span className="font-medium ml-2 truncate">
                    {customerName || "-"}
                  </span>
                </div>
              </td>

              {/* Box 2: Sale order no & Customer po */}
              <td className="px-3 py-2.5 font-bold overflow-hidden align-middle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center truncate mr-2">
                    <span className="whitespace-nowrap">Sale order no :</span>
                    <span className="font-medium ml-1.5 truncate">
                      {salesOrderNo || "-"}{salesOrderDate ? ` DT-${salesOrderDate}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center truncate">
                    <span className="whitespace-nowrap">Customer po :</span>
                    <span className="font-medium ml-1.5 truncate">
                      {customerPO || "-"}{customerPODate ? ` DT-${customerPODate}` : ""}
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            <tr className="border-b border-black">
              {/* Box 3: Certificate Number */}
              <td className="border-r border-black px-3 py-2.5 font-bold overflow-hidden align-middle">
                <div className="flex items-center">
                  <span className="whitespace-nowrap uppercase">CERTIFICATE NO:</span>
                  <span className="font-medium ml-2 font-mono">
                    {certificateNumber || "ZIN2600001"}
                  </span>
                </div>
              </td>

              {/* Box 4: Date */}
              <td className="px-3 py-1.5 font-bold overflow-hidden align-middle">
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Date :</span>
                  <span className="font-medium ml-2">
                    {formattedDate}{testingLocation ? ` & ${testingLocation}` : ""}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
