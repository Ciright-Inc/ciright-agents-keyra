import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";
import { isMapped } from "@/lib/agent";
import { applyMapping, clearMapping } from "./actions";

export const dynamic = "force-dynamic";

export default async function IdMappingPage() {
  const agents = await prisma.keyraAgentCatalog.findMany({
    orderBy: [{ ciright_parent_agent_id: "asc" }, { agent_name: "asc" }],
  });

  const total = agents.length;
  const mapped = agents.filter(isMapped).length;
  const unmapped = total - mapped;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="ID Mapping"
        description="Bind each catalog agent to its Ciright parent agent ID and Ciright Core key. Mapping is the precondition for marketplace publication."
        actions={<Link href="/export-center" className="btn btn-primary">Open Export Center</Link>}
      />

      <section className="card p-5 mb-6">
        <h2 className="h-section mb-3">Workflow</h2>
        <ol className="text-[13px] space-y-2 text-muted list-decimal pl-4">
          <li>Create agent in ciright.agents.keyra.ie.</li>
          <li>Export agent list from the Export Center.</li>
          <li>Ciright team maps each agent to Ciright Core.</li>
          <li>Ciright Core returns <span className="mono">ciright_parent_agent_id</span> and <span className="mono">ciright_core_key</span>.</li>
          <li>Import the mapping file (or apply values inline below).</li>
          <li>Catalog row is updated and marked as mapped.</li>
          <li>Approve for marketplace publication via the Approval Queue.</li>
        </ol>
      </section>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4">
          <div className="h-eyebrow">Total agents</div>
          <div className="text-[24px] font-semibold mt-1">{total}</div>
        </div>
        <div className="card p-4">
          <div className="h-eyebrow">Mapped</div>
          <div className="text-[24px] font-semibold mt-1 text-[color:var(--positive)]">{mapped}</div>
        </div>
        <div className="card p-4">
          <div className="h-eyebrow">Awaiting mapping</div>
          <div className="text-[24px] font-semibold mt-1 text-[color:var(--warning)]">{unmapped}</div>
        </div>
      </div>

      <div className="space-y-2">
        {agents.map((a) => (
          <div
            key={a.keyra_agent_id}
            className="card p-4 grid grid-cols-12 gap-3 items-center"
          >
            <div className="col-span-12 md:col-span-3">
              <Link href={`/catalog/${a.agent_slug}`} className="font-medium hover:underline text-[13.5px]">
                {a.agent_name}
              </Link>
              <div className="text-[11px] text-muted mono truncate">{a.keyra_agent_id}</div>
              <div className="text-[11px] text-muted">{a.agent_industry}</div>
            </div>
            <form action={applyMapping} className="col-span-12 md:col-span-9 grid grid-cols-12 gap-2">
              <input type="hidden" name="agentId" value={a.keyra_agent_id} />
              <div className="col-span-12 md:col-span-4">
                <label className="h-eyebrow block mb-1">Parent Agent ID</label>
                <input
                  className="input mono"
                  name="parentId"
                  placeholder="ciright-parent-..."
                  defaultValue={a.ciright_parent_agent_id ?? ""}
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="h-eyebrow block mb-1">Core Key</label>
                <input
                  className="input mono"
                  name="coreKey"
                  placeholder="ck_..."
                  defaultValue={a.ciright_core_key ?? ""}
                />
              </div>
              <div className="col-span-6 md:col-span-2 flex items-end">
                {isMapped(a) ? <Chip tone="positive">Mapped</Chip> : <Chip tone="warning">Unmapped</Chip>}
              </div>
              <div className="col-span-6 md:col-span-2 flex items-end justify-end gap-1">
                <button className="btn btn-primary" type="submit">Apply</button>
              </div>
            </form>
            {isMapped(a) ? (
              <form action={clearMapping} className="col-span-12 flex justify-end">
                <input type="hidden" name="agentId" value={a.keyra_agent_id} />
                <button className="btn btn-ghost text-[12px]" type="submit">Clear mapping</button>
              </form>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
