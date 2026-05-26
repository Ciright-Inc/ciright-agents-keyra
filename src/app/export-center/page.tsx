import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Chip } from "@/components/Chip";
import { exportAll, markBatchMapped } from "./actions";

export const dynamic = "force-dynamic";

export default async function ExportCenterPage() {
  const exports = await prisma.exportRecord.findMany({
    orderBy: { exported_at: "desc" },
  });

  const batches = new Map<string, typeof exports>();
  for (const e of exports) {
    if (!batches.has(e.export_batch)) batches.set(e.export_batch, []);
    batches.get(e.export_batch)!.push(e);
  }

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Export Center"
        description="Export catalog manifests to the Ciright Core mapping team. Each batch is recorded and can be reconciled back to a mapped state."
      />

      <section className="card p-5 mb-6">
        <h2 className="h-section mb-3">Create new export batch</h2>
        <p className="text-[13px] text-muted mb-3">
          Every batch contains all agents in the catalog at the moment of export, ready for the Ciright Core team to assign parent IDs and core keys.
        </p>
        <form action={exportAll} className="flex items-end gap-2 flex-wrap">
          <div className="w-48">
            <label className="h-eyebrow block mb-1">Format</label>
            <select className="select" name="format" defaultValue="CSV">
              <option>CSV</option>
              <option>JSON</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Create batch</button>
          <a className="btn" href="/api/export/agents.csv" download>Download CSV manifest</a>
          <a className="btn" href="/api/export/agents.json" download>Download JSON manifest</a>
        </form>
      </section>

      <section>
        <h2 className="h-section mb-3">Batches</h2>
        <div className="space-y-3">
          {batches.size === 0 ? (
            <div className="card p-5 text-[13px] text-muted">No batches yet.</div>
          ) : (
            Array.from(batches.entries()).map(([batch, rows]) => {
              const mapped = rows.filter((r) => r.mapped).length;
              const total = rows.length;
              return (
                <div key={batch} className="card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium mono text-[13px]">{batch}</div>
                      <div className="text-[12px] text-muted">
                        {total} agents · format {rows[0]?.export_format} · {new Date(rows[0]?.exported_at ?? Date.now()).toISOString().slice(0, 16).replace("T", " ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip tone={mapped === total ? "positive" : "warning"}>
                        {mapped}/{total} mapped
                      </Chip>
                      {mapped < total ? (
                        <form action={markBatchMapped}>
                          <input type="hidden" name="batch" value={batch} />
                          <button className="btn" type="submit">Mark batch mapped</button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
