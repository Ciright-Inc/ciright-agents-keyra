import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";
import { isMapped } from "@/lib/agent";

export const dynamic = "force-dynamic";

export default async function DeploymentReadinessPage() {
  const agents = await prisma.keyraAgentCatalog.findMany({
    orderBy: { agent_name: "asc" },
    include: {
      knowledge_packs: true,
      integrations: true,
    },
  });

  const rows = agents.map((a) => {
    const checks = [
      isMapped(a),
      !a.knowledge_pack_required || a.knowledge_packs.length > 0,
      a.integrations.length > 0,
      a.deployment_status === "Approved" || a.deployment_status === "Published",
      a.approved_by !== null,
      a.subscription_ready,
    ];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    return { agent: a, score, checks };
  });

  rows.sort((x, y) => y.score - x.score);

  const ready = rows.filter((r) => r.score === 100).length;
  const partial = rows.filter((r) => r.score > 0 && r.score < 100).length;
  const draft = rows.filter((r) => r.score === 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Deployment Readiness"
        description="Composite readiness across mapping, packs, integrations, approval, and subscription packaging. Required to publish into agents.keyra.ie."
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Ready" value={ready} tone="positive" />
        <StatCard label="In progress" value={partial} tone="warning" />
        <StatCard label="Draft / unmapped" value={draft} tone="muted" />
      </div>

      <div className="table-wrap">
        <table className="k-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Industry</th>
              <th>Readiness</th>
              <th>Mapping</th>
              <th>Pack</th>
              <th>Integrations</th>
              <th>Approval</th>
              <th>Marketplace</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ agent: a, score, checks }) => (
              <tr key={a.keyra_agent_id}>
                <td>
                  <Link href={`/catalog/${a.agent_slug}`} className="font-medium hover:underline">
                    {a.agent_name}
                  </Link>
                </td>
                <td>{a.agent_industry}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-[80px] h-1.5 bg-[color:var(--surface-2)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[color:var(--text)]"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="text-[12px] tabular-nums w-9 text-right">{score}%</div>
                  </div>
                </td>
                <CheckCell ok={checks[0]} />
                <CheckCell ok={checks[1]} />
                <CheckCell ok={checks[2]} />
                <CheckCell ok={checks[4]} />
                <CheckCell ok={checks[5]} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "warning" | "muted";
}) {
  return (
    <div className="card p-4">
      <div className="h-eyebrow">{label}</div>
      <div className="text-[28px] font-semibold tracking-tight">{value}</div>
      <div className="mt-2">
        <Chip tone={tone}>{tone === "positive" ? "Publishable" : tone === "warning" ? "Action needed" : "Awaiting input"}</Chip>
      </div>
    </div>
  );
}

function CheckCell({ ok }: { ok: boolean }) {
  return (
    <td>
      {ok ? <Chip tone="positive">✓</Chip> : <Chip tone="muted">—</Chip>}
    </td>
  );
}
