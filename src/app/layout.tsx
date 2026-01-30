import type { Metadata } from "next";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

export const metadata: Metadata = {
  title: "Princeton Tower Defense",
  description:
    "Defend the campus from manifestations of student stress! Build towers, summon heroes, and protect Nassau Hall in this strategic tower defense game set at Princeton University.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: [
    "tower defense",
    "Princeton",
    "strategy game",
    "browser game",
    "TD game",
    "campus defense",
  ],
  authors: [{ name: "Kevin Liu" }],
  openGraph: {
    title: "Princeton Tower Defense",
    description:
      "Defend the campus from manifestations of student stress! Build towers, summon heroes, and protect Nassau Hall in this strategic tower defense adventure.",
    type: "website",
    locale: "en_US",
    siteName: "Princeton Tower Defense",
    images: [
      {
        url: "/images/gameplay-latest2.png",
        width: 1200,
        height: 630,
        alt: "Princeton Tower Defense gameplay showing towers defending against waves of enemies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Princeton Tower Defense",
    description:
      "Defend the campus from manifestations of student stress! Build towers, summon heroes, and protect Nassau Hall.",
    images: ["/images/gameplay-latest2.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: '"bc-novatica-cyr", "inter", sans-serif' }}>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
