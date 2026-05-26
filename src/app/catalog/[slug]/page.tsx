import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";
import { arr, isMapped, securityChipClass, statusChipClass } from "@/lib/agent";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const agent = await prisma.keyraAgentCatalog.findUnique({
    where: { agent_slug: slug },
    include: {
      knowledge_packs: { include: { pack: true } },
      integrations: { include: { integration: true } },
      approvals: { orderBy: { created_at: "desc" } },
      audit_events: { orderBy: { created_at: "desc" }, take: 25 },
      exports: { orderBy: { exported_at: "desc" }, take: 10 },
    },
  });

  if (!agent) notFound();

  const capabilities = arr(agent.agent_capabilities);
  const inputs = arr(agent.required_inputs);
  const outputs = arr(agent.expected_outputs);
  const permissions = arr(agent.required_permissions);
  const integrations = arr(agent.required_integrations);
  const countries = arr(agent.country_applicability);
  const mapped = isMapped(agent);

  const checklist = [
    { label: "Mapped to Ciright Core", done: mapped },
    {
      label: "Knowledge pack attached",
      done: !agent.knowledge_pack_required || agent.knowledge_packs.length > 0,
    },
    { label: "Required integrations registered", done: integrations.length > 0 },
    { label: "Required permissions defined", done: permissions.length > 0 },
    {
      label: "Approval applied",
      done: agent.approved_by !== null && agent.deployment_status !== "Draft",
    },
    {
      label: "Subscription readiness",
      done: agent.subscription_ready,
    },
  ];
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Agent · Deployment Catalog"
        title={agent.agent_name}
        description={agent.agent_description}
        actions={
          <>
            <Link href="/catalog" className="btn">← Back</Link>
            <Link href="/export-center" className="btn">Export</Link>
            <Link href="/approval-queue" className="btn btn-primary">Request Approval</Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Field label="Keyra Agent ID" value={<span className="mono break-all">{agent.keyra_agent_id}</span>} />
        <Field
          label="Ciright Parent Agent ID"
          value={
            agent.ciright_parent_agent_id ? (
              <span className="mono break-all">{agent.ciright_parent_agent_id}</span>
            ) : (
              <Chip tone="warning">Awaiting mapping</Chip>
            )
          }
        />
        <Field
          label="Ciright Core Key"
          value={
            agent.ciright_core_key ? (
              <span className="mono break-all">{agent.ciright_core_key}</span>
            ) : (
              <Chip tone="warning">Awaiting mapping</Chip>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="h-section mb-3">Classification</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-[13px]">
              <Meta label="Industry" value={agent.agent_industry} />
              <Meta label="Function" value={agent.agent_function} />
              <Meta label="Agent Type" value={agent.agent_type} />
              <Meta label="Category" value={agent.agent_category} />
              <Meta
                label="Security"
                value={
                  <span className={securityChipClass(agent.security_classification)}>
                    {agent.security_classification}
                  </span>
                }
              />
              <Meta
                label="Regulatory"
                value={<Chip tone="sovereign">{agent.regulatory_classification}</Chip>}
              />
              <Meta
                label="Deployment status"
                value={
                  <span className={statusChipClass(agent.deployment_status)}>
                    {agent.deployment_status}
                  </span>
                }
              />
              <Meta
                label="Subscription ready"
                value={
                  <Chip tone={agent.subscription_ready ? "positive" : "muted"}>
                    {agent.subscription_ready ? "Yes" : "Not yet"}
                  </Chip>
                }
              />
              <Meta label="Version" value={<span className="mono">{agent.version}</span>} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Capabilities</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 text-[13px]">
              {capabilities.length === 0 ? (
                <li className="text-muted">No capabilities defined.</li>
              ) : (
                capabilities.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="chip-dot" style={{ background: "#0e0e10" }} />
                    {c}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListCard title="Required data sources" items={inputs} />
            <ListCard title="Expected outputs" items={outputs} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListCard title="Required integrations" items={integrations} />
            <ListCard title="Permission model" items={permissions} mono />
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Country applicability</h2>
            <div className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <Chip key={c} tone="muted">
                  <span className="mono">{c}</span>
                </Chip>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Knowledge pack requirements</h2>
            <div className="text-[12px] text-muted mb-3">
              {agent.knowledge_pack_required
                ? "Knowledge pack is required for deployment."
                : "Optional. Pack may be attached by tenant."}
            </div>
            <div className="space-y-2">
              {agent.knowledge_packs.length === 0 ? (
                <div className="text-[12px] text-muted">No packs bound yet.</div>
              ) : (
                agent.knowledge_packs.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between border border-[color:var(--border)] rounded-md px-3 py-2 text-[13px]"
                  >
                    <div>
                      <div className="font-medium">{b.pack.name}</div>
                      <div className="text-[11px] text-muted">{b.pack.scope} · {b.pack.classification}</div>
                    </div>
                    <Chip tone={b.required ? "warning" : "muted"}>
                      {b.required ? "Required" : "Optional"}
                    </Chip>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Compliance notes</h2>
            <ul className="text-[13px] space-y-2 text-muted">
              <li>· Permission boundary enforced at deploy time per tenant.</li>
              <li>· No customer transactional data persists in this catalog.</li>
              <li>· Audit events are recorded for every catalog operation.</li>
              {agent.human_approval_required ? (
                <li>· Human-in-the-loop required for material agent actions.</li>
              ) : null}
              {agent.security_classification === "Sovereign" ? (
                <li>· Sovereign deployment — requires ministry-level approval and tenant isolation.</li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="h-section mb-3">Deployment checklist</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-1.5 bg-[color:var(--surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--text)]"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <div className="text-[12px] tabular-nums">{completion}%</div>
            </div>
            <ul className="space-y-1.5 text-[13px]">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  <span
                    className="chip-dot"
                    style={{ background: c.done ? "#0a7a3a" : "#b6b6c0" }}
                  />
                  <span className={c.done ? "" : "text-muted"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Permission model</h2>
            <div className="text-[12px] text-muted mb-2">
              {agent.human_approval_required
                ? "Human approval required before any material change."
                : "Autonomous within scope, audited."}
            </div>
            <div className="space-y-1 mono text-[12px]">
              {permissions.length === 0 ? (
                <span className="text-muted">No permissions registered.</span>
              ) : (
                permissions.map((p) => (
                  <div key={p}>{p}</div>
                ))
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Version history</h2>
            <div className="space-y-1.5 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="mono">{agent.version}</span>
                <span className="text-muted">
                  {new Date(agent.updated_at).toISOString().slice(0, 10)}
                </span>
              </div>
              <div className="text-muted">Created by {agent.created_by}</div>
              {agent.approved_by ? (
                <div className="text-muted">Approved by {agent.approved_by}</div>
              ) : null}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Export status</h2>
            {agent.exports.length === 0 ? (
              <div className="text-[12px] text-muted">No exports recorded.</div>
            ) : (
              <ul className="space-y-1.5 text-[12.5px]">
                {agent.exports.map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span className="mono">{e.export_batch}</span>
                    <Chip tone={e.mapped ? "positive" : "warning"}>
                      {e.mapped ? "Mapped" : "Awaiting"}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="h-section mb-3">Audit trail</h2>
            {agent.audit_events.length === 0 ? (
              <div className="text-[12px] text-muted">No events yet.</div>
            ) : (
              <ul className="space-y-2 text-[12px]">
                {agent.audit_events.map((e) => (
                  <li key={e.id}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{e.event_type}</span>
                      <span className="text-muted mono">
                        {new Date(e.created_at).toISOString().slice(0, 10)}
                      </span>
                    </div>
                    <div className="text-muted">{e.actor}</div>
                    {e.detail ? <div className="text-muted">{e.detail}</div> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="h-eyebrow mb-1">{label}</div>
      <div className="text-[13px]">{value}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="h-eyebrow mb-1">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function ListCard({ title, items, mono = false }: { title: string; items: string[]; mono?: boolean }) {
  return (
    <div className="card p-5">
      <h3 className="h-section mb-2">{title}</h3>
      {items.length === 0 ? (
        <div className="text-[12px] text-muted">None defined.</div>
      ) : (
        <ul className={`space-y-1 text-[13px] ${mono ? "mono" : ""}`}>
          {items.map((i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted">·</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
