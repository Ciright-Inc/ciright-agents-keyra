import { NextResponse } from "next/server";
import { resolveAuthBackendUrl } from "@/lib/resolveAuthBackendUrl";
import { KEYRA_SESSION_COOKIE } from "@/lib/keyraSessionCookie";
import { catalogSiteOrigin } from "@/lib/catalogAppUrls";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Best-effort: clear simsecure session on auth backend.
  try {
    const base = resolveAuthBackendUrl(req);
    await fetch(`${base}/auth/logout`, {
      method: "POST",
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
  } catch {
    // ignore
  }

  const res = NextResponse.redirect(new URL("/login", catalogSiteOrigin()));
  res.cookies.set({
    name: KEYRA_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
