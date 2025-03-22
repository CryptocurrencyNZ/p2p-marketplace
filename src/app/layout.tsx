import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import LoadingBarComponent from "@/components/loading";

const inter = Inter({ subsets: ["latin"] });
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CNZ | New Zealand's P2P Cryptocurrency Marketplace",
  description:
    "Buy and sell cryptocurrencies directly with other Kiwis. Secure, local P2P trading platform with no intermediaries. Trade Bitcoin, Ethereum and other digital assets in NZD.",
  keywords: [
    "cryptocurrency",
    "bitcoin",
    "ethereum",
    "crypto",
    "p2p",
    "peer-to-peer",
    "new zealand",
    "nz",
    "kiwi",
    "marketplace",
    "buy crypto",
    "sell crypto",
    "trade",
    "blockchain",
    "digital assets",
  ],
  icons: {
    icon: "/CNZ_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased bg-gray-900 text-white min-h-screen`}
      >
        <LoadingBarComponent color="#00ff00" />
        {children}
      </body>
    </html>
  );
}