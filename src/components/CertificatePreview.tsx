"use client";

import React, { useState } from "react";
import { CertificateData } from "@/types/certificate";
import { CertificateHeader } from "./certificates/common/CertificateHeader";
import { CertificateFooter } from "./certificates/common/CertificateFooter";
import { CertificateTable } from "./CertificateTable";
import { SignatureSection } from "./SignatureSection";
import { Download, Printer, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CertificatePreviewProps {
  data: CertificateData;
  onGeneratePdf: () => void;
  onPrint: () => void;
  isGeneratingPdf?: boolean;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  data,
  onGeneratePdf,
  onPrint,
  isGeneratingPdf = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.9); // default desktop scale

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.45));
  const handleResetZoom = () => setZoomLevel(0.9);

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* PREVIEW TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 gap-2 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Live Preview
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            A4 Standard (210 × 297 mm)
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-white text-slate-600 rounded text-xs transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono font-medium text-slate-600 min-w-[38px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-white text-slate-600 rounded text-xs transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1.5 hover:bg-white text-slate-600 rounded text-xs transition ml-0.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center px-2.5 py-1.5 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print
          </button>

          {/* Download PDF button */}
          <button
            type="button"
            onClick={onGeneratePdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* CERTIFICATE SCROLL / VIEWPORT CONTAINER */}
      <div className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-200/70">
        <div
          className="mx-auto flex-shrink-0"
          style={{
            width: `${Math.round(794 * zoomLevel)}px`,
            height: `${Math.round(1123 * zoomLevel)}px`,
            minWidth: `${Math.round(794 * zoomLevel)}px`,
            minHeight: `${Math.round(1123 * zoomLevel)}px`,
            position: "relative",
          }}
        >
          <div
            style={{
              width: "794px",
              minWidth: "794px",
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
          {/* A4 CERTIFICATE DOCUMENT */}
          <div
            id="certificate-a4-document"
            className="bg-white text-black font-sans box-border relative"
            style={{
              width: "794px",
              minHeight: "1123px",
              padding: "24px 28px",
            }}
          >
            {/* FULL BORDER ENCLOSURE */}
            <div className="w-full h-full border border-black flex flex-col justify-between p-0 box-border bg-white">
              {/* HEADER SECTION */}
              <div>
                <CertificateHeader
                  title="Certificate of Conformity"
                  subtitle="Solenoid Valve"
                  customerName={data.customerName}
                  salesOrderNo={data.salesOrderNo}
                  customerPO={data.customerPO}
                  certificateDate={data.certificateDate}
                />

                {/* MAIN TEST & PRODUCT TABLE */}
                <CertificateTable data={data} />

                {/* CERTIFICATION STATEMENT */}
                <div className="border-b border-black p-3 text-center bg-white">
                  <p className="text-[11.5px] leading-relaxed font-bold">
                    This is to certify that the solenoid valve listed above has been tested and inspected according to the applicable quality standards.
                  </p>
                  <p className="text-[11.5px] leading-relaxed font-bold mt-1">
                    It has passed all specified tests and is compliant with the stated performance and safety requirements.
                  </p>
                </div>

                {/* SIGNATURE SECTION */}
                <SignatureSection data={data} />
              </div>

              {/* COMPANY FOOTER */}
              <CertificateFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
