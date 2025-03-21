import { NextResponse } from "next/server";
import { getChats, saveChats } from "@/lib/utils";

// Handle POST requests (to create a new chat)
export async function POST(request: Request) {
  try {
    // Get the data from the request (the two users starting the chat)
    const { user1, user2 } = await request.json();

    // Make sure we have both users
    if (!user1 || !user2) {
      return NextResponse.json(
        { error: "Missing user1 or user2" },
        { status: 400 }
      );
    }

    // Get the current chats from our "database"
    const data = await getChats();
    const newChat = {
      id: data.chats.length + 1, // Simple ID (1, 2, 3...)
      user1,
      user2,
      messages: [], // Start with no messages
    };

    // Add the new chat to the list
    data.chats.push(newChat);
    await saveChats(data);

    // Send back a success response
    return NextResponse.json({ chat: newChat }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 