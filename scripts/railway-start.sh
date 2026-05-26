#!/usr/bin/env sh
# Railway start script.
# Runs prisma schema push + seed, but never blocks app boot on DB issues —
# the app still starts so logs are visible in Railway and /api/health passes.

set -u

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[railway-start] DATABASE_URL not set — skipping prisma deploy:db"
else
  echo "[railway-start] running prisma db push + seed"
  if ! npm run deploy:db; then
    echo "[railway-start] WARN: deploy:db failed; starting app anyway. Inspect logs above."
  fi
fi

echo "[railway-start] launching next start"
exec npm run start
