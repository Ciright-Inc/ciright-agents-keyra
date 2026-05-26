"use client";

import { useMemo } from "react";
import { buildCatalogGetStartedAccessUrl } from "@/lib/catalogAppUrls";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";

type Props = {
  reason: "sign_in" | "no_access";
  phoneE164?: string;
  nextPath: string;
};

export function CatalogAccessGate({ reason, phoneE164, nextPath }: Props) {
  const loginHref = useMemo(() => buildCatalogGetStartedAccessUrl(nextPath), [nextPath]);
  const isNoAccess = reason === "no_access";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ds-canvas)] px-4 py-10">
      <div className="w-full max-w-lg rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] p-8 shadow-sm">
        <p className="ds-caption-uppercase text-[var(--ds-muted)]">Ciright deployment catalog</p>
        <h1 className="ds-title-md mt-3 text-[var(--ds-ink)]">
          {isNoAccess ? "No catalog access" : "Sign in on Keyra first"}
        </h1>

        {isNoAccess ? (
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
            <p>This catalog uses the same Keyra session as keyra.ie. Sign in on Keyra, then return here.</p>
            <p>Access is granted when your mobile number matches an active operator record.</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {!isNoAccess ? (
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
