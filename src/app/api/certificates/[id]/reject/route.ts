import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { rejectCertificate } from "@/services/approvalService";
import { rejectCertificateSchema } from "@/lib/validation/certificateSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.reject")) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to reject certificates." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = rejectCertificateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "A valid rejection reason is required (at least 3 characters)" },
        { status: 400 }
      );
    }

    const certificate = await rejectCertificate(id, user, validated.data.reason);

    return NextResponse.json({
      success: true,
      message: "Certificate rejected and returned to employee for correction.",
      certificate,
    });
  } catch (error: unknown) {
    console.error("Reject certificate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reject certificate" },
      { status: 400 }
    );
  }
}
