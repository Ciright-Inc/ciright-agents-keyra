/** Production catalog requires a signing secret for keyra_session cookies. */
export function catalogSessionSecretConfigured(): boolean {
  return Boolean(process.env.KEYRA_SESSION_SECRET?.trim());
}

export function catalogSessionConfigError(): string | null {
  if (process.env.NODE_ENV !== "production") return null;
  if (catalogSessionSecretConfigured()) return null;
  return "KEYRA_SESSION_SECRET is not set on this Railway service. Add the same secret used on keyra.ie, then redeploy.";
}
