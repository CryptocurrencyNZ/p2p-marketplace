import { NextResponse } from "next/server";

// Define the user type
interface User {
  id: string;
  name: string;
  address: string;
  avatar: string;
  status: string;
  lastSeen: string;
  verified: boolean;
}

// Mock user database with proper typing
const users: Record<string, User> = {
  "buyer123": {
    id: "buyer123",
    name: "Bob Trader",
    address: "0x1234...5678",
    avatar: "/api/placeholder/48/48",
    status: "online",
    lastSeen: "Active now",
    verified: true
  },
  "seller456": {
    id: "seller456",
    name: "Alice Crypto",
    address: "0xF3b217A5F7A9a4D",
    avatar: "/api/placeholder/48/48",
    status: "online",
    lastSeen: "Active now",
    verified: true
  }
};

export async function GET(request: Request) {
  try {
    // Get the user ID from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const user = users[userId];
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 