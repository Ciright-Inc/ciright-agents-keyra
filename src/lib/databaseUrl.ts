/**
 * Normalize Postgres URLs for Railway / cloud hosts (schema, SSL).
 *
 * IMPORTANT: This app shares its Postgres instance with other services on Railway.
 * To avoid Prisma trying to drop unrelated tables (e.g. affiliate_accounts), we
 * scope every connection to the `ciright_agents_keyra` schema. Prisma migrates
 * only objects in that schema; other apps remain untouched.
 */

const APP_SCHEMA = "ciright_agents_keyra";

function isRailwayInternalHost(hostname: string): boolean {
  return hostname.endsWith(".railway.internal");
}

export function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  const url = raw?.trim();
  if (!url) return undefined;

  try {
    const u = new URL(url);
    u.searchParams.set("schema", APP_SCHEMA);
    if (isRailwayInternalHost(u.hostname)) {
      u.searchParams.delete("sslmode");
      u.searchParams.delete("ssl");
      return u.toString();
    }
    const needsSsl =
      process.env.NODE_ENV === "production" &&
      !u.searchParams.has("sslmode") &&
      (u.hostname.includes("railway") ||
        u.hostname.includes("rlwy.net") ||
        process.env.RAILWAY_ENVIRONMENT === "production" ||
        process.env.RAILWAY_ENVIRONMENT === "true");
    if (needsSsl) {
      u.searchParams.set("sslmode", "require");
    }
    return u.toString();
  } catch {
    return url;
  }
}

export function resolveDatabaseUrl(): string | undefined {
  return (
    normalizeDatabaseUrl(process.env.DIRECT_DATABASE_URL) ??
    normalizeDatabaseUrl(process.env.DATABASE_URL)
  );
}

export { APP_SCHEMA };
