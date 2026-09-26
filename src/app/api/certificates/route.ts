import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import {
  listCertificates,
  createCertificate,
} from "@/services/certificateService";
import { CertificateType } from "@/types/certificate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const certificateType = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const isExport = searchParams.get("export") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = isExport
      ? 10000
      : Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const result = await listCertificates({
      certificateType,
      status,
      search,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("List certificates API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve certificates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "certificates.create")) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to create certificates." }, { status: 403 });
    }

    const body = await req.json();
    const { certificateType, certificateData, initialStatus } = body;

    if (!certificateType || !certificateData) {
      return NextResponse.json(
        { error: "certificateType and certificateData are required" },
        { status: 400 }
      );
    }

    const certificate = await createCertificate(
      {
        certificateType: certificateType as CertificateType,
        certificateData,
        initialStatus: initialStatus || "DRAFT",
      },
      user
    );

    return NextResponse.json({ success: true, certificate }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create certificate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create certificate" },
      { status: 500 }
    );
  }
}
