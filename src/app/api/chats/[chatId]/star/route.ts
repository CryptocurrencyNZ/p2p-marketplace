import { NextResponse } from "next/server";
import { getChats, saveChats } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    const body = await request.json();
    const { userId, starred } = body;

    if (typeof starred !== 'boolean') {
      return NextResponse.json(
        { error: "Missing 'starred' status" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const data = await getChats();
    const chatIndex = data.chats.findIndex((c: any) => c.id === Number(chatId));

    if (chatIndex === -1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chat = data.chats[chatIndex];
    
    // Check if user is part of this chat
    if (chat.user1 !== userId && chat.user2 !== userId) {
      return NextResponse.json(
        { error: "User is not a participant in this chat" },
        { status: 403 }
      );
    }

    // Update star status
    chat.starred = starred;
    
    // Update data
    data.chats[chatIndex] = chat;
    await saveChats(data);

    return NextResponse.json({ 
      id: chat.id.toString(),
      starred
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating star status:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 