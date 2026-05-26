import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/databaseUrl";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const datasourceUrl = resolveDatabaseUrl();

export const prisma =
  global.__prisma ??
  new PrismaClient({
    ...(datasourceUrl
      ? {
          datasources: {
            db: { url: datasourceUrl },
          },
        }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
