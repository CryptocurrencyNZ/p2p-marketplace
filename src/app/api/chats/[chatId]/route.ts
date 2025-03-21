import { NextResponse } from "next/server";
import { getChatById, findOrCreateUser } from "@/lib/db/utils";
import { ChatParticipant, User, ChatMessage } from "@/lib/db/schema";

// Define types for chat data from database
interface ChatWithRelations {
  id: number;
  createdAt: Date;
  starred: boolean | null;
  encrypted: boolean | null;
  verified: boolean | null;
  participants: (ChatParticipant & { user: User })[];
  messages: ChatMessage[];
}

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    // Get current user from query param (will be replaced with auth in production)
    const url = new URL(request.url);
    const currentUserName = url.searchParams.get("userId") || "buyer123";
    
    // Get user from database
    const currentUser = await findOrCreateUser(currentUserName);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get chat from database
    const chat = await getChatById(Number(chatId));
    
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Make sure the user is part of this chat
    const isParticipant = chat.participants.some((p: ChatParticipant) => p.userId === currentUser.id);
    if (!isParticipant) {
      return NextResponse.json(
        { error: "User is not a participant in this chat" },
        { status: 403 }
      );
    }

    // Get the other user
    const otherParticipant = chat.participants.find((p: ChatParticipant & { user: User }) => p.userId !== currentUser.id);
    if (!otherParticipant || !otherParticipant.user) {
      return NextResponse.json({ error: "Other user not found" }, { status: 500 });
    }
    
    const otherUser = otherParticipant.user;
    
    // Format user data for frontend
    const userDisplay = {
      name: formatUserName(otherUser.username),
      address: formatWalletAddress(otherUser.username),
      fullAddress: `0x${otherUser.username.replace(/[^a-zA-Z0-9]/g, '')}`,
      avatar: "/api/placeholder/48/48", // Placeholder avatar
      status: Math.random() > 0.5 ? "online" : "offline" // Random status for demo
    };
    
    // Process messages to match frontend format
    const formattedMessages = chat.messages.map((msg: ChatMessage) => {
      // Format timestamp to AM/PM format
      const date = new Date(msg.timestamp);
      const formattedTime = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return {
        id: msg.id.toString(),
        sender: msg.senderId === currentUser.id ? "me" : "them",
        content: msg.content,
        timestamp: formattedTime,
        status: msg.status || "delivered",
        ...(msg.isFile && {
          isFile: true,
          fileType: msg.fileType || "pdf",
          fileName: msg.fileName || "document.pdf",
          fileSize: msg.fileSize || "1.2 MB"
        })
      };
    });

    return NextResponse.json({ 
      id: chat.id.toString(),
      user: {
        name: userDisplay.name,
        address: userDisplay.fullAddress, // Full address for the chat detail page
        avatar: "/api/placeholder/48/48", // Larger avatar for the chat page
        status: userDisplay.status,
        lastSeen: userDisplay.status === "online" ? "Active now" : "Last seen recently",
        verified: true
      },
      messages: formattedMessages,
      encrypted: chat.encrypted !== false, // Default to true if not specified
      verified: chat.verified !== false, // Default to true if not specified
      starred: chat.starred || false
    }, { status: 200 });
  } catch (error) {
    console.error("Error in chat detail endpoint:", error);
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