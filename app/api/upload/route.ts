import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"];

function getImageKit() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const ik = getImageKit();
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

      const response = await ik.upload({
        file: buffer,
        fileName: safeName,
        folder: "/gallery",
        useUniqueFileName: false,
      });

      results.push({ name: file.name, fileId: response.fileId, url: response.url, success: true });
    } catch (err) {
      results.push({ name: file.name, error: "Upload failed" });
      console.error(err);
    }
  }

  return NextResponse.json({ results });
}
