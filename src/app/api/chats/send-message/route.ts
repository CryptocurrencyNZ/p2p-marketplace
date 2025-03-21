import { NextResponse } from "next/server";
import { getChats, saveChats } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { chatId, sender, content } = await request.json();

    if (!chatId || !sender || !content) {
      return NextResponse.json(
        { error: "Missing chatId, sender, or content" },
        { status: 400 }
      );
    }

    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const newMessage = {
      id: chat.messages.length + 1,
      sender,
      content,
      timestamp: new Date().toISOString(),
      status: "sent" // Initial status is "sent"
    };

    chat.messages.push(newMessage);
    await saveChats(data);

    // In a real app with websockets, we would broadcast this message to other users
    // After 1 second, we would update the status to "delivered"
    // After the recipient reads it, we would update to "read"

    return NextResponse.json({ 
      message: newMessage,
      success: true 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 