import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "./env";

export interface AuthUser {
  userId: number;
  username: string;
}

export async function verifyAuth(
  req: NextRequest
): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    
    if (!token) {
      return { user: null, error: "No token provided" };
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    
    return { user: decoded };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { user: null, error: "Invalid token" };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { user: null, error: "Token expired" };
    }
    
    return { user: null, error: "Authentication error" };
  }
}

export function withAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const { user, error } = await verifyAuth(req);
    
    if (!user) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }
    
    return handler(req, user);
  };
} 