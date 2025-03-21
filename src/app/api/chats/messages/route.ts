import { NextResponse } from "next/server";
import { getChats } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");
    const limit = Number(url.searchParams.get("limit") || "20");
    const before = url.searchParams.get("before"); // Message ID to fetch messages before
    
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
      const beforeMessageIndex = messages.findIndex((m: any) => m.id === Number(before));
      if (beforeMessageIndex !== -1) {
        messages = messages.slice(0, beforeMessageIndex);
      }
    }
    
    // Get the most recent messages up to the limit
    messages = messages.slice(-limit);
    
    // Add status to messages if not present
    messages = messages.map((msg: any) => ({
      ...msg,
      status: msg.status || "delivered",
    }));

    return NextResponse.json({ 
      messages,
      hasMore: messages.length >= limit
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 