import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const events = await prisma.auditEvent.findMany({
    orderBy: { created_at: "desc" },
    take: 250,
    include: { agent: true },
  });

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Audit Logs"
        description="Append-only record of every catalog operation. Mapping, approvals, exports, and admin actions are all recorded for sovereign reviewability."
      />

      <div className="table-wrap">
        <table className="k-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Event</th>
              <th>Agent</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={5} className="text-muted">No audit events yet.</td></tr>
            ) : (
              events.map((e) => (
                <tr key={e.id}>
                  <td className="mono text-[12px] text-muted whitespace-nowrap">
                    {new Date(e.created_at).toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="mono text-[12px]">{e.actor}</td>
                  <td>
                    <Chip tone={chipForEvent(e.event_type)}>{e.event_type}</Chip>
                  </td>
                  <td>{e.agent?.agent_name ?? <span className="text-muted">—</span>}</td>
                  <td className="text-muted text-[12px]">{e.detail ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function chipForEvent(t: string): "positive" | "warning" | "critical" | "muted" {
  if (t.includes("approved")) return "positive";
  if (t.includes("rejected")) return "critical";
  if (t.includes("mapping") || t.includes("export") || t.includes("requested")) return "warning";
  return "muted";
}
