/**
 * Normalize Postgres URLs for Railway / cloud hosts (schema, SSL).
 *
 * IMPORTANT: This app shares its Postgres instance with other services on Railway.
 * To avoid Prisma trying to drop unrelated tables (e.g. affiliate_accounts), we
 * scope every connection to the `ciright_agents_keyra` schema. Prisma migrates
 * only objects in that schema; other apps remain untouched.
 */

const APP_SCHEMA = "ciright_agents_keyra";

function rewriteSchema(url: string, schema: string): string {
  if (url.includes("schema=")) {
    return url.replace(/([?&])schema=[^&]*/, `$1schema=${schema}`);
  }
  return url + (url.includes("?") ? "&" : "?") + `schema=${schema}`;
}

export function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  const url = raw?.trim();
  if (!url) return undefined;

  let out = rewriteSchema(url, APP_SCHEMA);

  const needsSsl =
    process.env.NODE_ENV === "production" &&
    !out.includes("sslmode=") &&
    !out.includes(".railway.internal") &&
    (out.includes("railway") ||
      out.includes("rlwy.net") ||
      process.env.RAILWAY_ENVIRONMENT === "production" ||
      process.env.RAILWAY_ENVIRONMENT === "true");

  if (needsSsl) {
    out += out.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }

  return out;
}

export function resolveDatabaseUrl(): string | undefined {
  return (
    normalizeDatabaseUrl(process.env.DIRECT_DATABASE_URL) ??
    normalizeDatabaseUrl(process.env.DATABASE_URL)
  );
}

export { APP_SCHEMA };
