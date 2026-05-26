import { resolveCatalogRedirectOrigin } from "@/lib/catalogRedirectOrigin";
import {
  devSessionPhoneFallback,
  pickPhoneFromSearchParams,
  resolveKeyraSessionUserFromAuth,
  resolveKeyraSessionUserFromPhone,
  safeSessionContinueNext,
} from "@/lib/keyraSessionEstablish";
import { redirectWithKeyraSession } from "@/lib/keyraSessionResponse";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const nextPath = safeSessionContinueNext(url.searchParams.get("next"));
  const origin = resolveCatalogRedirectOrigin(req);

  const fromAuth = await resolveKeyraSessionUserFromAuth(req);
  if (fromAuth) {
    const res = redirectWithKeyraSession(fromAuth, nextPath, origin);
    if (res) return res;
  }

  const phone = pickPhoneFromSearchParams(url.searchParams) ?? devSessionPhoneFallback();
  if (phone) {
    const fromPhone = await resolveKeyraSessionUserFromPhone(phone);
    if (fromPhone) {
      const res = redirectWithKeyraSession(fromPhone, nextPath, origin);
      if (res) return res;
    }
  }

  const login = new URL("/login", origin);
  login.searchParams.set("next", nextPath);
  login.searchParams.set("reason", "sign_in");
  return NextResponse.redirect(login);
}
