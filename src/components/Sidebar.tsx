"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      </div>
    </aside>
  );
}
