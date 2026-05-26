import type { KeyraSessionUser } from "@/lib/keyraSessionCookie";
import { fetchAuthSessionSnapshot } from "@/lib/keyraProtection";
import { buildKeyraSessionUser } from "@/lib/keyraSessionResponse";

export async function resolveKeyraSessionUserFromAuth(
  req: Request,
): Promise<KeyraSessionUser | null> {
  const auth = await fetchAuthSessionSnapshot(req);
  if (!auth.authenticated || !auth.phoneE164) return null;
  return buildKeyraSessionUser(auth.phoneE164, auth);
}

export async function resolveKeyraSessionUserFromPhone(
  phone: string,
): Promise<KeyraSessionUser | null> {
  const trimmed = phone.trim();
  if (!trimmed.startsWith("+") || trimmed.replace(/\D/g, "").length < 8) return null;
  return buildKeyraSessionUser(trimmed);
}

export function pickPhoneFromSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): string | null {
  const read = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key)?.trim();
    }
    const raw = params[key];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim();
  };

  for (const key of ["phone", "phoneNumber", "mobile", "msisdn"]) {
    const v = read(key);
    if (v?.startsWith("+")) return v;
  }
  return null;
}

export function devSessionPhoneFallback(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const phone = process.env.KEYRA_DEV_SESSION_PHONE?.trim();
  return phone?.startsWith("+") ? phone : null;
}

export function safeSessionContinueNext(raw: string | null | undefined): string {
  const next = raw?.trim() || "/";
  return next.startsWith("/") ? next : "/";
}
