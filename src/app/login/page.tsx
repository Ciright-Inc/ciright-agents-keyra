import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CatalogAccessGate } from "./CatalogAccessGate";
import {
  resolveCatalogAccessState,
  resolveCatalogAuthFromCookies,
} from "@/lib/catalogAuthContext";

type Search = { next?: string; reason?: string };

function safeNext(raw: string | undefined): string {
  const n = raw?.trim() || "/";
  return n.startsWith("/") && !n.startsWith("/login") ? n : "/";
}

async function CatalogLoginContent({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const nextPath = safeNext(sp.next);
  const auth = await resolveCatalogAuthFromCookies();
  if (auth) redirect(nextPath);

  const access = await resolveCatalogAccessState();
  if (access.status === "authorized") redirect(nextPath);

  const reason =
    sp.reason === "no_access" || access.status === "no_access" ? "no_access" : "sign_in";

  return (
    <CatalogAccessGate
      reason={reason}
      phoneE164={access.status === "no_access" ? access.phoneE164 : undefined}
      nextPath={nextPath}
    />
  );
}

export default function CatalogLoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center ds-body-sm text-[var(--ds-body)]">
          Loading…
        </div>
      }
    >
      <CatalogLoginContent searchParams={searchParams} />
    </Suspense>
  );
}
