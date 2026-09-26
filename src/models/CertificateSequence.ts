import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificateSequenceDocument extends Document {
  certificateType: string;
  year: number;
  month: number;
  prefix: string;
  lastSequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSequenceSchema = new Schema<ICertificateSequenceDocument>(
  {
    certificateType: {
      type: String,
      required: true,
      index: true,
      default: "ALL",
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      default: 0,
    },
    prefix: {
      type: String,
      required: true,
      default: "ZIN",
    },
    lastSequence: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one counter document per certificateType per year per month
CertificateSequenceSchema.index(
  { certificateType: 1, year: 1, month: 1 },
  { unique: true }
);

export const CertificateSequence: Model<ICertificateSequenceDocument> =
  mongoose.models.CertificateSequence ||
  mongoose.model<ICertificateSequenceDocument>(
    "CertificateSequence",
    CertificateSequenceSchema
  );
