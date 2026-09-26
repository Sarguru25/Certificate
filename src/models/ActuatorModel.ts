import mongoose, { Schema, Model } from "mongoose";

export interface IActuatorModel {
  series: string; // "ZRC" | "ZRD"
  actingType: "Double Acting" | "Single Acting";
  model: string; // e.g. "ZRC8DA", "ZRC8SA"
  openTime?: number; // for Double Acting
  closeTime?: number; // for Double Acting
  springs?: Record<string, { open: number; close: number }>; // for Single Acting { "6": { open, close }, ... }
  createdAt: Date;
  updatedAt: Date;
}

const ActuatorModelSchema = new Schema<IActuatorModel>(
  {
    series: { type: String, required: true, index: true },
    actingType: {
      type: String,
      required: true,
      enum: ["Double Acting", "Single Acting"],
      index: true,
    },
    model: { type: String, required: true, unique: true, index: true },
    openTime: { type: Number },
    closeTime: { type: Number },
    springs: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ActuatorModel: Model<IActuatorModel> =
  mongoose.models.ActuatorModel ||
  mongoose.model<IActuatorModel>("ActuatorModel", ActuatorModelSchema);
