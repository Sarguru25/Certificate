import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { cloneCertificate } from "@/services/certificateService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.create")) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to create certificates." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const cloned = await cloneCertificate(id, user);

    return NextResponse.json({
      success: true,
      message: `Certificate cloned successfully as ${cloned.certificateNumber}`,
      certificate: cloned,
    });
  } catch (error: unknown) {
    console.error("Clone certificate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clone certificate" },
      { status: 400 }
    );
  }
}
