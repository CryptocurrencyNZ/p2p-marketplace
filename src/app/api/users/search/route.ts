import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, User } from "@/lib/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    
    if (query.length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }
    
    // Search for users that match the query in username
    const matchedUsers = await db.query.users.findMany({
      where: ilike(users.username, `%${query}%`)
    });
    
    // Format users for frontend
    const formattedUsers = matchedUsers.map((user: User) => ({
      id: user.id.toString(),
      name: formatUserName(user.username),
      address: formatWalletAddress(user.username),
      avatar: "/api/placeholder/40/40",
      verified: ["seller456", "trader789", "crypto_carol"].includes(user.username)
    }));
    
    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Helper function to format usernames to display names
function formatUserName(username: string): string {
  const nameMap: Record<string, string> = {
    "seller456": "Alice Crypto",
    "trader789": "Bob Blockchain",
    "crypto_carol": "Carol Coinbase",
    "defi_dave": "Dave DeFi",
    "eth_eve": "Eve Ethereum",
    "buyer123": "You"
  };
  
  return nameMap[username] || username;
}

// Helper function to format usernames to wallet addresses
function formatWalletAddress(username: string): string {
  const addressMap: Record<string, string> = {
    "seller456": "0xF3b2...9a4D",
    "trader789": "0x7D1c...3e5F", 
    "crypto_carol": "0x4A9d...7B2e",
    "defi_dave": "0x2E6b...1F8c",
    "eth_eve": "0x9C3a...8D2b",
    "buyer123": "0x1234...5678"
  };
  
  return addressMap[username] || `0x${username.slice(0,4)}...${username.slice(-4)}`;
} 