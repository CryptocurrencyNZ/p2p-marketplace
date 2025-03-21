import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  description: "Buy and sell cryptocurrencies directly with other Kiwis. Secure, local P2P trading platform with no intermediaries. Trade Bitcoin, Ethereum and other digital assets in NZD.",
  keywords: [
    "cryptocurrency", "bitcoin", "ethereum", "crypto", "p2p", 
    "peer-to-peer", "new zealand", "nz", "kiwi", "marketplace", 
    "buy crypto", "sell crypto", "trade", "blockchain", "digital assets"
  ],

  icons: {
    icon: "/CNZ_logo.png", // This is the simplest way to set the tab icon
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
