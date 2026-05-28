"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Item = { href: string; label: string; icon: string };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: "dashboard" },
      { href: "/catalog", label: "Agent Catalog", icon: "inventory_2" },
    ],
  },
  {
    label: "Groupings",
    items: [
      { href: "/groupings", label: "Agent Groupings", icon: "category" },
      { href: "/industries", label: "Industries", icon: "factory" },
      { href: "/countries", label: "Countries", icon: "language" },
      { href: "/functions", label: "Functions", icon: "function" },
    ],
  },
  {
    label: "Deployment",
    items: [
      { href: "/knowledge-packs", label: "Knowledge Packs", icon: "library_books" },
      { href: "/integrations", label: "Integrations", icon: "extension" },
      { href: "/deployment-readiness", label: "Deployment Readiness", icon: "task_alt" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/id-mapping", label: "ID Mapping", icon: "swap_horiz" },
      { href: "/approval-queue", label: "Approval Queue", icon: "approval" },
      { href: "/export-center", label: "Export Center", icon: "cloud_download" },
      { href: "/audit-logs", label: "Audit Logs", icon: "history" },
      { href: "/admin", label: "Admin", icon: "admin_panel_settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname() || "/";
  const [sessionUser, setSessionUser] = useState<{ phoneE164: string } | null | undefined>(undefined);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/keyra/session/me", { method: "GET", cache: "no-store" });
      if (!res.ok) {
        setSessionUser(null);
        return;
      }
      const json = (await res.json()) as { user: { phoneE164: string } | null };
      setSessionUser(json.user ?? null);
    } catch {
      setSessionUser(null);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const authAction = useMemo(() => {
    if (sessionUser === undefined) return "loading" as const;
    return sessionUser ? ("logout" as const) : ("login" as const);
  }, [sessionUser]);

  return (
    <aside className="ds-sidebar" aria-label="Catalog navigation">
      <Link href="/" className="ds-sidebar-brand">
        <p className="ds-sidebar-brand__eyebrow">Keyra catalog</p>
        <p className="ds-sidebar-brand__title">ciright.agents.keyra.ie</p>
        <p className="ds-sidebar-brand__desc">Deployment catalog for Ciright-origin agents.</p>
      </Link>

      <nav className="ds-sidebar-nav">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="ds-sidebar-heading">{group.label}</p>
            {group.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`ds-sidebar-row${active ? " is-active" : ""}`}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="ds-sidebar-row__label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="ds-sidebar-footer">
        <div className="ds-sidebar-footer__chips">
          <span className="ds-sidebar-chip">
            <span className="ds-sidebar-chip__dot" aria-hidden />
            Sovereign
          </span>
          <span className="ds-sidebar-chip">v0.1.0</span>
        </div>

        {authAction === "loading" ? null : authAction === "login" ? (
          <Link href="/login?next=/" className="ds-sidebar-row mt-3">
            <span className="material-symbols-outlined" aria-hidden>
              login
            </span>
            <span className="ds-sidebar-row__label">Login</span>
          </Link>
        ) : (
          <button
            type="button"
            className="ds-sidebar-row mt-3"
            onClick={async () => {
              try {
                await fetch("/api/keyra/session/logout", { method: "POST" });
              } finally {
                setSessionUser(null);
                window.location.href = "/login";
              }
            }}
          >
            <span className="material-symbols-outlined" aria-hidden>
              logout
            </span>
            <span className="ds-sidebar-row__label">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
