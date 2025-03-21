import { NextResponse } from "next/server";
import { getChats } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");
    const limit = Number(url.searchParams.get("limit") || "50");
    const before = url.searchParams.get("before"); // Message ID to fetch messages before
    const currentUserId = url.searchParams.get("userId") || "buyer123"; // Current user ID
    
    if (!chatId) {
      return NextResponse.json(
        { error: "Missing chatId parameter" },
        { status: 400 }
      );
    }

    // Get the chat
    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Copy messages array
    let messages = [...chat.messages];
    
    // Apply pagination
    if (before) {
      // Remove 'm' prefix from message ID if present
      const messageId = before.startsWith('m') ? Number(before.substring(1)) : Number(before);
      const beforeMessageIndex = messages.findIndex((m: any) => m.id === messageId);
      if (beforeMessageIndex !== -1) {
        messages = messages.slice(0, beforeMessageIndex);
      }
    }
    
    // Get the most recent messages up to the limit
    messages = messages.slice(-limit);
    
    // Format messages for frontend display
    const formattedMessages = messages.map((msg: any) => {
      // Format timestamp from ISO to AM/PM format
      const date = new Date(msg.timestamp);
      const formattedTime = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Create formatted message object
      return {
        id: `m${msg.id}`,
        sender: msg.sender === currentUserId ? "me" : "them",
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
      messages: formattedMessages,
      hasMore: messages.length >= limit
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 