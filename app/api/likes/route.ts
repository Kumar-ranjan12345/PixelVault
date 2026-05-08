import { NextRequest, NextResponse } from "next/server";

// In-memory store — resets on redeploy
// Swap with Upstash Redis for persistence
const likes: Record<string, number> = {};

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  return NextResponse.json({ likes: likes[id] ?? 0 });
}

export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  likes[id] = (likes[id] ?? 0) + 1;
  return NextResponse.json({ likes: likes[id] });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  likes[id] = Math.max(0, (likes[id] ?? 0) - 1);
  return NextResponse.json({ likes: likes[id] });
}
