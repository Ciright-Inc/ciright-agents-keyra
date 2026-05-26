import { cache } from "react";
import { redirect } from "next/navigation";
import {
  resolveCatalogAccessState,
  resolveCatalogAuthFromCookies,
  type CatalogAuth,
} from "@/lib/catalogAuthContext";

function authContinueHref(nextPath: string): string {
  const sp = new URLSearchParams();
  sp.set("next", nextPath);
  return `/api/keyra/session/continue?${sp.toString()}`;
}

function catalogLoginHref(nextPath: string, reason?: "sign_in" | "no_access"): string {
  const sp = new URLSearchParams();
  sp.set("next", nextPath);
  if (reason) sp.set("reason", reason);
  return `/login?${sp.toString()}`;
}

export const getCatalogAuth = cache(async (): Promise<CatalogAuth | null> => {
  return resolveCatalogAuthFromCookies();
});

export async function assertCatalogServer(nextPath = "/"): Promise<CatalogAuth> {
  const auth = await getCatalogAuth();
  if (auth) return auth;

  const access = await resolveCatalogAccessState();
  if (access.status === "unsigned") {
    redirect(authContinueHref(nextPath));
  }
  redirect(catalogLoginHref(nextPath, "no_access"));
}
