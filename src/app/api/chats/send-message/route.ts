import { NextResponse } from "next/server";
import { getChats, saveChats } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, content, sender, isFile, fileType, fileName, fileSize } = body;

    if (!chatId || !content || !sender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = await getChats();
    const chatIndex = data.chats.findIndex((c: any) => c.id === Number(chatId));

    if (chatIndex === -1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chat = data.chats[chatIndex];
    
    // Verify sender is part of this chat
    if (chat.user1 !== sender && chat.user2 !== sender) {
      return NextResponse.json(
        { error: "User is not a participant in this chat" },
        { status: 403 }
      );
    }

    // Generate new message ID
    const messageId = chat.messages.length > 0 
      ? Math.max(...chat.messages.map((m: any) => m.id)) + 1 
      : 1;

    // Create the new message
    const newMessage = {
      id: messageId,
      sender,
      content,
      timestamp: new Date().toISOString(),
      status: "sent"
    };

    // Add file info if this is a file message
    if (isFile) {
      Object.assign(newMessage, {
        isFile,
        fileType,
        fileName,
        fileSize
      });
    }

    // Add message to chat
    chat.messages.push(newMessage);
    
    // Update the chat in the data
    data.chats[chatIndex] = chat;
    
    // Save updated data
    await saveChats(data);

    // Format timestamp for response
    const date = new Date(newMessage.timestamp);
    const formattedTime = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Return the newly created message in the format expected by the frontend
    return NextResponse.json({
      id: `m${newMessage.id}`,
      sender: "me", // Always "me" from sender's perspective
      content: newMessage.content,
      timestamp: formattedTime,
      status: "sent",
      ...(isFile && {
        isFile,
        fileType,
        fileName,
        fileSize
      })
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 