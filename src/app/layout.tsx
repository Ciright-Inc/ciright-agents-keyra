import "./globals.css";
import type { Metadata } from "next";
import { CatalogAuthShell } from "@/components/CatalogAuthShell";

const KEYRA_FAVICON_SRC = "/favicon.svg";

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
        <CatalogAuthShell>{children}</CatalogAuthShell>
      </body>
    </html>
  );
}
