import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ProtectedProps {
  children: ReactNode;
}

export default async function Protected({ children }: ProtectedProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
