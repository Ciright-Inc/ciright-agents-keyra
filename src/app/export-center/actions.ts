"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function exportAll(formData: FormData) {
  const format = String(formData.get("format") ?? "CSV");
  const batch = `EXP-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12)}`;

  const agents = await prisma.keyraAgentCatalog.findMany();
  for (const a of agents) {
    await prisma.exportRecord.create({
      data: {
        agent_id: a.keyra_agent_id,
        export_batch: batch,
        export_format: format,
        exported_by: "ops@keyra.ie",
      },
    });
  }
  await prisma.auditEvent.create({
    data: {
      actor: "ops@keyra.ie",
      event_type: "export.batch.created",
      detail: `Batch ${batch} · ${agents.length} agents · format ${format}`,
    },
  });

  revalidatePath("/export-center");
  revalidatePath("/audit-logs");
}

export async function markBatchMapped(formData: FormData) {
  const batch = String(formData.get("batch") ?? "");
  if (!batch) throw new Error("Missing batch id");

  await prisma.exportRecord.updateMany({
    where: { export_batch: batch, mapped: false },
    data: { mapped: true, mapped_at: new Date() },
  });
  await prisma.auditEvent.create({
    data: {
      actor: "ciright.core",
      event_type: "export.batch.mapped",
      detail: `Batch ${batch} marked as mapped by Ciright Core handshake.`,
    },
  });

  revalidatePath("/export-center");
  revalidatePath("/audit-logs");
}
