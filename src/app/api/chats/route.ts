import { NextResponse } from "next/server";
import { getChats } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    // Get the user ID from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get all chats from our database
    const data = await getChats();
    
    // Filter chats where the user is either user1 or user2
    const userChats = data.chats.filter(
      (chat: any) => chat.user1 === userId || chat.user2 === userId
    );

    return NextResponse.json({ chats: userChats }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 