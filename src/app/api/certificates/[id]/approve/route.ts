import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { approveCertificate } from "@/services/approvalService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.approve")) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to approve certificates." },
        { status: 403 }
      );
    }

    const { id } = await params;
    let note: string | undefined;

    try {
      const body = await req.json();
      note = body.note;
    } catch {
      // Empty body is acceptable for approve
    }

    const certificate = await approveCertificate(id, user, note);

    return NextResponse.json({
      success: true,
      message: "Certificate has been verified and approved successfully.",
      certificate,
    });
  } catch (error: unknown) {
    console.error("Approve certificate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve certificate" },
      { status: 400 }
    );
  }
}
