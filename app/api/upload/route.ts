import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"];

export async function POST(req: NextRequest) {
  // Verify secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.UPLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      results.push({ name: file.name, error: "Unsupported file type" });
      continue;
    }
    if (file.size > MAX_SIZE) {
      results.push({ name: file.name, error: "File too large (max 50MB)" });
      continue;
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      // Upload to ImageKit — thumbnails are generated on-the-fly via URL transforms
      const response = await imagekit.upload({
        file: buffer,
        fileName: safeName,
        folder: "/gallery",
        useUniqueFileName: false,
      });

      results.push({
        name: file.name,
        fileId: response.fileId,
        url: response.url,
        success: true,
      });
    } catch (err) {
      results.push({ name: file.name, error: "Upload failed" });
      console.error(err);
    }
  }

  return NextResponse.json({ results });
}
