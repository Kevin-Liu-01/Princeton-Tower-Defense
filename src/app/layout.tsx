import type { Metadata } from "next";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

export const metadata: Metadata = {
  title: "Princeton Tower Defense",
  description: "Defend the campus from manifestations of student stress!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: '"bc-novatica-cyr", sans-serif' }}>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
