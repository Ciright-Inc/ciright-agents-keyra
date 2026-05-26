import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ciright-agents-keyra",
    time: new Date().toISOString(),
  });
}
