import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { ActuatorModel, IActuatorModel } from "@/models/ActuatorModel";

export interface ActuatorModelDTO {
  series: string;
  actingType: "Double Acting" | "Single Acting";
  model: string;
  openTime?: number;
  closeTime?: number;
  springs?: Record<string, { open: number; close: number }>;
}

/**
 * Automatically seeds the ActuatorModel collection from data/data.json
 * if the collection is currently empty.
 */
export async function seedActuatorModelsIfEmpty(): Promise<number> {
  await connectToDatabase();

  const count = await ActuatorModel.countDocuments();
  if (count > 0) {
    return count;
  }

  const filePath = path.join(process.cwd(), "data", "data.json");
  if (!fs.existsSync(filePath)) {
    console.warn(`actuatorModelService: data.json not found at ${filePath}`);
    return 0;
  }

  const fileData = fs.readFileSync(filePath, "utf-8");
  const parsedData = JSON.parse(fileData);

  const docsToInsert: Array<Partial<IActuatorModel>> = [];

  for (const series of Object.keys(parsedData)) {
    const seriesData = parsedData[series];

    // 1. Double Acting
    if (seriesData["Double Acting"]) {
      const daModels = seriesData["Double Acting"];
      for (const modelKey of Object.keys(daModels)) {
        const timings = daModels[modelKey];
        docsToInsert.push({
          series,
          actingType: "Double Acting",
          model: modelKey.trim(),
          openTime: timings.open,
          closeTime: timings.close,
        });
      }
    }

    // 2. Single Acting
    if (seriesData["Single Acting"]) {
      const saModels = seriesData["Single Acting"];
      for (const modelKey of Object.keys(saModels)) {
        const springData = saModels[modelKey];
        docsToInsert.push({
          series,
          actingType: "Single Acting",
          model: modelKey.trim(),
          springs: springData,
        });
      }
    }
  }

  if (docsToInsert.length > 0) {
    await ActuatorModel.insertMany(docsToInsert);
    console.log(`Successfully seeded ${docsToInsert.length} actuator models into MongoDB.`);
  }

  return docsToInsert.length;
}

/**
 * Retrieves all actuator models, optionally filtered by a search string.
 */
export async function getActuatorModels(search?: string): Promise<ActuatorModelDTO[]> {
  await connectToDatabase();
  await seedActuatorModelsIfEmpty();

  const query: Record<string, unknown> = {};
  if (search && search.trim()) {
    query.model = { $regex: search.trim(), $options: "i" };
  }

  const models = await ActuatorModel.find(query)
    .sort({ series: 1, model: 1 })
    .lean();

  return models.map((m) => ({
    series: m.series,
    actingType: m.actingType,
    model: m.model,
    openTime: m.openTime,
    closeTime: m.closeTime,
    springs: m.springs,
  }));
}

/**
 * Find a specific actuator model by name (e.g. "ZRC8DA" or "ZRC8SA")
 */
export async function getActuatorModelByName(
  modelName: string
): Promise<ActuatorModelDTO | null> {
  await connectToDatabase();
  await seedActuatorModelsIfEmpty();

  const m = await ActuatorModel.findOne({
    model: { $regex: `^${modelName.trim()}$`, $options: "i" },
  }).lean();

  if (!m) return null;

  return {
    series: m.series,
    actingType: m.actingType,
    model: m.model,
    openTime: m.openTime,
    closeTime: m.closeTime,
    springs: m.springs,
  };
}
