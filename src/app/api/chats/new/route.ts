import { NextResponse } from "next/server";
import { getChats, saveChats, formatUserDisplay } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user1, user2, initialMessage } = body;

    if (!user1 || !user2 || !initialMessage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if these users already have a chat
    const data = await getChats();
    const existingChat = data.chats.find((chat: any) => 
      (chat.user1 === user1 && chat.user2 === user2) || 
      (chat.user1 === user2 && chat.user2 === user1)
    );

    if (existingChat) {
      // Return the existing chat instead of creating a new one
      const otherUser = existingChat.user1 === user1 ? existingChat.user2 : existingChat.user1;
      const userDisplay = formatUserDisplay(otherUser);

      return NextResponse.json({ 
        id: existingChat.id.toString(),
        user: {
          name: userDisplay.name,
          address: userDisplay.address,
          avatar: userDisplay.avatar,
          status: userDisplay.status,
        },
        existing: true
      }, { status: 200 });
    }

    // Create a new chat with an incrementing ID
    const newChatId = data.chats.length > 0 
      ? Math.max(...data.chats.map((c: any) => c.id)) + 1 
      : 1;

    const newChat = {
      id: newChatId,
      user1,
      user2,
      starred: false,
      encrypted: true,
      verified: true,
      messages: [
        {
          id: 1,
          sender: user1,
          content: initialMessage,
          timestamp: new Date().toISOString(),
          status: "sent"
        }
      ]
    };

    // Add the new chat to the data
    data.chats.push(newChat);
    
    // Save updated data
    await saveChats(data);

    // Format and return the new chat
    const userDisplay = formatUserDisplay(user2);

    return NextResponse.json({ 
      id: newChatId.toString(),
      user: {
        name: userDisplay.name,
        address: userDisplay.address,
        avatar: userDisplay.avatar,
        status: userDisplay.status,
      },
      existing: false
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 