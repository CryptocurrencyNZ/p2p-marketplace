"use client"
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

import Navbar from "@/components/NavBar";
import Protected from '@/lib/auth/protected';

const inter = Inter({ subsets: ["latin"] });

const metadata: Metadata = {
  title: 'Crypto P2P Marketplace',
  description: 'Find P2P crypto trading opportunities in New Zealand',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<Protected>
   <>
   <Navbar/>
   {
    children
   }
   </>
   </Protected>
  );
}