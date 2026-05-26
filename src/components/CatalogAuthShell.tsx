import { headers } from "next/headers";
import { Sidebar } from "@/components/Sidebar";
import { assertCatalogServer } from "@/lib/assertCatalogServer";

export async function CatalogAuthShell({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/";

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return <>{children}</>;
  }

  await assertCatalogServer(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="ds-content">{children}</div>
      </main>
    </div>
  );
}
