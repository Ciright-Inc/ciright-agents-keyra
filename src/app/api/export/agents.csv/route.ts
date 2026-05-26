import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COLS = [
  "keyra_agent_id",
  "ciright_parent_agent_id",
  "ciright_core_key",
  "agent_name",
  "agent_slug",
  "agent_category",
  "agent_industry",
  "agent_function",
  "agent_type",
  "agent_description",
  "knowledge_pack_required",
  "human_approval_required",
  "security_classification",
  "regulatory_classification",
  "deployment_status",
  "subscription_ready",
  "version",
];

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function GET() {
  const agents = await prisma.keyraAgentCatalog.findMany({
    orderBy: [{ agent_industry: "asc" }, { agent_name: "asc" }],
  });

  const lines: string[] = [];
  lines.push(COLS.join(","));
  for (const a of agents) {
    const row = COLS.map((c) => {
      // @ts-expect-error indexed access on Prisma row
      return csvCell(a[c]);
    });
    lines.push(row.join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=keyra_agent_catalog.csv",
    },
  });
}
