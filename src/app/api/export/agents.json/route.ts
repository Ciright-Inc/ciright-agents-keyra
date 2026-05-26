import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { arr } from "@/lib/agent";

export async function GET() {
  const agents = await prisma.keyraAgentCatalog.findMany({
    orderBy: [{ agent_industry: "asc" }, { agent_name: "asc" }],
  });

  const payload = agents.map((a) => ({
    keyra_agent_id: a.keyra_agent_id,
    ciright_parent_agent_id: a.ciright_parent_agent_id,
    ciright_core_key: a.ciright_core_key,
    agent_name: a.agent_name,
    agent_slug: a.agent_slug,
    agent_category: a.agent_category,
    agent_industry: a.agent_industry,
    agent_function: a.agent_function,
    agent_type: a.agent_type,
    agent_description: a.agent_description,
    agent_capabilities: arr(a.agent_capabilities),
    required_inputs: arr(a.required_inputs),
    expected_outputs: arr(a.expected_outputs),
    required_permissions: arr(a.required_permissions),
    required_integrations: arr(a.required_integrations),
    country_applicability: arr(a.country_applicability),
    knowledge_pack_required: a.knowledge_pack_required,
    human_approval_required: a.human_approval_required,
    security_classification: a.security_classification,
    regulatory_classification: a.regulatory_classification,
    deployment_status: a.deployment_status,
    subscription_ready: a.subscription_ready,
    version: a.version,
    created_at: a.created_at,
    updated_at: a.updated_at,
  }));

  return NextResponse.json(payload);
}
