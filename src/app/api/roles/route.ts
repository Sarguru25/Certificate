import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { listRoles, createRole } from "@/services/userService";
import { roleSchema } from "@/lib/validation/userSchema";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "roles.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const roles = await listRoles();
    return NextResponse.json({ roles });
  } catch (error) {
    console.error("List roles API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve roles" },
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

    if (!hasPermission(user, "roles.create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = roleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createRole(validated.data);
    return NextResponse.json({ success: true, role: created }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create role API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create role" },
      { status: 400 }
    );
  }
}
