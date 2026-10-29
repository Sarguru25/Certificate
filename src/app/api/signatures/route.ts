import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

const SIGNATURE_DIR = path.join(process.cwd(), "public", "signature");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

function ensureSignatureDir() {
  if (!fs.existsSync(SIGNATURE_DIR)) {
    fs.mkdirSync(SIGNATURE_DIR, { recursive: true });
  }

  // Also check if public directory has any loose signature-* files and copy them over if not present
  try {
    if (fs.existsSync(PUBLIC_DIR)) {
      const publicFiles = fs.readdirSync(PUBLIC_DIR);
      for (const file of publicFiles) {
        if (
          file.toLowerCase().startsWith("signature") &&
          ALLOWED_EXTENSIONS.has(path.extname(file).toLowerCase())
        ) {
          const dest = path.join(SIGNATURE_DIR, file);
          if (!fs.existsSync(dest)) {
            fs.copyFileSync(path.join(PUBLIC_DIR, file), dest);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error synchronizing signature files:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    ensureSignatureDir();

    const files = fs.readdirSync(SIGNATURE_DIR);
    const signatures = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ALLOWED_EXTENSIONS.has(ext);
      })
      .map((file) => {
        const parsedName = path.parse(file).name;
        // Clean display name (e.g. "signature-karthikeyan" -> "Karthikeyan" or formatted)
        const displayName = parsedName
          .replace(/^signature[-_]?/i, "")
          .replace(/[-_]/g, " ")
          .trim();

        return {
          filename: file,
          name: displayName ? displayName.toUpperCase() : file,
          url: `/signature/${file}`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, signatures });
  } catch (error) {
    console.error("Signatures list error:", error);
    return NextResponse.json(
      { error: "Failed to list signature files" },
      { status: 500 }
    );
  }
}
