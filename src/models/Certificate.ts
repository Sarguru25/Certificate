import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificateDocument extends Document {
  certificateNumber: string;
  certificateType:
    | "electric-actuator"
    | "limit-switch"
    | "pneumatic-actuator"
    | "solenoid-valve"
    | "warranty-certificate";
  revision: number;
  parentCertificateId?: mongoose.Types.ObjectId;
  status: "DRAFT" | "PENDING_APPROVAL" | "REJECTED" | "APPROVED";
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  submittedAt?: Date;
  approvedAt?: Date;
  certificateData: Record<string, unknown>;
  approval: {
    requiredApprovers: mongoose.Types.ObjectId[];
    approvals: Array<{
      userId: mongoose.Types.ObjectId;
      status: "PENDING" | "APPROVED" | "REJECTED";
      approvedAt?: Date;
      note?: string;
    }>;
  };
  approvalHistory: Array<{
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedByName: string;
    performedAt: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificateDocument>(
  {
    certificateNumber: {
      type: String,
      required: true,
      index: true,
    },
    certificateType: {
      type: String,
      required: true,
      enum: [
        "electric-actuator",
        "limit-switch",
        "pneumatic-actuator",
        "solenoid-valve",
        "warranty-certificate",
      ],
      index: true,
    },
    revision: {
      type: Number,
      required: true,
      default: 0,
    },
    parentCertificateId: {
      type: Schema.Types.ObjectId,
      ref: "Certificate",
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "PENDING_APPROVAL", "REJECTED", "APPROVED"],
      default: "DRAFT",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    submittedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    certificateData: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    approval: {
      requiredApprovers: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      approvals: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
          },
          approvedAt: {
            type: Date,
          },
          note: {
            type: String,
          },
        },
      ],
    },
    approvalHistory: [
      {
        action: {
          type: String,
          required: true,
        },
        performedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        performedByName: {
          type: String,
          required: true,
        },
        performedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring uniqueness across certificate number and revision
CertificateSchema.index(
  { certificateNumber: 1, revision: 1 },
  { unique: true }
);

CertificateSchema.index({ certificateType: 1, status: 1 });
CertificateSchema.index({ createdAt: -1 });

if (mongoose.models.Certificate) {
  delete (mongoose.models as Record<string, unknown>).Certificate;
}

export const Certificate: Model<ICertificateDocument> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificateDocument>("Certificate", CertificateSchema);
