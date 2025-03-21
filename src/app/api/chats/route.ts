import { NextResponse } from "next/server";
import { getChats, formatRelativeTime, formatUserDisplay } from "@/lib/utils";

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
    
    // Get all chats from JSON file
    const data = await getChats();
    
    // Filter chats for the user
    const userChats = data.chats.filter((chat: Chat) => 
      chat.user1 === userName || chat.user2 === userName
    );

    // Format chats to match frontend expectations
    const formattedChats: FormattedChat[] = userChats
      .map((chat: Chat) => {
        // Find the other participant
        const otherUser = chat.user1 === userName ? chat.user2 : chat.user1;
        
        // Get user display info
        const userDisplay = formatUserDisplay(otherUser);
        
        // Get last message
        const lastMessage = chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1].content 
          : "No messages";
        
        // Calculate unread count (messages from other user that aren't read)
        const unreadCount = chat.messages.filter(
          (msg: Message) => msg.sender !== userName && msg.status !== "read"
        ).length;

        // Format timestamp to human-readable
        let timestamp = "No messages";
        if (chat.messages.length > 0) {
          const lastTimestamp = chat.messages[chat.messages.length - 1].timestamp;
          timestamp = formatRelativeTime(lastTimestamp);
        }

        return {
          id: chat.id.toString(),
          user: {
            name: userDisplay.name,
            address: userDisplay.address,
            avatar: userDisplay.avatar,
            status: userDisplay.status
          },
          lastMessage,
          timestamp,
          unread: unreadCount,
          starred: chat.starred || false
        };
      });
    
    // Apply filters
    let filteredChats = formattedChats;
    if (filter === "starred") {
      filteredChats = formattedChats.filter(chat => chat.starred);
    } else if (filter === "unread") {
      filteredChats = formattedChats.filter(chat => chat.unread > 0);
    }

    // Sort by most recent message first
    filteredChats.sort((a, b) => {
      const chatA = userChats.find(c => c.id.toString() === a.id);
      const chatB = userChats.find(c => c.id.toString() === b.id);
      
      if (!chatA?.messages.length) return 1;
      if (!chatB?.messages.length) return -1;
      
      const timeA = new Date(chatA.messages[chatA.messages.length - 1].timestamp).getTime();
      const timeB = new Date(chatB.messages[chatB.messages.length - 1].timestamp).getTime();
      
      return timeB - timeA;
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