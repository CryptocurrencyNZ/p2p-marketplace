import { NextResponse } from "next/server";
import { getChats, saveChats } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get the chat
    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Make sure the user is part of this chat
    if (chat.user1 !== userId && chat.user2 !== userId) {
      return NextResponse.json(
        { error: "User is not a participant in this chat" },
        { status: 403 }
      );
    }

    let messagesUpdated = 0;

    // Mark all messages from the other user as read
    chat.messages.forEach((msg: any) => {
      if (msg.sender !== userId && msg.status !== "read") {
        msg.status = "read";
        messagesUpdated++;
      }
    });

    await saveChats(data);

    return NextResponse.json({ 
      success: true,
      messagesUpdated
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 