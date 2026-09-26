import { NextRequest, NextResponse } from "next/server";
import { getActuatorModels } from "@/services/actuatorModelService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;

    const models = await getActuatorModels(search);

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error) {
    console.error("Actuator models API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve actuator models" },
      { status: 500 }
    );
  }
}
