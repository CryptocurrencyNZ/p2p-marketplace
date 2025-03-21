// app/layout.tsx
import type { Metadata } from "next";
import "../globals.css";

import Navbar from "@/components/NavBar";
import Protected from "@/lib/auth/protected";

export const metadata: Metadata = {
  title: "Crypto Project",
  description: "Crypto platform with map functionality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <Protected>
          <Navbar />
          <main>{children}</main>
        </Protected>
      </body>
    </html>
  );
}
