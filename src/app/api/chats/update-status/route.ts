import { NextResponse } from "next/server";
import { getChats, saveChats } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { chatId, messageId, status } = await request.json();

    if (!chatId || !messageId || !status) {
      return NextResponse.json(
        { error: "Missing chatId, messageId, or status" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["sent", "delivered", "read"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: sent, delivered, read" },
        { status: 400 }
      );
    }

    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Find the message and update its status
    const message = chat.messages.find((m: any) => m.id === Number(messageId));
    
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    message.status = status;
    await saveChats(data);

    return NextResponse.json({ 
      success: true,
      message: message
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 