import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { BackgroundLayers } from "@/components/layout/BackgroundLayers";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { structuredData } from "@/lib/schema";
import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/**
 * The shared social image. Dimensions are the portrait's real pixel size —
 * they must stay in step with public/portrait.jpg, because crawlers lay the
 * card out from these numbers before the file itself is fetched.
 */
const OG_IMAGE = { url: "/portrait.jpg", width: 1178, height: 1335 } as const;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.shortTitle,
  authors: [{ name: profile.name, url: site.url }],
  creator: profile.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: site.url,
    title: site.title,
    description: site.description,
    siteName: site.shortTitle,
    locale: site.locale,
    images: [
      {
        url: OG_IMAGE.url,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: `${profile.name} — ${profile.role}`,
      },
    ],
  },
  twitter: {
    /*
      `summary`, not `summary_large_image`: the shared image is the 4:5
      portrait, and a large card crops to roughly 1.91:1 — which would cut
      the subject's head off. `summary` crops square and keeps the face.
      Switch back to a large card only alongside a ~1200x630 asset.
    */
    card: "summary",
    title: site.title,
    description: site.description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafbfa" },
  ],
  /*
    Dark first: this meta is parsed before the theme boot script runs, and it
    is what the browser uses to paint the canvas and native controls in that
    window. Listing light first asked the UA to follow the OS preference,
    which could show a light canvas for a frame on a light-themed machine.
    Dark first matches the site's default; the boot script still writes an
    inline color-scheme, so an explicit light choice continues to win.
  */
  colorScheme: "dark light",
};

/**
 * Inline, render-blocking theme resolution. Kept as a plain string so it can
 * be minified by hand and audited at a glance — it is the only script that
 * must run before paint. The storage key matches THEME_STORAGE_KEY in
 * components/layout/ThemeToggle.tsx.
 *
 * Dark is the site's default, so only an explicit stored "light" produces the
 * light theme. The OS `prefers-color-scheme` setting is deliberately not
 * consulted: a visitor on a light-themed machine should still meet the site
 * in dark, and only leave it by choosing to.
 *
 * Anything other than "light" — no value, "dark", or a stale/corrupt entry —
 * resolves to dark, matching how readTheme() and the cross-tab storage
 * listener in ThemeToggle.tsx read the same key.
 */
const THEME_BOOT = `try{var d=document.documentElement,t=localStorage.getItem("theme")==="light"?"light":"dark";d.dataset.theme=t;d.style.colorScheme=t}catch(e){var r=document.documentElement;r.dataset.theme="dark";r.style.colorScheme="dark"}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // data-theme is written by the boot script below before React hydrates,
    // so the attribute legitimately differs from the server markup.
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Resolves the theme before first paint: a stored choice wins,
          otherwise the site's dark default. Runs synchronously in the head so
          the correct palette is applied on the very first frame and the page
          never flashes the wrong theme.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

        <script
          type="application/ld+json"
          // Content is generated from our own data layer, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:border focus:border-accent focus:bg-surface focus:px-4 focus:py-2 focus:font-mono focus:text-[13px] focus:text-fg-bright"
        >
          Skip to content
        </a>

        <BackgroundLayers />
        <Nav />

        <main id="main" className="relative z-[1]">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
