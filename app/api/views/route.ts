import { NextRequest, NextResponse } from "next/server";

const views: Record<string, number> = {};

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  return NextResponse.json({ views: views[id] ?? 0 });
}

export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  views[id] = (views[id] ?? 0) + 1;
  return NextResponse.json({ views: views[id] });
}
