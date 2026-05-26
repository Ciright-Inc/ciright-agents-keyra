import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";

export const dynamic = "force-dynamic";

export default async function FunctionsPage() {
  const [functions, types, agents] = await Promise.all([
    prisma.agentFunction.findMany({ orderBy: { name: "asc" } }),
    prisma.agentType.findMany({ orderBy: { name: "asc" } }),
    prisma.keyraAgentCatalog.findMany(),
  ]);

  const fnCounts = new Map<string, number>();
  for (const a of agents) {
    fnCounts.set(a.agent_function, (fnCounts.get(a.agent_function) ?? 0) + 1);
  }
  const typeCounts = new Map<string, number>();
  for (const a of agents) {
    typeCounts.set(a.agent_type, (typeCounts.get(a.agent_type) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Functions"
        description="Operational functions and agent types supported by the catalog. Used to classify and bundle agents for marketplace deployment."
      />

      <h2 className="h-section mb-3">Operational functions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {functions.map((f) => {
          const count = fnCounts.get(f.name) ?? 0;
          return (
            <Link
              key={f.id}
              href={`/catalog?function=${encodeURIComponent(f.name)}`}
              className="card p-5 hover:bg-[color:var(--surface-2)] transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-[14px]">{f.name}</div>
                <Chip tone={count > 0 ? "positive" : "muted"}>{count}</Chip>
              </div>
            </Link>
          );
        })}
      </div>

      <h2 className="h-section mb-3">Agent types</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {types.map((t) => {
          const count = typeCounts.get(t.name) ?? 0;
          return (
            <Link
              key={t.id}
              href={`/catalog?type=${encodeURIComponent(t.name)}`}
              className="card p-5 hover:bg-[color:var(--surface-2)] transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-[14px]">{t.name}</div>
                <Chip tone={count > 0 ? "positive" : "muted"}>{count}</Chip>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
