import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import "@/models/Role";
import { verifyPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/authSchema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate<{
      roleId: { _id: unknown; name: string; permissions: string[] };
    }>("roleId");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact your system administrator." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const role = user.roleId as unknown as { _id: unknown; name: string; permissions: string[] };
    const roleName = role?.name || "Employee";
    const permissions = Array.isArray(role?.permissions)
      ? Array.from(role.permissions).map((p) => String(p))
      : [];

    const token = await signSessionToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      roleId: role?._id ? (role._id as object).toString() : "",
      roleName,
      permissions,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        roleName,
        permissions,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred during login." },
      { status: 500 }
    );
  }
}
