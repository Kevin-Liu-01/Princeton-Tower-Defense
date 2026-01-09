import type { Metadata } from "next";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Cinzel } from "next/font/google"; // Using Inter as a clean default

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

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
      <body className={`${cinzel.variable} font-cinzel antialiased`}>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
