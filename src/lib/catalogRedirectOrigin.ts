import { catalogSiteOrigin } from "@/lib/catalogAppUrls";

function hostnameFromHostHeader(hostHeader: string | null): string {
  if (!hostHeader) return "";
  return hostHeader.split(",")[0]!.split(":")[0]!.trim().toLowerCase();
}

function isInternalBindHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "0.0.0.0" || h === "127.0.0.1" || h === "[::1]" || h === "localhost";
}

/** Public origin for post-login redirects (Railway-safe). */
export function resolveCatalogRedirectOrigin(req: Request): string {
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim() ?? "";
  const hostname = hostnameFromHostHeader(host);
  const protoHeader = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    protoHeader === "http" || protoHeader === "https"
      ? protoHeader
      : process.env.NODE_ENV === "production"
        ? "https"
        : "http";

  if (host && hostname && !isInternalBindHostname(hostname)) {
    return `${proto}://${host}`;
  }

  return catalogSiteOrigin();
}
