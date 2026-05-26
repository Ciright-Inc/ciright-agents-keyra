"use client";

import { useMemo } from "react";
import { buildCatalogGetStartedAccessUrl } from "@/lib/catalogAppUrls";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";

type Props = {
  reason: "sign_in" | "no_access" | "config";
  phoneE164?: string;
  nextPath: string;
  configError?: string | null;
};

export function CatalogAccessGate({ reason, phoneE164, nextPath, configError }: Props) {
  const loginHref = useMemo(() => buildCatalogGetStartedAccessUrl(nextPath), [nextPath]);
  const isNoAccess = reason === "no_access";
  const isConfig = reason === "config" || Boolean(configError);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ds-canvas)] px-4 py-10">
      <div className="w-full max-w-lg rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] p-8 shadow-sm">
        <p className="ds-caption-uppercase text-[var(--ds-muted)]">Ciright deployment catalog</p>
        <h1 className="ds-title-md mt-3 text-[var(--ds-ink)]">
          {isConfig
            ? "Catalog login not configured"
            : isNoAccess
              ? "No catalog access"
              : "Sign in on Keyra"}
        </h1>

        {isConfig ? (
          <div className="ds-body-sm mt-5 space-y-3 text-[var(--ds-body)]">
            <p>{configError ?? "Server configuration is incomplete."}</p>
            <p className="text-[var(--ds-muted)]">
              On Railway, set <code className="text-xs">KEYRA_SESSION_SECRET</code> (same value as
              keyra.ie),{" "}
              <code className="text-xs">NEXT_PUBLIC_CATALOG_SITE_URL</code> to this app URL, and auth
              backend URLs, then redeploy.
            </p>
          </div>
        ) : isNoAccess ? (
          <div className="ds-body-sm mt-5 space-y-3 text-[var(--ds-body)]">
            <p>
              You are signed in to Keyra
              {phoneE164 ? (
                <>
                  {" "}
                  as <span className="font-medium text-[var(--ds-ink)]">{formatPhoneDisplay(phoneE164)}</span>
                </>
              ) : null}
              , but this mobile number is not linked to an active catalog operator.
            </p>
            <p>Contact a catalog administrator if you need access.</p>
          </div>
        ) : (
          <div className="ds-body-sm mt-5 space-y-3 text-[var(--ds-body)]">
            <p>
              Use <strong>Login on Keyra</strong> below. You will sign in on Keyra, then return to this
              catalog automatically.
            </p>
            <p className="text-[var(--ds-muted)]">
              On <code className="text-xs">*.railway.app</code> this is a separate site from keyra.ie —
              one-click login still works via Get Started. Access requires your mobile number in the
              catalog operator list.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {!isNoAccess && !isConfig ? (
            <a href={loginHref} className="ds-btn-primary">
              Login on Keyra
            </a>
          ) : null}
          <a href="https://keyra.ie" className="ds-btn-secondary">
            Back to keyra.ie
          </a>
        </div>
      </div>
    </div>
  );
}
