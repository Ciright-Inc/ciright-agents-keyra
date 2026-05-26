"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function applyMapping(formData: FormData) {
  const agentId = String(formData.get("agentId") ?? "");
  const parentId = String(formData.get("parentId") ?? "").trim();
  const coreKey = String(formData.get("coreKey") ?? "").trim();

  if (!agentId) throw new Error("Missing agent id");
  if (!parentId || !coreKey) throw new Error("Both parent ID and core key are required");

  await prisma.keyraAgentCatalog.update({
    where: { keyra_agent_id: agentId },
    data: {
      ciright_parent_agent_id: parentId,
      ciright_core_key: coreKey,
    },
  });

  await prisma.auditEvent.create({
    data: {
      agent_id: agentId,
      actor: "id-mapping.operator",
      event_type: "mapping.applied",
      detail: `Mapped to parent ${parentId} / core ${coreKey}`,
    },
  });

  revalidatePath("/id-mapping");
  revalidatePath("/");
  revalidatePath("/catalog");
}

export async function clearMapping(formData: FormData) {
  const agentId = String(formData.get("agentId") ?? "");
  if (!agentId) throw new Error("Missing agent id");

  await prisma.keyraAgentCatalog.update({
    where: { keyra_agent_id: agentId },
    data: { ciright_parent_agent_id: null, ciright_core_key: null, subscription_ready: false },
  });

  await prisma.auditEvent.create({
    data: {
      agent_id: agentId,
      actor: "id-mapping.operator",
      event_type: "mapping.cleared",
      detail: "Mapping cleared. Re-mapping required before subscription readiness.",
    },
  });

  revalidatePath("/id-mapping");
}
