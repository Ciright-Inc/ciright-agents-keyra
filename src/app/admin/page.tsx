import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [admins, agents, exports, audits] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: { created_at: "asc" } }),
    prisma.keyraAgentCatalog.count(),
    prisma.exportRecord.count(),
    prisma.auditEvent.count(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Admin"
        description="Operators with access to the deployment catalog. Roles map to capability scopes inside the platform. Sovereign admins gate ministry-level deployments."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Agents" value={agents} />
        <Stat label="Admins" value={admins.length} />
        <Stat label="Exports" value={exports} />
        <Stat label="Audit events" value={audits} />
      </div>

      <div className="table-wrap">
        <table className="k-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.name}</td>
                <td className="mono text-[12px]">{a.email}</td>
                <td>
                  <Chip tone={a.role === "sovereign-admin" ? "sovereign" : "muted"}>{a.role}</Chip>
                </td>
                <td className="mono text-[12px] text-muted">
                  {new Date(a.created_at).toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5 mt-6">
        <h2 className="h-section mb-2">Catalog rule</h2>
        <p className="text-[13px] text-muted leading-relaxed max-w-[72ch]">
          This platform exists exclusively for trusted agent infrastructure
          control. No tenant transactional data is ever stored or rendered
          here. Customer data and operational experience live inside the
          tenant agent world.
        </p>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="h-eyebrow">{label}</div>
      <div className="text-[24px] font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
