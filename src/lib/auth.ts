import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SessionUser, AuthTokenPayload } from "@/types/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

const AUTH_SECRET = process.env.AUTH_SECRET || "zeetork-automation-secret-key-2026-production-ready";
const SECRET_KEY = new TextEncoder().encode(AUTH_SECRET);
const COOKIE_NAME = "zeetork_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: Omit<AuthTokenPayload, "iat" | "exp">): Promise<string> {
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  return new SignJWT(cleanPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Get current session from cookie in Next.js Server Components / Route Handlers
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    roleId: payload.roleId,
    roleName: payload.roleName,
    permissions: payload.permissions || [],
    isActive: true,
  };
}

/**
 * Get current verified user from request or cookie, fetching latest state from DB
 */
export async function getAuthenticatedUser(
  req?: NextRequest
): Promise<SessionUser | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload || !payload.sub) return null;

  try {
    await connectToDatabase();
    const user = await User.findById(payload.sub).populate<{ roleId: { name: string; permissions: string[] } }>("roleId");

    if (!user || !user.isActive) {
      return null;
    }

    const role = user.roleId as unknown as { _id: unknown; name: string; permissions: string[] };

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roleId: role?._id ? (role._id as object).toString() : payload.roleId,
      roleName: role?.name || payload.roleName,
      permissions: role?.permissions || payload.permissions || [],
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Error retrieving authenticated user from database:", error);
    // Fallback to validated JWT payload if DB temporarily throttled
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
      permissions: payload.permissions || [],
      isActive: true,
    };
  }
}

export { COOKIE_NAME };
