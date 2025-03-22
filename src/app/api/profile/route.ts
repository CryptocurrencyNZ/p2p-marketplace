import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth();
  if (!session || !session.user)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  return NextResponse.json({ message: session.user.name });
};
