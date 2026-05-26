import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";

export const dynamic = "force-dynamic";

export default async function IndustriesPage() {
  const [industries, agents] = await Promise.all([
    prisma.industry.findMany({ orderBy: { sort_order: "asc" } }),
    prisma.keyraAgentCatalog.findMany(),
  ]);

  const counts = new Map<string, number>();
  for (const a of agents) {
    counts.set(a.agent_industry, (counts.get(a.agent_industry) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Industries"
        description="Sovereign / regulated / commercial industries supported by the Keyra deployment catalog. Counts reflect distinct agent blueprints."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {industries.map((i) => {
          const count = counts.get(i.name) ?? 0;
          return (
            <Link
              key={i.id}
              href={`/catalog?industry=${encodeURIComponent(i.name)}`}
              className="card p-5 hover:bg-[color:var(--surface-2)] transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-[14px]">{i.name}</div>
                <Chip tone={count > 0 ? "positive" : "muted"}>{count}</Chip>
              </div>
              {i.description ? (
                <div className="text-[12px] text-muted mt-2">{i.description}</div>
              ) : (
                <div className="text-[12px] text-muted mt-2">
                  Catalog scope: {count} agent design{count === 1 ? "" : "s"}.
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
