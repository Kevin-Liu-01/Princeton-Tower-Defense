import { Theme } from "@radix-ui/themes";

import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";

import {
  SITE_URL,
  SITE_NAME,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_DESCRIPTION_SHORT,
  KEYWORDS,
  AUTHOR_URL,
  GITHUB_URL,
} from "./seo/constants";
import { StructuredData } from "./seo/StructuredData";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  width: "device-width",
};

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
  applicationName: SITE_NAME,
  authors: [{ name: SITE_AUTHOR, url: AUTHOR_URL }],
  category: "Games",
  classification: "Tower Defense Strategy Game",
  creator: SITE_AUTHOR,
  description: SITE_DESCRIPTION,
  generator: "Next.js",
  icons: {
    apple: [{ url: "/images/logos/princeton-td-logo.png" }],
    icon: [{ sizes: "any", url: "/favicon.ico" }],
  },
  keywords: KEYWORDS,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description: SITE_DESCRIPTION_SHORT,
    images: [
      {
        alt: `${SITE_NAME} - Free browser tower defense game`,
        height: 630,
        type: "image/png",
        url: "/images/og/home.png",
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Free Tower Defense Game - Play Now`,
    type: "website",
    url: SITE_URL,
  },

  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": SITE_NAME,
    author: SITE_AUTHOR,
    designer: SITE_AUTHOR,
    "github:repo": GITHUB_URL,
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#E87722",
    "theme-color": "#E87722",
    "twitter:domain": "ptd.quest",
  },

  publisher: SITE_AUTHOR,

  referrer: "origin-when-cross-origin",

  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
    nocache: false,
  },

  title: {
    default: `${SITE_NAME} | Free Browser Tower Defense Game`,
    template: `%s | ${SITE_NAME}`,
  },

  twitter: {
    card: "summary_large_image",
    creator: "@kevskgs",
    description: SITE_DESCRIPTION_SHORT,
    images: [
      {
        alt: `${SITE_NAME} - Free browser tower defense game`,
        height: 630,
        url: "/images/og/home.png",
        width: 1200,
      },
    ],
    site: "@kevskgs",
    title: `${SITE_NAME} | Free Browser Tower Defense Game`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
        style={{ fontFamily: '"bc-novatica-cyr", "inter", sans-serif' }}
      >
        <Theme>{children}</Theme>
        <Analytics />
      </body>
    </html>
  );
}
