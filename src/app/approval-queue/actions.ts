"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function requestApproval(formData: FormData) {
  const agentId = String(formData.get("agentId") ?? "");
  if (!agentId) throw new Error("Missing agent id");

  await prisma.approvalRequest.create({
    data: {
      agent_id: agentId,
      requested_by: "ops@keyra.ie",
      reason: "Promote design to In Review for marketplace publication.",
      status: "Pending",
    },
  });
  await prisma.keyraAgentCatalog.update({
    where: { keyra_agent_id: agentId },
    data: { deployment_status: "In Review" },
  });
  await prisma.auditEvent.create({
    data: {
      agent_id: agentId,
      actor: "ops@keyra.ie",
      event_type: "approval.requested",
    },
  });

  revalidatePath("/approval-queue");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function decideApproval(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!requestId || !["Approved", "Rejected"].includes(decision)) {
    throw new Error("Invalid decision");
  }

  const request = await prisma.approvalRequest.update({
    where: { id: requestId },
    data: {
      status: decision,
      decided_by: "review@keyra.ie",
      decided_at: new Date(),
    },
  });

  if (decision === "Approved") {
    await prisma.keyraAgentCatalog.update({
      where: { keyra_agent_id: request.agent_id },
      data: {
        deployment_status: "Approved",
        approved_by: "review@keyra.ie",
        subscription_ready: true,
      },
    });
  } else {
    await prisma.keyraAgentCatalog.update({
      where: { keyra_agent_id: request.agent_id },
      data: { deployment_status: "Draft", subscription_ready: false },
    });
  }

  await prisma.auditEvent.create({
    data: {
      agent_id: request.agent_id,
      actor: "review@keyra.ie",
      event_type: `approval.${decision.toLowerCase()}`,
    },
  });

  revalidatePath("/approval-queue");
  revalidatePath("/catalog");
  revalidatePath("/");
}
