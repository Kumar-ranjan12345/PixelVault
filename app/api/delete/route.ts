import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

function getImageKit() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });
}

export async function DELETE(req: NextRequest) {
  const { fileId } = await req.json();
  if (!fileId) return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

  try {
    const ik = getImageKit();
    await ik.deleteFile(fileId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
