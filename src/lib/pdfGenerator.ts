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

  // Detect if there are multiple certificate pages inside element or document
  const pageElements = Array.from(
    element.querySelectorAll<HTMLElement>(".certificate-a4-page, [data-certificate-page]")
  );
  const pagesToRender = pageElements.length > 0 ? pageElements : [element];

  onProgress?.(
    pagesToRender.length > 1
      ? `Preparing ${pagesToRender.length} certificate pages for render...`
      : "Preparing certificate for ultra-high-resolution render..."
  );

  // A4 dimensions in mm: 210 x 297 (or 297 x 210 in landscape)
  const pdf = new jsPDF({
    orientation: pdfOrientation,
    unit: "mm",
    format: "a4",
    compress: true,
  });

  for (let i = 0; i < pagesToRender.length; i++) {
    const pageEl = pagesToRender[i];
    onProgress?.(`Capturing page ${i + 1} of ${pagesToRender.length}...`);

    // Wait for all images inside this page element to fully load
    const images = Array.from(pageEl.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    // Capture with html2canvas at scale 3.5 for 330+ DPI crisp vector-grade resolution
    const canvas = await html2canvas(pageEl, {
      scale: 3.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: targetWidth,
      windowHeight: targetMinHeight,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedPage =
          clonedDoc.querySelector<HTMLElement>(`[data-page-index="${i}"]`) ||
          clonedDoc.querySelectorAll<HTMLElement>(".certificate-a4-page")[i] ||
          clonedDoc.getElementById(elementId);
        if (!clonedPage) return;

        // 1. Remove all zoom and scale transforms on parent wrappers so html2canvas doesn't downsample
        let parent: HTMLElement | null = clonedPage.parentElement;
        while (parent && parent !== clonedDoc.body) {
          parent.style.transform = "none";
          (parent.style as unknown as { webkitTransform?: string }).webkitTransform = "none";
          (parent.style as unknown as { zoom?: string }).zoom = "1";
          parent = parent.parentElement;
        }

        // 2. Ensure cloned element is exactly targetWidth width with no shadows or scaling
        clonedPage.style.transform = "none";
        (clonedPage.style as unknown as { webkitTransform?: string }).webkitTransform = "none";
        clonedPage.style.boxShadow = "none";
        clonedPage.style.margin = "0";
        clonedPage.style.width = `${targetWidth}px`;
        clonedPage.style.minHeight = `${targetMinHeight}px`;
        clonedPage.style.maxWidth = `${targetWidth}px`;

        // 3. Inject high-quality anti-aliasing and web-safe typography styles
        const style = clonedDoc.createElement("style");
        style.textContent = `
          #${elementId}, #${elementId} *, .certificate-a4-page, .certificate-a4-page * {
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
          table, th, td {
            word-spacing: normal !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        // 4. Ensure images render at highest contrast
        const clonedImages = Array.from(clonedPage.querySelectorAll("img"));
        clonedImages.forEach((img) => {
          img.style.imageRendering = "-webkit-optimize-contrast";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");

    if (i > 0) {
      pdf.addPage("a4", pdfOrientation);
    }

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "SLOW");
    } else {
      const scale = pdfHeight / imgHeight;
      const finalWidth = imgWidth * scale;
      const finalHeight = pdfHeight;
      const offsetX = (pdfWidth - finalWidth) / 2;
      pdf.addImage(imgData, "PNG", offsetX, 0, finalWidth, finalHeight, undefined, "SLOW");
    }
  }

  // Construct standard filename: [certificateNumber].pdf
  let filename: string;
  if (certificateNumber) {
    filename = `${certificateNumber}.pdf`;
  } else {
    const d = data as Record<string, string>;
    const safeSo = (d?.salesOrderNo || "SO-Draft").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    const safeModel = (d?.modelNumber || "Report").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    filename = `Functional-Test-${safeSo}-${safeModel}.pdf`;
  }

  onProgress?.("Saving PDF file...");
  pdf.save(filename);
}

export async function printCertificate(
  elementId: string | unknown = "certificate-a4-document"
): Promise<void> {
  const targetId = typeof elementId === "string" ? elementId : "certificate-a4-document";
  const element = document.getElementById(targetId);
  if (!element) {
    window.print();
    return;
  }

  // Detect landscape from explicit option, data-orientation attribute, or element width
  const isLandscape =
    element.getAttribute("data-orientation") === "landscape" ||
    element.offsetWidth > 900;

  const targetWidth = isLandscape ? 1123 : 794;
  const targetMinHeight = isLandscape ? 794 : 1123;
  const pageOrientation = isLandscape ? "landscape" : "portrait";

  // Detect if there are multiple certificate pages
  const pageElements = Array.from(
    element.querySelectorAll<HTMLElement>(".certificate-a4-page, [data-certificate-page]")
  );
  const pagesToRender = pageElements.length > 0 ? pageElements : [element];

  const imagesData: string[] = [];

  for (let i = 0; i < pagesToRender.length; i++) {
    const pageEl = pagesToRender[i];

    // Wait for all images inside this page element to fully load
    const images = Array.from(pageEl.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    const canvas = await html2canvas(pageEl, {
      scale: 3.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: targetWidth,
      windowHeight: targetMinHeight,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedPage =
          clonedDoc.querySelector<HTMLElement>(`[data-page-index="${i}"]`) ||
          clonedDoc.querySelectorAll<HTMLElement>(".certificate-a4-page")[i] ||
          clonedDoc.getElementById(targetId);
        if (!clonedPage) return;

        let parent: HTMLElement | null = clonedPage.parentElement;
        while (parent && parent !== clonedDoc.body) {
          parent.style.transform = "none";
          (parent.style as unknown as { webkitTransform?: string }).webkitTransform = "none";
          (parent.style as unknown as { zoom?: string }).zoom = "1";
          parent = parent.parentElement;
        }

        clonedPage.style.transform = "none";
        (clonedPage.style as unknown as { webkitTransform?: string }).webkitTransform = "none";
        clonedPage.style.boxShadow = "none";
        clonedPage.style.margin = "0";
        clonedPage.style.width = `${targetWidth}px`;
        clonedPage.style.minHeight = `${targetMinHeight}px`;
        clonedPage.style.maxWidth = `${targetWidth}px`;

        const style = clonedDoc.createElement("style");
        style.textContent = `
          #${targetId}, #${targetId} *, .certificate-a4-page, .certificate-a4-page * {
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
          table, th, td {
            word-spacing: normal !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        const clonedImages = Array.from(clonedPage.querySelectorAll("img"));
        clonedImages.forEach((img) => {
          img.style.imageRendering = "-webkit-optimize-contrast";
        });
      },
    });

    imagesData.push(canvas.toDataURL("image/png"));
  }

  // Create isolated hidden iframe
  let iframe = document.getElementById("certificate-print-iframe") as HTMLIFrameElement;
  if (iframe) {
    iframe.remove();
  }

  iframe = document.createElement("iframe");
  iframe.id = "certificate-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  const printPagesHtml = imagesData
    .map(
      (imgSrc) => `
      <div class="print-wrapper">
        <img src="${imgSrc}" alt="Certificate" />
      </div>
    `
    )
    .join("");

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Print Certificate</title>
        <style>
          @page {
            size: A4 ${pageOrientation};
            margin: 0mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
            page-break-after: always;
            break-after: page;
          }
          .print-wrapper:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .print-wrapper img {
            width: 100%;
            height: auto;
            display: block;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        ${printPagesHtml}
      </body>
    </html>
  `);
  iframeDoc.close();

  const printImgs = Array.from(iframeDoc.querySelectorAll("img"));
  const doPrint = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 150);
  };

  await Promise.all(
    printImgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  doPrint();
}
