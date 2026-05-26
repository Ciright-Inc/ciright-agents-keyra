import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";
import { arr, isMapped, securityChipClass, statusChipClass } from "@/lib/agent";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  industry?: string;
  function?: string;
  type?: string;
  status?: string;
  approval?: string;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.q) {
    where.OR = [
      { agent_name: { contains: params.q } },
      { agent_description: { contains: params.q } },
      { agent_slug: { contains: params.q } },
    ];
  }
  if (params.industry) where.agent_industry = params.industry;
  if (params.function) where.agent_function = params.function;
  if (params.type) where.agent_type = params.type;
  if (params.status) where.deployment_status = params.status;
  if (params.approval === "yes") where.human_approval_required = true;
  if (params.approval === "no") where.human_approval_required = false;

  const [agents, industries, functions, types] = await Promise.all([
    prisma.keyraAgentCatalog.findMany({
      where,
      orderBy: [{ agent_industry: "asc" }, { agent_name: "asc" }],
    }),
    prisma.industry.findMany({ orderBy: { sort_order: "asc" } }),
    prisma.agentFunction.findMany({ orderBy: { name: "asc" } }),
    prisma.agentType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Agent Catalog"
        description={`${agents.length} deployable agent blueprints. Each row maps back to a Ciright parent agent once the Core key is assigned.`}
        actions={
          <>
            <Link href="/id-mapping" className="btn">ID Mapping</Link>
            <Link href="/export-center" className="btn btn-primary">Export Selected</Link>
          </>
        }
      />

      <form className="card p-4 mb-5" method="get">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4">
            <label className="h-eyebrow block mb-1">Search</label>
            <input
              className="input"
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Name, slug, description…"
            />
          </div>
          <div className="col-span-6 md:col-span-2">
            <label className="h-eyebrow block mb-1">Industry</label>
            <select className="select" name="industry" defaultValue={params.industry || ""}>
              <option value="">All</option>
              {industries.map((i) => (
                <option key={i.id} value={i.name}>{i.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-6 md:col-span-2">
            <label className="h-eyebrow block mb-1">Function</label>
            <select className="select" name="function" defaultValue={params.function || ""}>
              <option value="">All</option>
              {functions.map((f) => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-6 md:col-span-2">
            <label className="h-eyebrow block mb-1">Type</label>
            <select className="select" name="type" defaultValue={params.type || ""}>
              <option value="">All</option>
              {types.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-6 md:col-span-2">
            <label className="h-eyebrow block mb-1">Status</label>
            <select className="select" name="status" defaultValue={params.status || ""}>
              <option value="">All</option>
              <option>Draft</option>
              <option>In Review</option>
              <option>Approved</option>
              <option>Published</option>
              <option>Retired</option>
            </select>
          </div>
          <div className="col-span-6 md:col-span-2">
            <label className="h-eyebrow block mb-1">Human approval</label>
            <select className="select" name="approval" defaultValue={params.approval || ""}>
              <option value="">All</option>
              <option value="yes">Required</option>
              <option value="no">Not required</option>
            </select>
          </div>
          <div className="col-span-12 flex items-center gap-2 mt-1">
            <button className="btn btn-primary" type="submit">Apply</button>
            <Link href="/catalog" className="btn">Reset</Link>
          </div>
        </div>
      </form>

      <div className="table-wrap">
        <table className="k-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Industry / Function</th>
              <th>Type</th>
              <th>Mapping</th>
              <th>Security</th>
              <th>Status</th>
              <th>Flags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted">No agents match the current filters.</td>
              </tr>
            ) : (
              agents.map((a) => (
                <tr key={a.keyra_agent_id}>
                  <td>
                    <Link
                      href={`/catalog/${a.agent_slug}`}
                      className="font-medium hover:underline"
                    >
                      {a.agent_name}
                    </Link>
                    <div className="text-[11px] text-muted mono">{a.agent_slug}</div>
                  </td>
                  <td>
                    <div>{a.agent_industry}</div>
                    <div className="text-[11px] text-muted">{a.agent_function}</div>
                  </td>
                  <td>{a.agent_type}</td>
                  <td>
                    {isMapped(a) ? (
                      <div>
                        <Chip tone="positive"><span className="chip-dot" /> Mapped</Chip>
                        <div className="text-[10.5px] mono text-muted mt-1">
                          {a.ciright_core_key}
                        </div>
                      </div>
                    ) : (
                      <Chip tone="warning"><span className="chip-dot" /> Unmapped</Chip>
                    )}
                  </td>
                  <td>
                    <span className={securityChipClass(a.security_classification)}>
                      {a.security_classification}
                    </span>
                  </td>
                  <td>
                    <span className={statusChipClass(a.deployment_status)}>
                      {a.deployment_status}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {a.human_approval_required && <Chip tone="warning">HITL</Chip>}
                      {a.knowledge_pack_required && <Chip tone="muted">Pack</Chip>}
                      {a.regulatory_classification !== "None" && (
                        <Chip tone="sovereign">{a.regulatory_classification}</Chip>
                      )}
                      {a.subscription_ready && <Chip tone="positive">Ready</Chip>}
                    </div>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/catalog/${a.agent_slug}`}
                      className="text-[12px] hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-muted mt-3">
        Catalog reflects clean agent designs. Country tags scope marketplace
        applicability, not active deployments.
      </div>
    </>
  );
}
