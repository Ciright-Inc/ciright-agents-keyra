import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const integrations = await prisma.integration.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { bindings: true },
  });

  const grouped = new Map<string, typeof integrations>();
  for (const i of integrations) {
    if (!grouped.has(i.category)) grouped.set(i.category, []);
    grouped.get(i.category)!.push(i);
  }

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Integrations"
        description="Required upstream systems an agent design connects to at deployment time. Connection state is per-tenant — only required surfaces are catalogued here."
      />

      {Array.from(grouped.entries()).map(([cat, list]) => (
        <section key={cat} className="mb-6">
          <div className="h-eyebrow mb-2">{cat}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((i) => (
              <div key={i.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[14px]">{i.name}</div>
                    <div className="text-[11px] text-muted">{i.vendor ?? "—"}</div>
                  </div>
                  <Chip tone="muted">{i.bindings.length}</Chip>
                </div>
                {i.description ? (
                  <div className="text-[12px] text-muted mt-2">{i.description}</div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
