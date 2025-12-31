import type { Metadata } from "next";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Inter } from "next/font/google"; // Using Inter as a clean default

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Princeton Tower Defense",
  description: "Defend the campus from manifestations of student stress!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-primary antialiased`}>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
