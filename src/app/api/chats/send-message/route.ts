import { NextResponse } from "next/server";
import { addMessageToChat, findOrCreateUser, getChatById } from "@/lib/db/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, sender, content, isFile, fileType, fileName, fileSize } = body;

    if (!chatId || !sender || !content) {
      return NextResponse.json(
        { error: "Missing chatId, sender, or content" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await findOrCreateUser(sender);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if chat exists
    const chat = await getChatById(Number(chatId));
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Create new message in database
    const newMessage = await addMessageToChat(
      Number(chatId), 
      user.id, 
      content,
      isFile || false,
      isFile ? { fileType, fileName, fileSize } : undefined
    );

    // Format message for frontend display
    const formattedMessage = {
      id: `m${newMessage.id}`,
      sender: "me", // It's always "me" for the sender
      content: newMessage.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: newMessage.status,
      ...(isFile && { isFile, fileType, fileName, fileSize })
    };

    return NextResponse.json({ 
      message: formattedMessage,
      originalMessage: newMessage,
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error("Error in send message endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 