import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { AnyCertificateData } from "@/types/certificate";

export interface GeneratePdfOptions {
  elementId?: string;
  data?: AnyCertificateData | Record<string, unknown>;
  certificateNumber?: string;
  revision?: number;
  orientation?: "portrait" | "landscape";
  onProgress?: (status: string) => void;
}

export async function generateCertificatePdf({
  elementId = "certificate-a4-document",
  data = {},
  certificateNumber,
  orientation,
  onProgress,
}: GeneratePdfOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" was not found.`);
  }

  // Detect landscape from explicit option, data-orientation attribute, or element width
  const isLandscape =
    orientation === "landscape" ||
    element.getAttribute("data-orientation") === "landscape" ||
    element.offsetWidth > 900;

  const targetWidth = isLandscape ? 1123 : 794;
  const targetMinHeight = isLandscape ? 794 : 1123;
  const pdfOrientation: "landscape" | "portrait" = isLandscape ? "landscape" : "portrait";
  const pdfWidth = isLandscape ? 297 : 210;
  const pdfHeight = isLandscape ? 210 : 297;

  onProgress?.("Preparing certificate for ultra-high-resolution render...");

  // Wait for all images inside the element to fully load
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // continue even if one fails
      });
    })
  );

  onProgress?.("Capturing high-definition document layout...");

  // Capture with html2canvas at scale 3.5 for 330+ DPI crisp vector-grade resolution
  const canvas = await html2canvas(element, {
    scale: 3.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: targetWidth,
    windowHeight: targetMinHeight,
    imageTimeout: 15000,
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById(elementId);
      if (!clonedElement) return;

      // 1. Remove all zoom and scale transforms on parent wrappers so html2canvas doesn't downsample
      let parent: HTMLElement | null = clonedElement.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.transform = "none";
        (parent.style as unknown as { webkitTransform?: string }).webkitTransform = "none";
        (parent.style as unknown as { zoom?: string }).zoom = "1";
        parent = parent.parentElement;
      }

      // 2. Ensure cloned element is exactly targetWidth width with no shadows or scaling
      clonedElement.style.transform = "none";
      (clonedElement.style as unknown as { webkitTransform?: string }).webkitTransform = "none";
      clonedElement.style.boxShadow = "none";
      clonedElement.style.margin = "0";
      clonedElement.style.width = `${targetWidth}px`;
      clonedElement.style.minHeight = `${targetMinHeight}px`;
      clonedElement.style.maxWidth = `${targetWidth}px`;

      // 3. Inject high-quality anti-aliasing and web-safe typography styles
      const style = clonedDoc.createElement("style");
      style.textContent = `
        #${elementId}, #${elementId} * {
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          font-variant-ligatures: none !important;
          font-feature-settings: normal !important;
          letter-spacing: 0.015em !important;
          word-spacing: 0.12em !important;
          text-rendering: geometricPrecision !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          image-rendering: -webkit-optimize-contrast !important;
        }
        #${elementId} thead tr {
          background-color: transparent !important;
          background: transparent !important;
        }
        #${elementId} table, #${elementId} th, #${elementId} td {
          word-spacing: normal !important;
        }
      `;
      clonedDoc.head.appendChild(style);

      // 4. Ensure images render at highest contrast
      const clonedImages = Array.from(clonedElement.querySelectorAll("img"));
      clonedImages.forEach((img) => {
        img.style.imageRendering = "-webkit-optimize-contrast";
      });
    },
  });

  onProgress?.("Encoding lossless A4 PDF document...");

  // A4 dimensions in mm: 210 x 297 (or 297 x 210 in landscape)
  const pdf = new jsPDF({
    orientation: pdfOrientation,
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Calculate dimensions to fit exactly within one A4 sheet
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  // Use lossless PNG instead of lossy JPEG to completely eliminate pixel breaking & compression artifacts
  const imgData = canvas.toDataURL("image/png");

  if (imgHeight <= pdfHeight) {
    // Fits within one page: embed lossless PNG with high-quality interpolation
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "SLOW");
  } else {
    // Scale proportionally if slightly oversized
    const scale = pdfHeight / imgHeight;
    const finalWidth = imgWidth * scale;
    const finalHeight = pdfHeight;
    const offsetX = (pdfWidth - finalWidth) / 2;
    pdf.addImage(imgData, "PNG", offsetX, 0, finalWidth, finalHeight, undefined, "SLOW");
  }

  // Construct standard filename: [certificateNumber].pdf
  let filename: string;
  if (certificateNumber) {
    filename = `${certificateNumber}.pdf`;
  } else {
    const d = data as Record<string, string>;
    const safeSo = (d?.salesOrderNo || "SO-Draft").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    const safeModel = (d?.modelNumber || "Certificate").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    filename = `Test-Certificate-${safeSo}-${safeModel}.pdf`;
  }

  onProgress?.("Saving PDF file...");
  pdf.save(filename);
}

export function printCertificate(): void {
  window.print();
}
