import { NextResponse } from "next/server";
import { getChats, saveChats } from "@/lib/utils";

// Handle POST requests (to create a new chat)
export async function POST(request: Request) {
  try {
    // Get the data from the request (the two users starting the chat)
    const { user1, user2, initialMessage } = await request.json();

    // Make sure we have both users
    if (!user1 || !user2) {
      return NextResponse.json(
        { error: "Missing user1 or user2" },
        { status: 400 }
      );
    }

    // Get the current chats from our "database"
    const data = await getChats();
    
    // Check if a chat between these users already exists
    const existingChat = data.chats.find((chat: any) => 
      (chat.user1 === user1 && chat.user2 === user2) || 
      (chat.user1 === user2 && chat.user2 === user1)
    );
    
    if (existingChat) {
      // If there's an initial message, add it to the existing chat
      if (initialMessage) {
        existingChat.messages.push({
          id: existingChat.messages.length + 1,
          sender: user1,
          content: initialMessage,
          timestamp: new Date().toISOString(),
          status: "sent"
        });
        await saveChats(data);
      }
      
      return NextResponse.json({ 
        chat: existingChat, 
        isNew: false 
      }, { status: 200 });
    }

    // Create a new chat
    const newChat = {
      id: data.chats.length + 1, // Simple ID (1, 2, 3...)
      user1,
      user2,
      createdAt: new Date().toISOString(),
      messages: initialMessage ? [
        {
          id: 1,
          sender: user1,
          content: initialMessage,
          timestamp: new Date().toISOString(),
          status: "sent"
        }
      ] : [],
    };

    // Add the new chat to the list
    data.chats.push(newChat);
    await saveChats(data);

    // Send back a success response
    return NextResponse.json({ 
      chat: newChat,
      isNew: true
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 