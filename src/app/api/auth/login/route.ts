import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Find user by username
    const user = await db.select().from(users).where(eq(users.username, username));
    
    if (user.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user[0].id,
        username: user[0].username
      }, 
      env.JWT_SECRET, 
      { expiresIn: "24h" }
    );

    return NextResponse.json({ 
      token,
      user: {
        id: user[0].id,
        username: user[0].username
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 