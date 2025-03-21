import { NextResponse } from "next/server";
import { getChatsByUserId, findOrCreateUser } from "@/lib/db/utils";

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
    
    // Get user from database
    const user = await findOrCreateUser(userName);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get all chats from database
    const userChats = await getChatsByUserId(user.id);

    // Format chats to match frontend expectations
    const formattedChats: FormattedChat[] = userChats
      .map((chat) => {
        // Find the other participant
        const otherParticipant = chat.participants.find(
          (p) => p.userId !== user.id
        );
        
        if (!otherParticipant || !otherParticipant.user) {
          return null; // Skip chats where we can't find the other user
        }
        
        const otherUser = otherParticipant.user;
        
        // Get last message
        const lastMessage = chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1] 
          : null;
        
        // Calculate unread count (messages from other user that aren't read)
        const unreadCount = chat.messages.filter(
          (msg) => msg.senderId !== user.id && msg.status !== "read"
        ).length;

        // Format timestamp to human-readable
        let timestamp = "No messages";
        if (lastMessage) {
          const date = new Date(lastMessage.timestamp);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
          
          if (diffMinutes < 1) {
            timestamp = "Just now";
          } else if (diffMinutes < 60) {
            timestamp = `${diffMinutes}m ago`;
          } else if (diffMinutes < 24 * 60) {
            timestamp = `${Math.floor(diffMinutes / 60)}h ago`;
          } else if (diffMinutes < 48 * 60) {
            timestamp = "Yesterday";
          } else {
            timestamp = `${Math.floor(diffMinutes / (60 * 24))} days ago`;
          }
        }

        // Format username to display name
        const name = otherUser.username === "seller456" 
          ? "Alice Crypto" 
          : otherUser.username === "trader789"
            ? "Carol Coinbase"
            : "Bob Trader";
            
        // Format address
        const address = otherUser.username === "seller456" 
          ? "0xF3b2...9a4D" 
          : otherUser.username === "trader789"
            ? "0x4A9d...7B2e"
            : "0x7D1c...3e5F";

        // Create a formatted chat object
        return {
          id: chat.id.toString(),
          user: {
            name,
            address,
            avatar: "/api/placeholder/40/40",
            status: Math.random() > 0.5 ? "online" : "offline" // Mock status
          },
          lastMessage: lastMessage ? lastMessage.content : "No messages yet",
          timestamp,
          unread: unreadCount,
          starred: chat.starred || false
        };
      })
      .filter((chat): chat is FormattedChat => chat !== null); // Type guard to filter out nulls

    // Apply additional filters
    let filteredChats = formattedChats;
    if (filter === "starred") {
      filteredChats = formattedChats.filter((chat) => chat.starred);
    } else if (filter === "unread") {
      filteredChats = formattedChats.filter((chat) => chat.unread > 0);
    }

    return NextResponse.json({ 
      conversations: filteredChats 
    }, { status: 200 });
  } catch (error) {
    console.error("Error in chats list endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 