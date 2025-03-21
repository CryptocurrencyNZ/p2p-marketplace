import Navbar from "@/components/NavBar";
import Protected from "@/lib/auth/protected";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Protected>
      <Navbar />
      <main>{children}</main>
    </Protected>
  );
}
