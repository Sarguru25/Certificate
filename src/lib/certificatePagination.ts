/**
 * Client-safe pure utility functions for multi-page certificate pagination
 * and sequential certificate numbering calculations.
 *
 * (Free of Node.js, Mongoose, or database dependencies)
 */

/**
 * Calculate the incremental certificate number for a given page index.
 * E.g., if base is "ZIN2600024" or "TFC2600024":
 * page 1 (index 0) => "ZIN2600024"
 * page 2 (index 1) => "ZIN2600025", etc.
 */
export function getPageCertificateNumber(baseNumber?: string, pageIndex: number = 0): string {
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

/**
 * Calculate the total page count for a Valve Functional Test report.
 * Each identical product group displays up to 15 items per page.
 * E.g., Group 1 with 20 items takes 2 pages (15 on p1, 5 on p2).
 * The next group starts on a new page.
 */
export function calculateValveFunctionalTestPages(certificateData: unknown): number {
  if (!certificateData || typeof certificateData !== "object") return 1;
  const data = certificateData as {
    productGroups?: Array<{ items?: unknown[] }>;
    lineItems?: unknown[];
  };

  if (Array.isArray(data.productGroups) && data.productGroups.length > 0) {
    let total = 0;
    for (const group of data.productGroups) {
      const count = Array.isArray(group.items) ? group.items.length : 0;
      total += Math.max(1, Math.ceil(count / 15));
    }
    return Math.max(1, total);
  }

  if (Array.isArray(data.lineItems) && data.lineItems.length > 0) {
    return Math.max(1, Math.ceil(data.lineItems.length / 15));
  }

  return 1;
}
