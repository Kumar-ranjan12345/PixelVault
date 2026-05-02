import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name");

  if (!url || !name) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Only allow ImageKit URLs
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  if (!url.startsWith(endpoint)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 403 });
  }

  // Append ImageKit download param
  const downloadUrl = `${url}?ik-attachment=true`;
  return NextResponse.json({ url: downloadUrl });
}
