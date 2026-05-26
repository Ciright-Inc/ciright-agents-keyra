# ciright.agents.keyra.ie

Internal Keyra deployment catalog for Ciright-origin agents.

## Railway deploy

1. Connect this repo: `https://git-codecommit.us-east-1.amazonaws.com/v1/repos/ciright-agents-keyra`
2. Branch: **main** · Root directory: **/** (empty)
3. Add **PostgreSQL** service, then set on the app service:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
```

4. Deploy uses `Dockerfile` + `railway.toml`. On start: `prisma db push` + seed (50 agents), then Next.js.

**If build only shows `README.md`**, Railway is pointed at the wrong repo or branch — reconnect to this CodeCommit repo on `main`.

## Local

```bash
cp .env.example .env
npm install
npm run db:push && npm run db:seed
npm run dev
```

Open http://localhost:3040
