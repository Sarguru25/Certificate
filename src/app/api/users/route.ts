import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { listUsers, createUser } from "@/services/userService";
import { createUserSchema } from "@/lib/validation/userSchema";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, "users.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("List users API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve users" },
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

    if (!hasPermission(user, "users.create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = createUserSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createUser(validated.data);
    return NextResponse.json({
      success: true,
      user: {
        id: created._id,
        name: created.name,
        email: created.email,
        roleId: created.roleId,
        isActive: created.isActive,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create user API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 400 }
    );
  }
}
