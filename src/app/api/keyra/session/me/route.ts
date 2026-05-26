import { cookies } from "next/headers";
import {
  KEYRA_SESSION_COOKIE,
  parseSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const raw = jar.get(KEYRA_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ user: null as KeyraSessionUser | null });
  }
  const user = parseSession(raw);
  if (!user) {
    const res = NextResponse.json({ user: null as KeyraSessionUser | null });
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
  return NextResponse.json({ user });
}
