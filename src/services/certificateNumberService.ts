import { CertificateSequence } from "@/models/CertificateSequence";
import { CertificateType } from "@/types/certificate";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Generate a unique, atomic certificate serial number with format:
 * ZIN + YY (2 digits) + SEQUENCE (5 digits)
 * E.g., ZIN2600001, ZIN2600002, ZIN2600003
 * Single global sequential counter across ALL certificate types per year.
 */
export async function generateCertificateNumber(
  _certificateType?: CertificateType,
  customDate: Date = new Date()
): Promise<string> {
  await connectToDatabase();

  const prefix = "ZIN";
  const year = customDate.getFullYear();

  // YY formatted to 2 digits (e.g. 2026 -> "26")
  const yy = String(year).slice(-2);

  // Atomic increment with upsert across all certificate types
  const sequenceDoc = await CertificateSequence.findOneAndUpdate(
    { certificateType: "ALL", year, month: 0 },
    {
      $inc: { lastSequence: 1 },
      $setOnInsert: { prefix },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  const seqNumber = String(sequenceDoc.lastSequence).padStart(5, "0");
  return `${prefix}${yy}${seqNumber}`;
}
