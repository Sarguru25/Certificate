import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { submitCertificateForApproval } from "@/services/approvalService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.submit")) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to submit certificates for approval." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const certificate = await submitCertificateForApproval(id, user);

    return NextResponse.json({
      success: true,
      message: "Certificate submitted for two-person approval",
      certificate,
    });
  } catch (error: unknown) {
    console.error("Submit certificate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit certificate" },
      { status: 400 }
    );
  }
}
