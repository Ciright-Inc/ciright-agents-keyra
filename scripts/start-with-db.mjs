#!/usr/bin/env node
import { spawn } from "node:child_process";
import { bootstrapDatabase } from "./bootstrap-db.mjs";

const PORT = process.env.PORT ?? "3040";
const HOST = "0.0.0.0";

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", env: process.env });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}

async function main() {
  const ok = await bootstrapDatabase();
  if (!ok) {
    console.log("[start] WARN: database bootstrap did not complete — app may show DB errors");
  }
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
