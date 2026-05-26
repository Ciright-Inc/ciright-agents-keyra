# ciright.agents.keyra.ie — Deployment Catalog

Internal Next.js + Prisma app that stores clean agent design blueprints
for the Keyra deployment catalog. Customer transactional data must never
live here.

## Stack

- Next.js 15 (App Router) — `src/app/`
- Prisma 6 with **PostgreSQL** — `prisma/schema.prisma`
- Tailwind CSS

## Local development

```bash
cp .env.example .env           # set DATABASE_URL to a Postgres instance
npm install
npm run deploy:db              # prisma db push + seed
npm run dev                    # http://localhost:3040
```

For a quick local Postgres:

```bash
docker run -d --name ciright-agents-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ciright_agents_keyra \
  -p 5432:5432 postgres:16
```

## Railway deployment

The repo includes `railway.toml`, `railway.json`, and `nixpacks.toml`.
Railway builds with Nixpacks (Node 22).

1. Create / link a **Postgres** service in the same Railway project.
2. On the `ciright-agents-keyra` service variables, set:

   ```
   DATABASE_URL=${{ Postgres.DATABASE_URL }}
   ```

3. Push to `main` — Railway redeploys automatically.

At start, `scripts/railway-start.sh` runs `prisma db push` + seed
(non-fatal) and then `next start`. Healthcheck path: `/api/health`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server on `:3040` |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Production server |
| `npm run deploy:db` | `prisma db push` + seed (idempotent) |
| `npm run db:seed` | Seed only (re-runnable, upserts) |
| `npm run db:reset` | Force-reset schema + reseed |
