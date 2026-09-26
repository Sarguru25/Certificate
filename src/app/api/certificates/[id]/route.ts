import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import {
  getCertificateById,
  updateCertificate,
  deleteCertificate,
} from "@/services/certificateService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const certificate = await getCertificateById(id);

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Get certificate API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve certificate" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.edit")) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to edit certificates." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { certificateData } = body;

    if (!certificateData) {
      return NextResponse.json(
        { error: "certificateData is required" },
        { status: 400 }
      );
    }

    const updated = await updateCertificate(id, certificateData, user);
    return NextResponse.json({ success: true, certificate: updated });
  } catch (error: unknown) {
    console.error("Update certificate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update certificate" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.delete")) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to delete certificates." }, { status: 403 });
    }

    const { id } = await params;
    await deleteCertificate(id, user);

    return NextResponse.json({ success: true, message: "Draft deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete certificate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete certificate" },
      { status: 400 }
    );
  }
}
