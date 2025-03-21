import { NextResponse } from "next/server";
import { getChatsByUserId, findOrCreateUser } from "@/lib/db/utils";
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

// Define types for our chat objects
interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  status?: string;
  isFile?: boolean;
  fileType?: string;
  fileName?: string;
  fileSize?: string;
}

interface Chat {
  id: number;
  user1: string;
  user2: string;
  messages: Message[];
  starred?: boolean;
}

interface FormattedChat {
  id: string;
  user: {
    name: string;
    address: string;
    avatar: string;
    status: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  starred: boolean;
}

export async function GET(request: Request) {
  try {
    // Get the user ID from the query parameters
    const url = new URL(request.url);
    const userName = url.searchParams.get("userId") || "buyer123";
    const filter = url.searchParams.get("filter"); // all, starred, unread
    
    // Get user from database or create if not exists
    const user = await findOrCreateUser(userName);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get all chats for the user from database
    const userChats = await getChatsByUserId(user.id);
    
    // Format chats to match frontend expectations
    const formattedChats: FormattedChat[] = userChats.map((chat: ChatWithRelations) => {
      // Find the other participant
      const otherParticipant = chat.participants.find((p: ChatParticipant & { user: User }) => p.userId !== user.id);
      
      if (!otherParticipant || !otherParticipant.user) {
        return null; // Skip if no other participant found
      }
      
      const otherUser = otherParticipant.user;
      
      // Format user display info
      const userDisplay = {
        name: formatName(otherUser.username),
        address: formatWalletAddress(otherUser.username),
        avatar: "/api/placeholder/40/40",
        status: Math.random() > 0.5 ? "online" : "offline" // Random status for demo
      };
      
      // Get last message if any
      let lastMessage = "No messages";
      let timestamp = "No messages";
      
      if (chat.messages && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        lastMessage = lastMsg.content;
        timestamp = formatRelativeTime(lastMsg.timestamp.toString());
      }
      
      // Calculate unread count (messages from other user that aren't read)
      const unreadCount = chat.messages ? chat.messages.filter(
        (msg: ChatMessage) => msg.senderId !== user.id && msg.status !== "read"
      ).length : 0;
      
      return {
        id: chat.id.toString(),
        user: userDisplay,
        lastMessage,
        timestamp,
        unread: unreadCount,
        starred: chat.starred || false
      };
    }).filter(Boolean) as FormattedChat[];
    
    // Apply filters
    let filteredChats = formattedChats;
    if (filter === "starred") {
      filteredChats = formattedChats.filter(chat => chat.starred);
    } else if (filter === "unread") {
      filteredChats = formattedChats.filter(chat => chat.unread > 0);
    }

    // Sort by most recent message first
    filteredChats.sort((a, b) => {
      const chatATime = getTimeFromRelative(a.timestamp);
      const chatBTime = getTimeFromRelative(b.timestamp);
      return chatBTime - chatATime;
    });

    return NextResponse.json({ chats: filteredChats });
  } catch (error) {
    console.error("Error in chats endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Helper function to format usernames into display names
function formatName(username: string): string {
  switch (username) {
    case "seller456": return "Alice Crypto";
    case "trader789": return "Bob Blockchain";
    case "crypto_carol": return "Carol Coinbase";
    case "defi_dave": return "Dave DeFi";
    case "eth_eve": return "Eve Ethereum";
    case "buyer123": return "You";
    default: return username; // Fallback to username if not matched
  }
}

// Helper function to format usernames to wallet addresses
function formatWalletAddress(username: string): string {
  switch (username) {
    case "seller456": return "0xF3b2...9a4D";
    case "trader789": return "0x7D1c...3e5F";
    case "crypto_carol": return "0x4A9d...7B2e";
    case "defi_dave": return "0x2E6b...1F8c";
    case "eth_eve": return "0x9C3a...8D2b";
    case "buyer123": return "0x1234...5678";
    default: return "0x" + username.slice(0, 4) + "..." + username.slice(-4);
  }
}

// Format relative time based on timestamp
function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? "Yesterday" : `${days} days ago`;
  } else if (diffInSeconds < 2419200) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Convert relative time back to timestamp for sorting
function getTimeFromRelative(relativeTime: string): number {
  const now = new Date().getTime();
  
  if (relativeTime === "Just now") {
    return now;
  } else if (relativeTime.includes("m ago")) {
    const minutes = parseInt(relativeTime);
    return now - (minutes * 60 * 1000);
  } else if (relativeTime.includes("h ago")) {
    const hours = parseInt(relativeTime);
    return now - (hours * 60 * 60 * 1000);
  } else if (relativeTime === "Yesterday") {
    return now - (24 * 60 * 60 * 1000);
  } else if (relativeTime.includes("days ago")) {
    const days = parseInt(relativeTime);
    return now - (days * 24 * 60 * 60 * 1000);
  } else if (relativeTime.includes("week") || relativeTime.includes("weeks")) {
    const weeks = parseInt(relativeTime);
    return now - (weeks * 7 * 24 * 60 * 60 * 1000);
  } else {
    // For dates in the format MM/DD/YYYY, parse and convert to timestamp
    try {
      return new Date(relativeTime).getTime();
    } catch {
      return 0; // Default timestamp for invalid formats
    }
  }
} 