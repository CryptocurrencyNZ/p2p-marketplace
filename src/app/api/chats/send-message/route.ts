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
    };

    chat.messages.push(newMessage);
    await saveChats(data);

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 