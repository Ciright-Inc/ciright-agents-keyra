/**
 * Seed for ciright.agents.keyra.ie
 *
 * Loads:
 *   - Industries, functions, agent types, countries
 *   - Knowledge packs and integrations
 *   - Initial agent families (Telecom, Government, Banking, University, Enterprise)
 *
 * Re-runnable. Uses upsert by slug.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const INDUSTRIES = [
  "Telecom",
  "Banking",
  "Government",
  "Healthcare",
  "University / Education",
  "Enterprise",
  "Legal",
  "Security",
  "Insurance",
  "Agriculture",
  "Environment",
  "Transportation",
  "Utilities",
  "Smart Cities",
];

const FUNCTIONS = [
  "Monitoring",
  "Activation",
  "Compliance",
  "Intelligence",
  "Data aggregation",
  "Fraud detection",
  "Reporting",
  "Workflow execution",
  "Identity verification",
  "Risk scoring",
  "Approval routing",
  "Document preparation",
  "Customer onboarding",
  "Operational alerting",
];

const AGENT_TYPES = [
  "Conversation Agent",
  "Transaction Agent",
  "Workflow Agent",
  "Monitoring Agent",
  "Data Agent",
  "Approval Agent",
  "Intelligence Agent",
  "Compliance Agent",
  "Sovereign Agent",
];

const COUNTRIES: { iso: string; name: string; region: string }[] = [
  { iso: "US", name: "United States", region: "Americas" },
  { iso: "CA", name: "Canada", region: "Americas" },
  { iso: "MX", name: "Mexico", region: "Americas" },
  { iso: "BR", name: "Brazil", region: "Americas" },
  { iso: "IE", name: "Ireland", region: "Europe" },
  { iso: "GB", name: "United Kingdom", region: "Europe" },
  { iso: "DE", name: "Germany", region: "Europe" },
  { iso: "FR", name: "France", region: "Europe" },
  { iso: "ES", name: "Spain", region: "Europe" },
  { iso: "AE", name: "United Arab Emirates", region: "MENA" },
  { iso: "SA", name: "Saudi Arabia", region: "MENA" },
  { iso: "QA", name: "Qatar", region: "MENA" },
  { iso: "IN", name: "India", region: "APAC" },
  { iso: "SG", name: "Singapore", region: "APAC" },
  { iso: "JP", name: "Japan", region: "APAC" },
  { iso: "AU", name: "Australia", region: "APAC" },
  { iso: "ZA", name: "South Africa", region: "Africa" },
  { iso: "NG", name: "Nigeria", region: "Africa" },
  { iso: "KE", name: "Kenya", region: "Africa" },
];

const KNOWLEDGE_PACKS = [
  { name: "Telecom Operations Baseline", scope: "industry", description: "SIM lifecycle, eSIM, port-out, roaming reference data." },
  { name: "Banking Compliance Baseline", scope: "industry", description: "KYC, AML, PSD2, transaction monitoring rules." },
  { name: "Government Civil Registry Baseline", scope: "industry", description: "Civil registration, vital statistics reference." },
  { name: "Higher Education Admissions Baseline", scope: "industry", description: "Admissions funnels, transcripts, applicant lifecycle." },
  { name: "Enterprise Revenue Operations Baseline", scope: "industry", description: "Pipeline, RFP, proposal, partner onboarding playbooks." },
  { name: "GDPR Reference Pack", scope: "regulatory", description: "EU data protection controls." },
  { name: "HIPAA Reference Pack", scope: "regulatory", description: "Healthcare privacy controls." },
  { name: "Universal Audit Pack", scope: "universal", description: "Cross-domain audit, traceability, evidence handling." },
];

const INTEGRATIONS = [
  { name: "Carrier HSS / HLR", category: "telecom", vendor: "Generic" },
  { name: "eSIM Provisioning Platform", category: "telecom", vendor: "Generic" },
  { name: "Roaming Clearing House", category: "telecom", vendor: "Generic" },
  { name: "Core Banking System", category: "banking", vendor: "Generic" },
  { name: "AML Sanctions Provider", category: "banking", vendor: "Generic" },
  { name: "KYC Identity Provider", category: "identity", vendor: "Generic" },
  { name: "Civil Registry Database", category: "gov", vendor: "Generic" },
  { name: "National Statistics Endpoint", category: "gov", vendor: "Generic" },
  { name: "Hospital HIS / EMR", category: "gov", vendor: "Generic" },
  { name: "Student Information System", category: "misc", vendor: "Generic" },
  { name: "Salesforce CRM", category: "crm", vendor: "Salesforce" },
  { name: "HubSpot CRM", category: "crm", vendor: "HubSpot" },
  { name: "DocuSign", category: "misc", vendor: "DocuSign" },
  { name: "SimSecure Identity", category: "identity", vendor: "Keyra / Ciright" },
];

// ---------------------------------------------------------------------------
// Agent families
// ---------------------------------------------------------------------------

type SeedAgent = {
  name: string;
  industry: string;
  function: string;
  type: string;
  category: string;
  description: string;
  capabilities: string[];
  inputs: string[];
  outputs: string[];
  permissions: string[];
  integrations: string[];
  knowledge_packs: string[];
  human_approval: boolean;
  knowledge_pack_required: boolean;
  security: "Public" | "Internal" | "Restricted" | "Sovereign";
  regulatory: "None" | "KYC" | "AML" | "GDPR" | "HIPAA" | "PSD2" | "Sovereign";
  countries: string[];
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const TELECOM_AGENTS: SeedAgent[] = [
  "SIM Activation Monitoring Agent",
  "SIM Swap Detection Agent",
  "eSIM Provisioning Agent",
  "Subscriber Identity Integrity Agent",
  "Roaming Usage Agent",
  "Network Usage Intelligence Agent",
  "Fraud Pattern Detection Agent",
  "Activation Funnel Agent",
  "Device Change Monitoring Agent",
  "Port-Out Risk Agent",
].map((name) => ({
  name,
  industry: "Telecom",
  function: name.includes("Fraud") ? "Fraud detection" : name.includes("Activation") ? "Activation" : name.includes("Identity") ? "Identity verification" : "Monitoring",
  type: name.includes("Provisioning") ? "Workflow Agent" : name.includes("Intelligence") ? "Intelligence Agent" : "Monitoring Agent",
  category: "Telecom Agents",
  description: `Operational ${name.toLowerCase()} blueprint. Subscriber-context aware. No customer data retained at design layer.`,
  capabilities: [
    "Real-time event ingestion",
    "Anomaly detection",
    "Operational alerting",
    "Audit-grade event trail",
  ],
  inputs: ["Subscriber events", "Device identifiers", "Network signaling metadata"],
  outputs: ["Alerts", "Operational reports", "Risk signals"],
  permissions: ["telecom.read.events", "telecom.alert.write"],
  integrations: ["Carrier HSS / HLR"],
  knowledge_packs: ["Telecom Operations Baseline"],
  human_approval: name.includes("Port-Out") || name.includes("Fraud") || name.includes("Swap"),
  knowledge_pack_required: true,
  security: "Restricted",
  regulatory: "GDPR",
  countries: ["ALL"],
}));

const GOVERNMENT_AGENTS: SeedAgent[] = [
  "Population Monitoring Agent",
  "Birth Reporting Agent",
  "Death Reporting Agent",
  "National Statistics Agent",
  "Hospital Reporting Agent",
  "Border Activity Agent",
  "Identity Verification Agent",
  "Census Sync Agent",
  "Regional Infrastructure Agent",
  "Public Service Utilization Agent",
].map((name) => ({
  name,
  industry: "Government",
  function: name.includes("Identity") ? "Identity verification" : name.includes("Statistics") || name.includes("Census") ? "Reporting" : "Data aggregation",
  type: name.includes("Identity") ? "Compliance Agent" : name.includes("Statistics") || name.includes("Census") || name.includes("Population") ? "Intelligence Agent" : "Data Agent",
  category: "Government Agents",
  description: `Sovereign-grade ${name.toLowerCase()} blueprint. Designed for ministry-level deployment with strict tenant isolation.`,
  capabilities: [
    "Hospital and registry feed ingestion",
    "National rollup statistics",
    "Sovereign audit logging",
    "Approval-gated publication",
  ],
  inputs: ["Hospital feeds", "Civil registry feeds", "Field reports"],
  outputs: ["Ministerial dashboards", "Statistical releases", "Audit packets"],
  permissions: ["gov.read.registry", "gov.write.statistics"],
  integrations: name.includes("Hospital") ? ["Hospital HIS / EMR"] : name.includes("Identity") ? ["Civil Registry Database"] : ["Civil Registry Database", "National Statistics Endpoint"],
  knowledge_packs: ["Government Civil Registry Baseline"],
  human_approval: true,
  knowledge_pack_required: true,
  security: "Sovereign",
  regulatory: "Sovereign",
  countries: ["ALL"],
}));

const BANKING_AGENTS: SeedAgent[] = [
  "Customer Onboarding Agent",
  "AML Monitoring Agent",
  "KYC Review Agent",
  "Account Risk Agent",
  "Transaction Anomaly Agent",
  "Regulatory Reporting Agent",
  "Fraud Case Preparation Agent",
  "Device Trust Agent",
  "Customer Identity Agent",
  "Compliance Review Agent",
].map((name) => ({
  name,
  industry: "Banking",
  function: name.includes("Onboarding") ? "Customer onboarding" : name.includes("AML") || name.includes("Compliance") || name.includes("Regulatory") ? "Compliance" : name.includes("Fraud") ? "Fraud detection" : name.includes("Risk") ? "Risk scoring" : name.includes("Identity") || name.includes("KYC") ? "Identity verification" : "Monitoring",
  type: name.includes("Onboarding") ? "Workflow Agent" : name.includes("Review") || name.includes("Compliance") ? "Approval Agent" : name.includes("Reporting") ? "Compliance Agent" : "Monitoring Agent",
  category: "Banking Agents",
  description: `Banking-grade ${name.toLowerCase()} blueprint. Prepares review packets and escalates to human compliance teams.`,
  capabilities: [
    "Risk signal aggregation",
    "Audit-ready case bundles",
    "Human-in-the-loop escalation",
    "Regulatory reporting templates",
  ],
  inputs: ["Account events", "KYC documents", "Transaction streams"],
  outputs: ["Risk scores", "Review packets", "Regulatory filings"],
  permissions: ["bank.read.accounts", "bank.write.cases"],
  integrations: name.includes("AML") ? ["AML Sanctions Provider", "Core Banking System"] : ["Core Banking System", "KYC Identity Provider"],
  knowledge_packs: ["Banking Compliance Baseline", "Universal Audit Pack"],
  human_approval: true,
  knowledge_pack_required: true,
  security: "Restricted",
  regulatory: name.includes("AML") ? "AML" : name.includes("KYC") ? "KYC" : "PSD2",
  countries: ["ALL"],
}));

const UNIVERSITY_AGENTS: SeedAgent[] = [
  "Student Application Monitoring Agent",
  "Admissions Funnel Agent",
  "Transcript Verification Agent",
  "Enrollment Activation Agent",
  "Provost Intelligence Agent",
  "Applicant Status Agent",
  "International Student Visa Agent",
  "Scholarship Review Agent",
  "Student Identity Agent",
  "Academic Integrity Agent",
].map((name) => ({
  name,
  industry: "University / Education",
  function: name.includes("Application") || name.includes("Funnel") || name.includes("Status") ? "Monitoring" : name.includes("Verification") || name.includes("Identity") || name.includes("Integrity") ? "Identity verification" : name.includes("Activation") ? "Activation" : name.includes("Provost") ? "Intelligence" : name.includes("Visa") || name.includes("Scholarship") ? "Approval routing" : "Reporting",
  type: name.includes("Provost") ? "Intelligence Agent" : name.includes("Activation") || name.includes("Funnel") ? "Workflow Agent" : name.includes("Verification") || name.includes("Review") ? "Approval Agent" : "Monitoring Agent",
  category: "University Agents",
  description: `Higher-education ${name.toLowerCase()} blueprint. Designed for provost / registrar visibility with student-data isolation.`,
  capabilities: [
    "Admissions funnel telemetry",
    "Transcript verification handshake",
    "Provost-grade dashboards",
    "Tenant-isolated student data boundaries",
  ],
  inputs: ["Application records", "Transcripts", "Visa records"],
  outputs: ["Funnel dashboards", "Verification reports", "Provost briefings"],
  permissions: ["edu.read.applicants", "edu.write.activation"],
  integrations: ["Student Information System"],
  knowledge_packs: ["Higher Education Admissions Baseline"],
  human_approval: name.includes("Visa") || name.includes("Scholarship") || name.includes("Integrity"),
  knowledge_pack_required: true,
  security: "Internal",
  regulatory: "GDPR",
  countries: ["ALL"],
}));

const ENTERPRISE_AGENTS: SeedAgent[] = [
  "CRM Lead Enrichment Agent",
  "Proposal Preparation Agent",
  "RFP Response Agent",
  "Meeting Prep Agent",
  "Follow-Up Agent",
  "Sales Pipeline Agent",
  "Partner Onboarding Agent",
  "Developer Onboarding Agent",
  "Contract Review Prep Agent",
  "Executive Briefing Agent",
].map((name) => ({
  name,
  industry: "Enterprise",
  function: name.includes("Onboarding") ? "Customer onboarding" : name.includes("Contract") ? "Document preparation" : name.includes("Proposal") || name.includes("RFP") || name.includes("Meeting") || name.includes("Briefing") ? "Document preparation" : name.includes("Pipeline") ? "Intelligence" : "Workflow execution",
  type: name.includes("Briefing") || name.includes("Pipeline") ? "Intelligence Agent" : name.includes("Onboarding") || name.includes("Follow") ? "Workflow Agent" : "Workflow Agent",
  category: "Enterprise Agents",
  description: `Revenue-operations ${name.toLowerCase()} blueprint. Designed to prepare, draft, and stage commercial workflows for human approval.`,
  capabilities: [
    "Pipeline enrichment",
    "Document drafting templates",
    "Approval routing",
    "Audit trail of every action",
  ],
  inputs: ["CRM records", "Email signals", "Calendar context"],
  outputs: ["Draft documents", "Briefings", "Action lists"],
  permissions: ["crm.read", "crm.write.draft"],
  integrations: ["Salesforce CRM", "HubSpot CRM"],
  knowledge_packs: ["Enterprise Revenue Operations Baseline"],
  human_approval: name.includes("Contract") || name.includes("Briefing"),
  knowledge_pack_required: false,
  security: "Internal",
  regulatory: "None",
  countries: ["ALL"],
}));

const ALL_AGENTS: SeedAgent[] = [
  ...TELECOM_AGENTS,
  ...GOVERNMENT_AGENTS,
  ...BANKING_AGENTS,
  ...UNIVERSITY_AGENTS,
  ...ENTERPRISE_AGENTS,
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function main() {
  console.log("• Seeding industries");
  for (let i = 0; i < INDUSTRIES.length; i++) {
    const name = INDUSTRIES[i];
    await prisma.industry.upsert({
      where: { slug: slug(name) },
      update: { name, sort_order: i },
      create: { name, slug: slug(name), sort_order: i },
    });
  }

  console.log("• Seeding agent functions");
  for (const name of FUNCTIONS) {
    await prisma.agentFunction.upsert({
      where: { slug: slug(name) },
      update: { name },
      create: { name, slug: slug(name) },
    });
  }

  console.log("• Seeding agent types");
  for (const name of AGENT_TYPES) {
    await prisma.agentType.upsert({
      where: { slug: slug(name) },
      update: { name },
      create: { name, slug: slug(name) },
    });
  }

  console.log("• Seeding countries");
  for (const c of COUNTRIES) {
    await prisma.country.upsert({
      where: { iso_code: c.iso },
      update: { name: c.name, region: c.region },
      create: { iso_code: c.iso, name: c.name, region: c.region },
    });
  }

  console.log("• Seeding knowledge packs");
  for (const pack of KNOWLEDGE_PACKS) {
    await prisma.knowledgePack.upsert({
      where: { slug: slug(pack.name) },
      update: { name: pack.name, scope: pack.scope, description: pack.description },
      create: { name: pack.name, slug: slug(pack.name), scope: pack.scope, description: pack.description },
    });
  }

  console.log("• Seeding integrations");
  for (const integ of INTEGRATIONS) {
    await prisma.integration.upsert({
      where: { slug: slug(integ.name) },
      update: { name: integ.name, category: integ.category, vendor: integ.vendor },
      create: { name: integ.name, slug: slug(integ.name), category: integ.category, vendor: integ.vendor },
    });
  }

  console.log(`• Seeding ${ALL_AGENTS.length} agent blueprints`);
  for (const a of ALL_AGENTS) {
    const agentSlug = slug(a.name);
    const agent = await prisma.keyraAgentCatalog.upsert({
      where: { agent_slug: agentSlug },
      update: {
        agent_name: a.name,
        agent_category: a.category,
        agent_industry: a.industry,
        agent_function: a.function,
        agent_type: a.type,
        agent_description: a.description,
        agent_capabilities: JSON.stringify(a.capabilities),
        required_inputs: JSON.stringify(a.inputs),
        expected_outputs: JSON.stringify(a.outputs),
        required_permissions: JSON.stringify(a.permissions),
        required_integrations: JSON.stringify(a.integrations),
        knowledge_pack_required: a.knowledge_pack_required,
        human_approval_required: a.human_approval,
        security_classification: a.security,
        regulatory_classification: a.regulatory,
        country_applicability: JSON.stringify(a.countries),
      },
      create: {
        agent_name: a.name,
        agent_slug: agentSlug,
        agent_category: a.category,
        agent_industry: a.industry,
        agent_function: a.function,
        agent_type: a.type,
        agent_description: a.description,
        agent_capabilities: JSON.stringify(a.capabilities),
        required_inputs: JSON.stringify(a.inputs),
        expected_outputs: JSON.stringify(a.outputs),
        required_permissions: JSON.stringify(a.permissions),
        required_integrations: JSON.stringify(a.integrations),
        knowledge_pack_required: a.knowledge_pack_required,
        human_approval_required: a.human_approval,
        security_classification: a.security,
        regulatory_classification: a.regulatory,
        country_applicability: JSON.stringify(a.countries),
        version: "0.1.0",
        deployment_status: "Draft",
        subscription_ready: false,
      },
    });

    // Bind knowledge packs
    for (const packName of a.knowledge_packs) {
      const pack = await prisma.knowledgePack.findUnique({ where: { slug: slug(packName) } });
      if (pack) {
        await prisma.knowledgePackBinding.upsert({
          where: { agent_id_pack_id: { agent_id: agent.keyra_agent_id, pack_id: pack.id } },
          update: {},
          create: { agent_id: agent.keyra_agent_id, pack_id: pack.id, required: true },
        });
      }
    }

    // Bind integrations
    for (const integName of a.integrations) {
      const integ = await prisma.integration.findUnique({ where: { slug: slug(integName) } });
      if (integ) {
        await prisma.integrationBinding.upsert({
          where: { agent_id_integration_id: { agent_id: agent.keyra_agent_id, integration_id: integ.id } },
          update: {},
          create: { agent_id: agent.keyra_agent_id, integration_id: integ.id, required: true },
        });
      }
    }
  }

  console.log("• Seeding admin operators");
  await prisma.adminUser.upsert({
    where: { email: "ops@keyra.ie" },
    update: {},
    create: { email: "ops@keyra.ie", name: "Keyra Operations", role: "admin" },
  });
  await prisma.adminUser.upsert({
    where: { email: "review@keyra.ie" },
    update: {},
    create: { email: "review@keyra.ie", name: "Keyra Review", role: "reviewer" },
  });
  await prisma.adminUser.upsert({
    where: { email: "sovereign@keyra.ie" },
    update: {},
    create: { email: "sovereign@keyra.ie", name: "Sovereign Admin", role: "sovereign-admin" },
  });

  console.log("• Seeding initial audit event");
  await prisma.auditEvent.create({
    data: {
      actor: "ciright.system",
      event_type: "catalog.seed",
      detail: `Seeded ${ALL_AGENTS.length} agent blueprints across 5 initial families.`,
    },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
