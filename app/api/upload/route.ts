import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const MAX_SIZE = 50 * 1024 * 1024;
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
  const category = formData.get("category") as string || "";
  const location = formData.get("location") as string || "";

  if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  const ik = getImageKit();
  const results = [];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Find highest IMG number across all existing files to continue from there
  const existing = await ik.listFiles({ path: "/gallery", fileType: "image", limit: 1000 }) as any[];
  let maxNum = 0;
  for (const f of existing) {
    const match = f.name?.match(/IMG_(\d+)/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
  }
  let nextNum = maxNum + 1;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!ALLOWED_TYPES.includes(file.type)) { results.push({ name: file.name, error: "Unsupported file type" }); continue; }
    if (file.size > MAX_SIZE) { results.push({ name: file.name, error: "File too large (max 50MB)" }); continue; }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = `${dateStr}-IMG_${nextNum++}.${ext}`;

      const response = await ik.upload({
        file: buffer,
        fileName: safeName,
        folder: "/gallery",
        useUniqueFileName: false,
        tags: [category, location].filter(Boolean),
      });

      results.push({ name: file.name, fileId: response.fileId, url: response.url, success: true });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
      results.push({ name: file.name, error: `Upload failed: ${errMsg}` });
      console.error(`Upload failed for ${file.name}:`, JSON.stringify(err, null, 2));
    }
  }

  return NextResponse.json({ results });
}
