import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import "@/models/Role";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getAuthenticatedUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const activeUsers = await User.find({ isActive: true })
      .select("_id name email signature roleId")
      .populate("roleId", "name")
      .sort({ name: 1 })
      .lean();

    const signatories = activeUsers.map((u) => {
      const roleName =
        u.roleId && typeof u.roleId === "object" && "name" in u.roleId
          ? (u.roleId as { name: string }).name
          : "";

      return {
        _id: String(u._id),
        name: u.name,
        email: u.email,
        signature: u.signature || "",
        roleName,
      };
    });

    return NextResponse.json({ success: true, signatories });
  } catch (error) {
    console.error("Fetch signatories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch signatories" },
      { status: 500 }
    );
  }
}
