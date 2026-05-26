function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** This catalog app (ciright.agents.keyra.ie or Railway URL). */
export function catalogSiteOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_CATALOG_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      (process.env.NODE_ENV === "production"
        ? "https://ciright.agents.keyra.ie"
        : "http://localhost:3040"),
  );
}

export function keyraGetStartedUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_GET_STARTED_URL?.trim() || "https://get-started.keyra.ie");
}

export function buildGetStartedAccessUrl(returnToAbsoluteUrl: string): string {
  const gs = keyraGetStartedUrl();
  let u = returnToAbsoluteUrl.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    const base = catalogSiteOrigin();
    const path = u.startsWith("/") ? u : `/${u}`;
    u = `${trimSlash(base)}${path}`;
  }
  return `${gs}/?return=${encodeURIComponent(u)}`;
}

export function buildKeyraSessionContinueUrl(nextPath: string): string {
  const base = catalogSiteOrigin();
  const path = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${trimSlash(base)}/api/keyra/session/continue?next=${encodeURIComponent(path)}`;
}

/** Catalog "Login on Keyra" — return via session bridge on this origin. */
export function buildCatalogGetStartedAccessUrl(nextPath: string): string {
  return buildGetStartedAccessUrl(buildKeyraSessionContinueUrl(nextPath));
}
