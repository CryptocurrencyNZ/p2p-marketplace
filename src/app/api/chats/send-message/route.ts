import { NextResponse } from "next/server";
import { addMessageToChat, findOrCreateUser } from "@/lib/db/utils";

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

    // Find user in database
    const user = await findOrCreateUser(sender);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare file data if this is a file message
    let fileData;
    if (isFile) {
      fileData = {
        fileType: fileType || "unknown",
        fileName: fileName || "file",
        fileSize: fileSize || "1 KB"
      };
    }

    // Add message to chat in database
    try {
      const newMessage = await addMessageToChat(
        Number(chatId),
        user.id,
        content,
        Boolean(isFile),
        isFile ? fileData : undefined
      );

      // Format timestamp for response
      const date = new Date(newMessage.timestamp);
      const formattedTime = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Return the newly created message in the format expected by the frontend
      return NextResponse.json({
        message: {
          id: newMessage.id.toString(),
          sender: "me", // Always "me" from sender's perspective
          content: newMessage.content,
          timestamp: formattedTime,
          status: newMessage.status || "sent",
          ...(isFile && {
            isFile,
            fileType: newMessage.fileType || fileType,
            fileName: newMessage.fileName || fileName,
            fileSize: newMessage.fileSize || fileSize
          })
        }
      }, { status: 201 });
    } catch (err) {
      if (err instanceof Error && err.message === "User is not a participant in this chat") {
        return NextResponse.json(
          { error: err.message },
          { status: 403 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 