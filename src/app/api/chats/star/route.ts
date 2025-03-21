import { NextResponse } from "next/server";
import { updateChatStarred } from "@/lib/db/utils";

export async function POST(request: Request) {
  try {
    const { chatId, starred } = await request.json();

    if (chatId === undefined) {
      return NextResponse.json(
        { error: "Missing chatId parameter" },
        { status: 400 }
      );
    }

    if (starred === undefined) {
      return NextResponse.json(
        { error: "Missing starred parameter" },
        { status: 400 }
      );
    }

    // Update chat starred status in database
    const updatedChat = await updateChatStarred(Number(chatId), Boolean(starred));
    
    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      chat: {
        id: updatedChat.id,
        starred: updatedChat.starred
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in star chat endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 