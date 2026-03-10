import type { Metadata } from "next";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Analytics } from "@vercel/analytics/next";
import { StructuredData } from "./seo/StructuredData";
import {
  SITE_URL,
  SITE_NAME,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_DESCRIPTION_SHORT,
  OG_DESCRIPTION,
  KEYWORDS,
  OG_IMAGES,
} from "./seo/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Browser Tower Defense Game at Princeton University`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: KEYWORDS,
  authors: [{ name: SITE_AUTHOR, url: "https://github.com/Kevin-Liu-01" }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  category: "Games",
  classification: "Tower Defense Strategy Game",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/images/logos/princeton-td-logo.png" }],
  },

  openGraph: {
    title: `${SITE_NAME} — Free Browser TD Game with 23 Levels, 7 Towers & Heroes`,
    description: OG_DESCRIPTION,
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      OG_IMAGES.primary,
      OG_IMAGES.desert,
      OG_IMAGES.winter,
      OG_IMAGES.homepage,
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free Browser Tower Defense Game`,
    description: SITE_DESCRIPTION_SHORT,
    images: [OG_IMAGES.primary],
    creator: "@Kevin_Liu_01",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },

  other: {
    "apple-mobile-web-app-title": SITE_NAME,
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#E87722",
    "theme-color": "#E87722",
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
