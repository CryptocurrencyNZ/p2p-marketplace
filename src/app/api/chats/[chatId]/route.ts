import { NextResponse } from "next/server";
import { getChats } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;

    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ messages: chat.messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 