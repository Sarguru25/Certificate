"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ResponsiveCertificatePreviewProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  orientation?: "portrait" | "landscape";
}

export const ResponsiveCertificatePreview: React.FC<ResponsiveCertificatePreviewProps> = ({
  children,
  title = "Document Preview",
  subtitle,
  badge,
  orientation = "portrait",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomMode, setZoomMode] = useState<"fit" | "custom">("fit");
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);

  const isLandscape = orientation === "landscape";
  const baseWidth = isLandscape ? 1123 : 794;
  const baseHeight = isLandscape ? 794 : 1123;
  const displaySubtitle =
    subtitle || (isLandscape ? "A4 Landscape (1123 × 794 px)" : "A4 Standard (794 × 1123 px)");

  // Auto-fit calculation
  useEffect(() => {
    const updateFitScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const padding = containerWidth < 640 ? 16 : 48;
      const availableWidth = Math.max(containerWidth - padding, 260);
      const calculatedScale = Math.min(1, Math.max(0.25, availableWidth / baseWidth));

      if (zoomMode === "fit") {
        setZoomLevel(Number(calculatedScale.toFixed(2)));
      }
    };

    updateFitScale();
    window.addEventListener("resize", updateFitScale);
    return () => window.removeEventListener("resize", updateFitScale);
  }, [zoomMode, baseWidth]);

  const handleSetFit = () => {
    setZoomMode("fit");
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const padding = containerWidth < 640 ? 16 : 48;
    const availableWidth = Math.max(containerWidth - padding, 260);
    const calculatedScale = Math.min(1, Math.max(0.25, availableWidth / baseWidth));
    setZoomLevel(Number(calculatedScale.toFixed(2)));
  };

  const handleZoom = (delta: number) => {
    setZoomMode("custom");
    setZoomLevel((prev) => {
      const next = Math.min(1.2, Math.max(0.35, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleSetExact = (scale: number) => {
    setZoomMode("custom");
    setZoomLevel(scale);
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#FF2D01]" />
            <span>{title}</span>
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400">
            • {displaySubtitle}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-500 font-semibold uppercase mr-1">
              {badge}
            </span>
          )}

          <button
            type="button"
            onClick={handleSetFit}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
              zoomMode === "fit"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Fit to Screen"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetExact(0.5)}
            className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              zoomMode === "custom" && zoomLevel === 0.5
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            50%
          </button>

          <button
            type="button"
            onClick={() => handleSetExact(0.75)}
            className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              zoomMode === "custom" && zoomLevel === 0.75
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            75%
          </button>

          <button
            type="button"
            onClick={() => handleSetExact(1.0)}
            className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              zoomMode === "custom" && zoomLevel === 1.0
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            100%
          </button>

          <div className="flex items-center border-l border-slate-200 pl-1 ml-0.5">
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-600 w-8 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* CERTIFICATE SCROLL/PAN CONTAINER */}
      <div
        ref={containerRef}
        className="w-full bg-slate-200/80 rounded-2xl border border-slate-300 overflow-x-auto overflow-y-auto p-2 sm:p-6 shadow-inner min-h-[480px] max-h-[85vh] touch-pan-x touch-pan-y"
      >
        <div
          className="mx-auto flex-shrink-0"
          style={{
            width: `${Math.round(baseWidth * zoomLevel)}px`,
            height: `${Math.round(baseHeight * zoomLevel)}px`,
            minWidth: `${Math.round(baseWidth * zoomLevel)}px`,
            minHeight: `${Math.round(baseHeight * zoomLevel)}px`,
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${baseWidth}px`,
              minWidth: `${baseWidth}px`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
