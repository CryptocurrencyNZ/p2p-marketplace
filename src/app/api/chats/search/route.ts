import { NextResponse } from "next/server";
import { getChats } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");
    const query = url.searchParams.get("query");
    
    if (!chatId || !query) {
      return NextResponse.json(
        { error: "Missing chatId or query parameter" },
        { status: 400 }
      );
    }

    // Get the chat
    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Search for messages containing the query (case insensitive)
    const matchingMessages = chat.messages.filter((msg: any) => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    
    // Enhance messages with status if not present
    const formattedMessages = matchingMessages.map((msg: any) => ({
      ...msg,
      status: msg.status || "delivered",
    }));

    return NextResponse.json({ 
      messages: formattedMessages,
      count: formattedMessages.length
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 