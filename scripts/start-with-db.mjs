#!/usr/bin/env node
/**
 * Production start wrapper for Railway / any host.
 * - Runs `prisma db push` + seed (non-fatal) before booting Next.js.
 * - Skips DB bootstrap if DATABASE_URL is missing — app still starts.
 * - Idempotent: prisma db push and seed both upsert.
 *
 * Used by `npm start` so Railway invocation method does not matter.
 */

import { spawn } from "node:child_process";

const PORT = process.env.PORT ?? "3040";
const HOST = "0.0.0.0";

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      env: process.env,
      ...opts,
    });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}

async function bootstrap() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.log("[start] DATABASE_URL not set — skipping prisma bootstrap");
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
