#!/usr/bin/env node
/**
 * Idempotent Postgres bootstrap: dedicated schema + prisma db push + seed.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

function loadEnvFile() {
  if (process.env.DATABASE_URL?.trim()) return;
  const path = join(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

export const APP_SCHEMA = "ciright_agents_keyra";
const VERIFY_TABLE = "KeyraAgentCatalog";

export function rewriteSchema(url, schema) {
  if (url.includes("schema=")) {
    return url.replace(/([?&])schema=[^&]*/, `$1schema=${schema}`);
  }
  return url + (url.includes("?") ? "&" : "?") + `schema=${schema}`;
}

export function ensureSsl(url) {
  if (url.includes("sslmode=")) return url;
  const onRailway =
    url.includes("railway") ||
    url.includes("rlwy.net") ||
    process.env.RAILWAY_ENVIRONMENT === "production" ||
    process.env.RAILWAY_ENVIRONMENT === "true";
  if (!onRailway) return url;
  return url + (url.includes("?") ? "&" : "?") + "sslmode=require";
}

export function pgConnectionUrl(url) {
  let out = url.replace(/([?&])schema=[^&]*/g, "");
  out = out.replace(/\?&/, "?").replace(/\?$/, "");
  return out;
}

function run(cmd, args, env) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", env });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}

async function ensureSchema(connUrl, schema) {
  const client = new Client({ connectionString: pgConnectionUrl(connUrl) });
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
    console.log(`[bootstrap-db] ensured schema "${schema}" exists`);
  } finally {
    await client.end().catch(() => {});
  }
}

async function tableExists(connUrl, schema, table) {
  const client = new Client({ connectionString: pgConnectionUrl(connUrl) });
  await client.connect();
  try {
    const res = await client.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = $2 LIMIT 1`,
      [schema, table],
    );
    return (res.rowCount ?? 0) > 0;
  } finally {
    await client.end().catch(() => {});
  }
}

export async function bootstrapDatabase() {
  loadEnvFile();
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    console.log("[bootstrap-db] DATABASE_URL not set — skipping");
    return false;
  }

  const scopedUrl = ensureSsl(rewriteSchema(raw, APP_SCHEMA));
  process.env.DATABASE_URL = scopedUrl;
  console.log(`[bootstrap-db] using schema=${APP_SCHEMA}`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`[bootstrap-db] attempt ${attempt}/3`);

    try {
      await ensureSchema(scopedUrl, APP_SCHEMA);
    } catch (err) {
      console.log(`[bootstrap-db] WARN: CREATE SCHEMA failed: ${err?.message ?? err}`);
    }

    const pushCode = await run("npx", [
      "--no-install",
      "prisma",
      "db",
      "push",
      "--accept-data-loss",
      "--skip-generate",
    ]);
    if (pushCode !== 0) {
      console.log(`[bootstrap-db] WARN: prisma db push exited ${pushCode}`);
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    try {
      if (await tableExists(scopedUrl, APP_SCHEMA, VERIFY_TABLE)) {
        const seedCode = await run("npx", [
          "--no-install",
          "prisma",
          "db",
          "seed",
        ]);
        if (seedCode !== 0) {
          console.log(
            `[bootstrap-db] WARN: seed exited ${seedCode} (tables exist — continuing)`,
          );
        }
        console.log(`[bootstrap-db] OK — ${VERIFY_TABLE} table present`);
        return true;
      }
      console.log(`[bootstrap-db] WARN: push ran but ${VERIFY_TABLE} not found`);
    } catch (err) {
      console.log(`[bootstrap-db] WARN: verify failed: ${err?.message ?? err}`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  return false;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  bootstrapDatabase()
    .then((ok) => process.exit(ok ? 0 : 1))
    .catch((err) => {
      console.error("[bootstrap-db] fatal:", err);
      process.exit(1);
    });
}
