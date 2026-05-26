import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";

export const dynamic = "force-dynamic";

export default async function GroupingsPage() {
  const agents = await prisma.keyraAgentCatalog.findMany({
    orderBy: { agent_name: "asc" },
  });

  const byIndustry = group(agents, (a) => a.agent_industry);
  const byFunction = group(agents, (a) => a.agent_function);
  const byType = group(agents, (a) => a.agent_type);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Agent Groupings"
        description="Agents grouped by industry, function, and agent type. Used to organize the deployment catalog and downstream marketplace bundles."
      />

      <GroupSection title="Industry" entries={byIndustry} />
      <GroupSection title="Function" entries={byFunction} />
      <GroupSection title="Agent Type" entries={byType} />
    </>
  );
}

function group<T>(arr: T[], key: (t: T) => string) {
  const m = new Map<string, T[]>();
  for (const v of arr) {
    const k = key(v);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(v);
  }
  return Array.from(m.entries()).sort((a, b) => b[1].length - a[1].length);
}

function GroupSection({
  title,
  entries,
}: {
  title: string;
  entries: Array<[string, Array<{ keyra_agent_id: string; agent_name: string; agent_slug: string }>]>;
}) {
  return (
    <section className="mb-8">
      <h2 className="h-section mb-3">By {title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map(([label, rows]) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-[14px]">{label}</div>
              <Chip tone="muted">{rows.length}</Chip>
            </div>
            <ul className="text-[13px] space-y-1">
              {rows.map((r) => (
                <li key={r.keyra_agent_id}>
                  <Link
                    href={`/catalog/${r.agent_slug}`}
                    className="hover:underline"
                  >
                    {r.agent_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
