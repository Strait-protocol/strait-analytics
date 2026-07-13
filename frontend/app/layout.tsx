import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strait Analytics — Tunnel Activity",
  description:
    "Transaction counts, USD volume, capital flow, and finality metrics for Hemi's Bitcoin and Ethereum tunnels.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
