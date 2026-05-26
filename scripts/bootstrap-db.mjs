#!/usr/bin/env node
/**
 * Idempotent Postgres bootstrap via Prisma only (no pg driver).
 * Prisma handles schema= in DATABASE_URL; avoids SSL issues on railway.internal.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

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

export function isRailwayInternalDb(url) {
  try {
    return new URL(url).hostname.endsWith(".railway.internal");
  } catch {
    return url.includes(".railway.internal");
  }
}

export function rewriteSchema(url, schema) {
  const u = new URL(url);
  u.searchParams.set("schema", schema);
  return u.toString();
}

/** Scope to app schema; strip SSL on private Railway network (Prisma connects fine). */
export function prepareDatabaseUrl(raw, schema = APP_SCHEMA) {
  const u = new URL(raw.trim());
  u.searchParams.set("schema", schema);
  if (isRailwayInternalDb(u.toString())) {
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    return u.toString();
  }
  if (!u.searchParams.has("sslmode")) {
    const onRailway =
      u.hostname.includes("railway") ||
      u.hostname.includes("rlwy.net") ||
      process.env.RAILWAY_ENVIRONMENT === "production" ||
      process.env.RAILWAY_ENVIRONMENT === "true";
    if (onRailway || process.env.NODE_ENV === "production") {
      u.searchParams.set("sslmode", "require");
    }
  }
  return u.toString();
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", env: process.env });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}

export async function bootstrapDatabase() {
  loadEnvFile();
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    console.log("[bootstrap-db] DATABASE_URL not set — skipping");
    return false;
  }

  const scopedUrl = prepareDatabaseUrl(raw, APP_SCHEMA);
  process.env.DATABASE_URL = scopedUrl;
  console.log(
    `[bootstrap-db] using schema=${APP_SCHEMA} host=${new URL(scopedUrl).hostname}`,
  );

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`[bootstrap-db] attempt ${attempt}/3`);

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

    const seedCode = await run("npx", ["--no-install", "prisma", "db", "seed"]);
    if (seedCode !== 0) {
      console.log(`[bootstrap-db] WARN: seed exited ${seedCode} (tables exist — continuing)`);
    }

    console.log("[bootstrap-db] OK");
    return true;
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
