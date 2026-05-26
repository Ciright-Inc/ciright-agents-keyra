#!/usr/bin/env node
/**
 * Production start wrapper.
 *
 * 1. Rewrite DATABASE_URL so it pins this app to its own Postgres schema
 *    (we share a Railway Postgres instance with other services and must not
 *    touch their tables/views).
 * 2. CREATE SCHEMA IF NOT EXISTS before any migration.
 * 3. prisma db push (scoped to our schema) + idempotent seed.
 * 4. next start. All DB steps are non-fatal so the app boots either way.
 */

import { spawn } from "node:child_process";
import { Client } from "pg";

const PORT = process.env.PORT ?? "3040";
const HOST = "0.0.0.0";
const APP_SCHEMA = "ciright_agents_keyra";

function rewriteSchema(url, schema) {
  if (url.includes("schema=")) {
    return url.replace(/([?&])schema=[^&]*/, `$1schema=${schema}`);
  }
  return url + (url.includes("?") ? "&" : "?") + `schema=${schema}`;
}

function ensureSsl(url) {
  if (url.includes("sslmode=")) return url;
  const onRailway =
    url.includes("railway") ||
    url.includes("rlwy.net") ||
    process.env.RAILWAY_ENVIRONMENT === "production" ||
    process.env.RAILWAY_ENVIRONMENT === "true";
  if (!onRailway) return url;
  return url + (url.includes("?") ? "&" : "?") + "sslmode=require";
}

function plainConnectionUrl(url) {
  return url.replace(/([?&])schema=[^&]*/g, "").replace(/[?&]$/, "");
}

async function ensureSchema(connUrl, schema) {
  const client = new Client({ connectionString: plainConnectionUrl(connUrl) });
  try {
    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
    console.log(`[start] ensured schema "${schema}" exists`);
  } finally {
    await client.end().catch(() => {});
  }
}

function run(cmd, args, env = process.env) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", env });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}

async function bootstrap() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    console.log("[start] DATABASE_URL not set — skipping prisma bootstrap");
    return;
  }

  const scopedUrl = ensureSsl(rewriteSchema(raw, APP_SCHEMA));
  process.env.DATABASE_URL = scopedUrl;
  console.log(`[start] scoped DATABASE_URL to schema=${APP_SCHEMA}`);

  try {
    await ensureSchema(scopedUrl, APP_SCHEMA);
  } catch (err) {
    console.log(`[start] WARN: could not create schema "${APP_SCHEMA}": ${err?.message ?? err}`);
    return;
  }

  console.log("[start] prisma db push --accept-data-loss");
  const pushCode = await run("npx", [
    "--no-install",
    "prisma",
    "db",
    "push",
    "--accept-data-loss",
    "--skip-generate",
  ]);
  if (pushCode !== 0) {
    console.log(`[start] WARN: prisma db push exited ${pushCode} — continuing`);
    return;
  }

  console.log("[start] seeding database");
  const seedCode = await run("npx", ["--no-install", "tsx", "prisma/seed.ts"]);
  if (seedCode !== 0) {
    console.log(`[start] WARN: seed exited ${seedCode} — app will still start`);
  } else {
    console.log("[start] seed complete");
  }
}

async function main() {
  await bootstrap();
  console.log(`[start] launching next start on ${HOST}:${PORT}`);
  const code = await run("npx", [
    "--no-install",
    "next",
    "start",
    "-p",
    String(PORT),
    "-H",
    HOST,
  ]);
  process.exit(code);
}

main().catch((err) => {
  console.error("[start] fatal:", err);
  process.exit(1);
});
