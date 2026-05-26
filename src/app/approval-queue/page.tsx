import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";
import { decideApproval, requestApproval } from "./actions";

export const dynamic = "force-dynamic";

export default async function ApprovalQueuePage() {
  const [requests, draftAgents] = await Promise.all([
    prisma.approvalRequest.findMany({
      orderBy: [{ status: "asc" }, { created_at: "desc" }],
      include: { agent: true },
    }),
    prisma.keyraAgentCatalog.findMany({
      where: { deployment_status: "Draft" },
      orderBy: { agent_name: "asc" },
      take: 20,
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Approval Queue"
        description="Approval is required before an agent can be published to the marketplace. Each decision creates an audit event."
      />

      <section className="mb-6">
        <h2 className="h-section mb-3">Pending</h2>
        <div className="space-y-2">
          {requests.filter((r) => r.status === "Pending").length === 0 ? (
            <div className="card p-5 text-[13px] text-muted">No pending approval requests.</div>
          ) : (
            requests
              .filter((r) => r.status === "Pending")
              .map((r) => (
                <div key={r.id} className="card p-4 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 md:col-span-5">
                    <Link href={`/catalog/${r.agent.agent_slug}`} className="font-medium hover:underline">
                      {r.agent.agent_name}
                    </Link>
                    <div className="text-[11px] text-muted">{r.agent.agent_industry} · {r.agent.agent_function}</div>
                    {r.reason ? <div className="text-[12px] text-muted mt-1">{r.reason}</div> : null}
                  </div>
                  <div className="col-span-6 md:col-span-3 text-[12px]">
                    Requested by <span className="mono">{r.requested_by}</span>
                  </div>
                  <div className="col-span-6 md:col-span-2 text-[12px] text-muted mono">
                    {new Date(r.created_at).toISOString().slice(0, 10)}
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                    <form action={decideApproval}>
                      <input type="hidden" name="requestId" value={r.id} />
                      <input type="hidden" name="decision" value="Approved" />
                      <button className="btn btn-primary" type="submit">Approve</button>
                    </form>
                    <form action={decideApproval}>
                      <input type="hidden" name="requestId" value={r.id} />
                      <input type="hidden" name="decision" value="Rejected" />
                      <button className="btn" type="submit">Reject</button>
                    </form>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="h-section mb-3">Decided</h2>
        <div className="table-wrap">
          <table className="k-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Decision</th>
                <th>Decided by</th>
                <th>Decided at</th>
              </tr>
            </thead>
            <tbody>
              {requests.filter((r) => r.status !== "Pending").length === 0 ? (
                <tr><td colSpan={4} className="text-muted">No decisions yet.</td></tr>
              ) : (
                requests
                  .filter((r) => r.status !== "Pending")
                  .map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/catalog/${r.agent.agent_slug}`} className="hover:underline">
                          {r.agent.agent_name}
                        </Link>
                      </td>
                      <td>
                        <Chip tone={r.status === "Approved" ? "positive" : "critical"}>
                          {r.status}
                        </Chip>
                      </td>
                      <td className="mono text-[12px]">{r.decided_by ?? "—"}</td>
                      <td className="mono text-[12px] text-muted">
                        {r.decided_at ? new Date(r.decided_at).toISOString().slice(0, 16).replace("T", " ") : "—"}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="h-section mb-3">Draft agents — request approval</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {draftAgents.map((a) => (
            <div key={a.keyra_agent_id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/catalog/${a.agent_slug}`} className="font-medium hover:underline text-[13.5px]">
                    {a.agent_name}
                  </Link>
                  <div className="text-[11px] text-muted">{a.agent_industry}</div>
                </div>
                <Chip tone="muted">Draft</Chip>
              </div>
              <form action={requestApproval} className="mt-3">
                <input type="hidden" name="agentId" value={a.keyra_agent_id} />
                <button className="btn w-full justify-center" type="submit">Request approval</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
