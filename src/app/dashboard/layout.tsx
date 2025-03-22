import Navbar from "@/components/NavBar";
import Protected from "@/lib/auth/protected";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Protected>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Navbar />
        <main className="flex-1 pb-14 md:pb-0 w-full">
          {children}
        </main>
      </div>
    </Protected>
  );
}