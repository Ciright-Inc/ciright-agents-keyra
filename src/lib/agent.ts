/**
 * Helpers for the keyra_agent_catalog model.
 * Centralizes JSON parsing of array fields and chip rendering rules.
 */

export type AgentRow = {
  keyra_agent_id: string;
  ciright_parent_agent_id: string | null;
  ciright_core_key: string | null;
  agent_name: string;
  agent_slug: string;
  agent_category: string;
  agent_industry: string;
  agent_function: string;
  agent_type: string;
  agent_description: string;
  agent_capabilities: string;
  required_inputs: string;
  expected_outputs: string;
  required_permissions: string;
  required_integrations: string;
  knowledge_pack_required: boolean;
  human_approval_required: boolean;
  security_classification: string;
  regulatory_classification: string;
  deployment_status: string;
  subscription_ready: boolean;
  version: string;
  created_by: string;
  approved_by: string | null;
  created_at: Date;
  updated_at: Date;
  country_applicability: string;
};

export function arr(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function isMapped(a: Pick<AgentRow, "ciright_parent_agent_id" | "ciright_core_key">): boolean {
  return Boolean(a.ciright_parent_agent_id && a.ciright_core_key);
}

export function statusChipClass(status: string): string {
  switch (status) {
    case "Approved":
    case "Published":
      return "chip chip-positive";
    case "In Review":
      return "chip chip-warning";
    case "Retired":
      return "chip chip-critical";
    default:
      return "chip chip-muted";
  }
}

export function securityChipClass(sec: string): string {
  switch (sec) {
    case "Sovereign":
      return "chip chip-sovereign";
    case "Restricted":
      return "chip chip-warning";
    case "Public":
      return "chip chip-positive";
    default:
      return "chip chip-muted";
  }
}
