# ciright.agents.keyra.ie — Railway / container deploy
# Railway auto-detects this Dockerfile and skips Railpack when present.

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build Next.js (no DB required at build time)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3040

# Push schema + seed at start (needs DATABASE_URL from Railway Postgres)
CMD ["sh", "-c", "npm run deploy:db && exec npm run start"]
