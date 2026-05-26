import { cache } from "react";
import type { AdminUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { KeyraSessionUser } from "@/lib/keyraSessionCookie";
import { resolveKeyraSessionFromCookies } from "@/lib/keyraSessionServer";

export type CatalogAuth = {
  session: KeyraSessionUser;
  user: AdminUser;
};

export type CatalogAccessState =
  | { status: "authorized"; auth: CatalogAuth }
  | { status: "unsigned" }
  | { status: "no_access"; phoneE164: string };

export const resolveCatalogAuthForPhone = cache(
  async (phoneE164: string, session: KeyraSessionUser): Promise<CatalogAuth | null> => {
    const user = await prisma.adminUser.findFirst({
      where: {
        isActive: true,
        OR: [
          { phoneE164 },
          ...(session.email ? [{ email: session.email }] : []),
        ],
      },
    });
    if (!user) return null;
    return { session, user };
  },
);

export const resolveCatalogAuthFromCookies = cache(async (): Promise<CatalogAuth | null> => {
  const session = await resolveKeyraSessionFromCookies();
  if (!session?.phoneE164) return null;
  return resolveCatalogAuthForPhone(session.phoneE164, session);
});

export const resolveCatalogAccessState = cache(async (): Promise<CatalogAccessState> => {
  const session = await resolveKeyraSessionFromCookies();
  if (!session?.phoneE164) return { status: "unsigned" };

  const auth = await resolveCatalogAuthForPhone(session.phoneE164, session);
  if (!auth) return { status: "no_access", phoneE164: session.phoneE164 };
  return { status: "authorized", auth };
});
