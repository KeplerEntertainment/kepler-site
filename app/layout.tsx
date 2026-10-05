import type { Metadata } from "next";
import { Archivo, Archivo_Black, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { nav, site } from "@/lib/site";
import "./globals.css";

// The portfolio's four faces. next/font downloads them at build time and serves
// them from this origin, so a visitor's browser never talks to Google.
const archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo-body", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

const title = `${site.name} / sandbox MMO for Minecraft`;

export const metadata: Metadata = {
  title,
  description: site.intro,
  metadataBase: new URL(site.url),
  openGraph: {
    type: "website",
    title,
    description: site.intro,
    siteName: site.name,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${archivo.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:slab focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold"
        >
          Skip to content
        </a>
        <SiteHeader nav={nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter nav={nav} />
      </body>
    </html>
  );
}
