import { CertificateSequence } from "@/models/CertificateSequence";
import { Certificate } from "@/models/Certificate";
import { CertificateType } from "@/types/certificate";
import { connectToDatabase } from "@/lib/mongodb";

export interface GeneratedCertificateRange {
  certificateNumber: string;
  lastCertificateNumber: string;
  pageCount: number;
}

export {
  getPageCertificateNumber,
  calculateValveFunctionalTestPages,
} from "@/lib/certificatePagination";

/**
 * Generate a unique, atomic certificate serial number range reserving `count` sequential slots.
 * Format: ZIC + YY (2 digits) + SEQUENCE (5 digits)
 * Single global sequential counter across ALL certificate types per year.
 */
export async function generateCertificateNumber(
  _certificateType?: CertificateType,
  count: number = 1,
  customDate: Date = new Date()
): Promise<GeneratedCertificateRange & { toString: () => string }> {
  await connectToDatabase();

  const prefix = "ZIC";
  const year = customDate.getFullYear();
  const yy = String(year).slice(-2);
  const slotsToReserve = Math.max(1, count);

  // Sync / Auto-healing check:
  // Ensure lastSequence in CertificateSequence is not behind any existing certificate in DB
  const certs = await Certificate.find(
    { certificateNumber: new RegExp(`^(?:${prefix}|ZIN)${yy}\\d+`) },
    { certificateNumber: 1, lastCertificateNumber: 1, pageCount: 1, certificateType: 1, certificateData: 1 }
  ).lean();

  let maxExistingSequence = 0;
  const seqPattern = new RegExp(`^(?:${prefix}|ZIN)${yy}(\\d{5})$`);
  for (const cert of certs) {
    const endStr = cert.lastCertificateNumber || cert.certificateNumber;
    const m = endStr?.match(seqPattern);
    if (m) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num) && num > maxExistingSequence) {
        maxExistingSequence = num;
      }
    }
  }

  if (maxExistingSequence > 0) {
    await CertificateSequence.findOneAndUpdate(
      { certificateType: "ALL", year, month: 0 },
      {
        $max: { lastSequence: maxExistingSequence },
        $set: { prefix },
      },
      { upsert: true }
    );
  }

  // Atomic increment with upsert reserving 'slotsToReserve' slots
  const sequenceDoc = await CertificateSequence.findOneAndUpdate(
    { certificateType: "ALL", year, month: 0 },
    {
      $inc: { lastSequence: slotsToReserve },
      $set: { prefix },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  const endSeq = sequenceDoc.lastSequence;
  const startSeq = endSeq - slotsToReserve + 1;

  const startSeqNumber = String(startSeq).padStart(5, "0");
  const endSeqNumber = String(endSeq).padStart(5, "0");

  const startCertNumber = `${prefix}${yy}${startSeqNumber}`;
  const endCertNumber = `${prefix}${yy}${endSeqNumber}`;

  return {
    certificateNumber: startCertNumber,
    lastCertificateNumber: endCertNumber,
    pageCount: slotsToReserve,
    toString: () => startCertNumber,
  };
}
