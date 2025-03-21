import { NextResponse } from "next/server";
import { findOrCreateUser, createChat as dbCreateChat } from "@/lib/db/utils";

// Define message types to avoid TypeScript errors
interface MessageBase {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  status: string;
}

interface FileMessage extends MessageBase {
  isFile: boolean;
  fileType: string;
  fileName: string;
  fileSize: string;
}

type Message = MessageBase | FileMessage;

// Handle POST requests (to create a new chat)
export async function POST(request: Request) {
  try {
    // Get the data from the request (the two users starting the chat)
    const { user1, user2, initialMessage, attachments } = await request.json();

    // Make sure we have both users
    if (!user1 || !user2) {
      return NextResponse.json(
        { error: "Missing user1 or user2" },
        { status: 400 }
      );
    }

    // Get or create users
    const dbUser1 = await findOrCreateUser(user1);
    const dbUser2 = await findOrCreateUser(user2);
    
    if (!dbUser1 || !dbUser2) {
      return NextResponse.json({ error: "Failed to create users" }, { status: 500 });
    }

    // Create chat with initial message
    let fileDetails = undefined;
    if (attachments && attachments.length > 0) {
      const attachment = attachments[0];
      fileDetails = {
        fileType: attachment.type || "file",
        fileName: attachment.name || "file",
        fileSize: attachment.size || "1 KB"
      };
    }
    
    // Create the chat (this will handle checking for existing chats internally)
    const chat = await dbCreateChat(
      dbUser1.id, 
      dbUser2.id, 
      initialMessage
      // We'll handle file attachments separately after confirming the chat exists
    );
    
    if (!chat) {
      return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
    }
    
    // Format chat for frontend response
    const otherUser = chat.participants.find(p => p.userId !== dbUser1.id)?.user;
    
    if (!otherUser) {
      return NextResponse.json({ error: "Failed to find other user" }, { status: 500 });
    }
    
    // Format response for frontend
    const formattedChat = {
      id: chat.id.toString(),
      user: {
        name: otherUser.username === "seller456" ? "Alice Crypto" : "Bob Trader",
        address: otherUser.username === "seller456" ? "0xF3b2...9a4D" : "0x7D1c...3e5F",
        avatar: "/api/placeholder/40/40",
        status: "online"
      },
      messages: chat.messages.map(msg => ({
        id: `m${msg.id}`,
        sender: msg.senderId === dbUser1.id ? "me" : "them",
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: msg.status,
        ...(msg.isFile && {
          isFile: true,
          fileType: msg.fileType,
          fileName: msg.fileName,
          fileSize: msg.fileSize
        })
      })),
      lastMessage: chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content 
        : "No messages yet",
      timestamp: "Just now",
      unread: 0,
      starred: chat.starred || false,
      encrypted: chat.encrypted || true,
      verified: chat.verified || true
    };

    // Send back a success response
    return NextResponse.json({ 
      chat: formattedChat,
      isNew: true
    }, { status: 201 });
  } catch (error) {
    console.error("Error in create chat endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Helper function to format chat for frontend
function formatChatForFrontend(chat: any, currentUserId: string) {
  const otherUserId = chat.user1 === currentUserId ? chat.user2 : chat.user1;
  
  // Get proper user info
  const user = {
    name: otherUserId === "seller456" ? "Alice Crypto" : "Bob Trader",
    address: otherUserId === "seller456" ? "0xF3b2...9a4D" : "0x7D1c...3e5F",
    avatar: "/api/placeholder/40/40",
    status: "online"
  };
  
  // Calculate unread count
  const unreadCount = chat.messages.filter(
    (msg: any) => msg.sender !== currentUserId && msg.status !== "read"
  ).length;
  
  // Get last message
  const lastMessage = chat.messages.length > 0 
    ? chat.messages[chat.messages.length - 1].content 
    : "No messages yet";
    
  // Format messages for frontend
  const formattedMessages = chat.messages.map((msg: any) => ({
    id: `m${msg.id}`,
    sender: msg.sender === currentUserId ? "me" : "them",
    content: msg.content,
    timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    status: msg.status,
    ...(msg.isFile && {
      isFile: true,
      fileType: msg.fileType,
      fileName: msg.fileName,
      fileSize: msg.fileSize
    })
  }));
  
  return {
    id: chat.id.toString(),
    user,
    messages: formattedMessages,
    lastMessage,
    timestamp: "Just now",
    unread: unreadCount,
    starred: chat.starred || false,
    encrypted: true,
    verified: true
  };
} 