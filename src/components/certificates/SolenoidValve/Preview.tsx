"use client";

import React, { useState } from "react";
import { SolenoidValveCertificateData } from "@/types/certificate";
import { SolenoidValveTemplate } from "./Template";
import { Download, Printer, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface SolenoidValvePreviewProps {
  data: SolenoidValveCertificateData;
  certificateNumber?: string;
  revision?: number;
  status?: string;
  onGeneratePdf?: () => void;
  onPrint?: () => void;
  isGeneratingPdf?: boolean;
  showActions?: boolean;
}

export const SolenoidValvePreview: React.FC<SolenoidValvePreviewProps> = ({
  data,
  certificateNumber,
  revision = 0,
  status,
  onGeneratePdf,
  onPrint,
  isGeneratingPdf = false,
  showActions = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.45));
  const handleResetZoom = () => setZoomLevel(0.85);

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* PREVIEW TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 gap-2 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            A4 Certificate Preview
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            210 × 297 mm
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

          {showActions && (
            <>
              {onPrint && (
                <button
                  type="button"
                  onClick={onPrint}
                  className="inline-flex items-center px-2.5 py-1.5 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Print
                </button>
              )}

              {onGeneratePdf && (
                <button
                  type="button"
                  onClick={onGeneratePdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-[#FF2D01] hover:bg-[#e02800] disabled:opacity-50 transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {isGeneratingPdf ? "Generating..." : "Download PDF"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* SCROLLABLE VIEWPORT CONTAINER */}
      <div className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-200/70 min-h-[500px]">
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
            <SolenoidValveTemplate
              data={data}
              certificateNumber={certificateNumber}
              revision={revision}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
