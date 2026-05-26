import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { Chip } from "@/components/Chip";
import { arr, isMapped } from "@/lib/agent";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const agents = await prisma.keyraAgentCatalog.findMany({
    orderBy: { created_at: "desc" },
  });
  const pendingApprovals = await prisma.approvalRequest.count({ where: { status: "Pending" } });

  const total = agents.length;
  const mapped = agents.filter(isMapped).length;
  const missingMapping = total - mapped;
  const subscriptionReady = agents.filter((a) => a.subscription_ready).length;
  const humanApproval = agents.filter((a) => a.human_approval_required).length;
  const regulated = agents.filter((a) => a.regulatory_classification !== "None").length;
  const knowledgePackRequired = agents.filter((a) => a.knowledge_pack_required).length;

  const byIndustry = countBy(agents.map((a) => a.agent_industry));
  const byFunction = countBy(agents.map((a) => a.agent_function));

  const countryTally = new Map<string, number>();
  for (const a of agents) {
    for (const c of arr(a.country_applicability)) {
      countryTally.set(c, (countryTally.get(c) ?? 0) + 1);
    }
  }
  const byCountry = Array.from(countryTally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <>
      <PageHeader
        eyebrow="Internal · Keyra Deployment Catalog"
        title="Dashboard"
        description="Operational health of the deployment catalog. This view inspects clean agent designs only. No tenant data is rendered here."
        actions={
          <>
            <Link href="/export-center" className="btn">Export to Ciright Core</Link>
            <Link href="/catalog" className="btn btn-primary">Browse Catalog</Link>
          </>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <Stat label="Total agents" value={total} caption="Designs in the deployment catalog." />
        <Stat
          label="Mapped to Ciright Core"
          value={mapped}
          caption={`${pct(mapped, total)} of catalog`}
          tone="positive"
        />
        <Stat
          label="Missing Ciright Core key"
          value={missingMapping}
          caption="Awaiting parent ID handshake."
          tone={missingMapping > 0 ? "warning" : "default"}
        />
        <Stat
          label="Ready for Keyra marketplace"
          value={subscriptionReady}
          caption="Approved + mapped + classified."
          tone="positive"
        />
        <Stat
          label="Pending approval"
          value={pendingApprovals}
          caption="Items in the approval queue."
          tone={pendingApprovals > 0 ? "warning" : "default"}
        />
        <Stat
          label="Human approval required"
          value={humanApproval}
          caption="HITL gates on operations."
        />
        <Stat
          label="Regulated deployment"
          value={regulated}
          caption="KYC, AML, GDPR, HIPAA, PSD2, Sovereign."
          tone="sovereign"
        />
        <Stat
          label="Knowledge pack required"
          value={knowledgePackRequired}
          caption="Cannot deploy without a pack attached."
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <BreakdownCard
          title="Agents by industry"
          rows={byIndustry}
          link="/industries"
        />
        <BreakdownCard
          title="Agents by function"
          rows={byFunction}
          link="/functions"
        />
      </section>

      <section className="card mt-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="h-section">Agents by country applicability</h2>
          <Link href="/countries" className="text-[12px] text-muted hover:text-black">
            View all →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {byCountry.length === 0 ? (
            <div className="text-[12px] text-muted">No country tags yet.</div>
          ) : (
            byCountry.map(([iso, count]) => (
              <Chip key={iso}>
                <span className="mono">{iso}</span>
                <span className="text-muted">· {count}</span>
              </Chip>
            ))
          )}
        </div>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="h-section mb-1">Catalog rule</h2>
        <p className="text-[13px] text-muted leading-relaxed max-w-[72ch]">
          This platform stores agent designs, classifications, deployment
          readiness, parent ID mapping, permission templates, and subscription
          packaging. It must never store customer transactions, SIM events,
          hospital birth records, banking activity, student applications, or
          tenant-private data.
        </p>
      </section>
    </>
  );
}

function countBy(values: string[]): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

function pct(n: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function BreakdownCard({
  title,
  rows,
  link,
}: {
  title: string;
  rows: Array<[string, number]>;
  link?: string;
}) {
  const max = rows.reduce((m, [, v]) => Math.max(m, v), 0) || 1;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="h-section">{title}</h2>
        {link ? (
          <Link href={link} className="text-[12px] text-muted hover:text-black">
            View all →
          </Link>
        ) : null}
      </div>
      <div className="space-y-2.5">
        {rows.length === 0 ? (
          <div className="text-[12px] text-muted">No data yet.</div>
        ) : (
          rows.map(([label, count]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-[180px] text-[12.5px] truncate">{label}</div>
              <div className="flex-1 h-1.5 bg-[color:var(--surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--text)]"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <div className="w-8 text-right text-[12px] tabular-nums">{count}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
