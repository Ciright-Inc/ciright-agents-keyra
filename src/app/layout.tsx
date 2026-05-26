import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";

const KEYRA_FAVICON_SRC = "/favicon.png";

export const metadata: Metadata = {
  title: "ciright.agents.keyra.ie — Deployment Catalog",
  description:
    "Keyra deployment catalog for Ciright-origin agents. Clean designs only. No tenant transactional data.",
  icons: {
    icon: KEYRA_FAVICON_SRC,
    shortcut: KEYRA_FAVICON_SRC,
    apple: KEYRA_FAVICON_SRC,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Material Symbols Outlined — matches keyra admin sidebar icon family */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400..600,0..1,-25..200&display=block"
        />
      </head>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="ds-content">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
