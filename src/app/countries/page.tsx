import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";
import { arr } from "@/lib/agent";

export const dynamic = "force-dynamic";

/**
 * Convert a 2-letter ISO country code to its flag emoji using regional
 * indicator symbols. Returns "" for non-ISO-2 inputs (e.g. "ALL").
 */
function isoToFlag(iso: string | null | undefined): string {
  if (!iso || iso.length !== 2) return "";
  const upper = iso.toUpperCase();
  const a = upper.charCodeAt(0);
  const b = upper.charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return "";
  return String.fromCodePoint(0x1f1e6 + a - 65, 0x1f1e6 + b - 65);
}

export default async function CountriesPage() {
  const [countries, agents] = await Promise.all([
    prisma.country.findMany({ orderBy: [{ region: "asc" }, { name: "asc" }] }),
    prisma.keyraAgentCatalog.findMany(),
  ]);

  const tally = new Map<string, number>();
  let universal = 0;
  for (const a of agents) {
    const codes = arr(a.country_applicability);
    if (codes.includes("ALL")) {
      universal += 1;
      continue;
    }
    for (const c of codes) tally.set(c, (tally.get(c) ?? 0) + 1);
  }

  const byRegion = new Map<string, typeof countries>();
  for (const c of countries) {
    if (!byRegion.has(c.region)) byRegion.set(c.region, []);
    byRegion.get(c.region)!.push(c);
  }

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Countries"
        description="Country applicability scopes which markets an agent design is permitted for in the Keyra marketplace. Lineage is independent of tenant data."
      />

      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="h-eyebrow">Globally applicable</div>
            <div className="text-[22px] font-semibold mt-1 leading-none">{universal}</div>
            <div className="text-[12px] text-muted mt-1.5">
              Agents tagged ALL — eligible in every supported country.
            </div>
          </div>
          <Chip tone="sovereign">ALL</Chip>
        </div>
      </div>

      {Array.from(byRegion.entries()).map(([region, list]) => (
        <section key={region} className="mb-5">
          <div className="h-eyebrow mb-2">{region}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {list.map((c) => {
              const count = (tally.get(c.iso_code) ?? 0) + universal;
              const flag = isoToFlag(c.iso_code);
              return (
                <Link
                  key={c.id}
                  href={`/catalog`}
                  className="card country-card group"
                >
                  <span
                    className="country-card__flag"
                    aria-hidden={flag ? undefined : true}
                    role={flag ? "img" : undefined}
                    aria-label={flag ? `Flag of ${c.name}` : undefined}
                  >
                    {flag || c.iso_code}
                  </span>
                  <div className="country-card__meta">
                    <div className="country-card__name">{c.name}</div>
                    <div className="country-card__iso mono">{c.iso_code}</div>
                  </div>
                  <Chip tone="muted" className="country-card__count">
                    {count}
                  </Chip>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
