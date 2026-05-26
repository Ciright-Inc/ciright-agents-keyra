import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";

export const dynamic = "force-dynamic";

export default async function KnowledgePacksPage() {
  const packs = await prisma.knowledgePack.findMany({
    orderBy: [{ scope: "asc" }, { name: "asc" }],
    include: { bindings: { include: { agent: true } } },
  });

  return (
    <>
      <PageHeader
        eyebrow="Templates"
        title="Knowledge Packs"
        description="Template knowledge resources attachable to agent designs. Customer-private knowledge is never stored here unless explicitly assigned as a template."
      />

      <div className="table-wrap">
        <table className="k-table">
          <thead>
            <tr>
              <th>Pack</th>
              <th>Scope</th>
              <th>Classification</th>
              <th>Bound agents</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {packs.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] text-muted mono">{p.slug}</div>
                </td>
                <td>
                  <Chip tone="muted">{p.scope}</Chip>
                </td>
                <td>
                  <Chip tone={p.classification === "Reserved" ? "sovereign" : "muted"}>
                    {p.classification}
                  </Chip>
                </td>
                <td>{p.bindings.length}</td>
                <td className="text-muted">{p.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-muted mt-3">
        Knowledge packs are templates only. Tenant-private knowledge remains
        inside the customer agent world.
      </div>
    </>
  );
}
