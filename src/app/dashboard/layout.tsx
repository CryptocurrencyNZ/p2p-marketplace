// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

import Navbar from "@/components/NavBar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crypto Project',
  description: 'Crypto platform with map functionality',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
          <Navbar />
          <main>
            {children}
          </main>
      </body>
    </html>
  );
}