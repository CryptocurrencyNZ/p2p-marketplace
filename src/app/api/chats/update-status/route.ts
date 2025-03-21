import { NextResponse } from "next/server";
import { updateMessageStatus } from "@/lib/db/utils";

export async function POST(request: Request) {
  try {
    const { chatId, messageId, status } = await request.json();

    if (!messageId || !status) {
      return NextResponse.json(
        { error: "Missing messageId or status" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["sent", "delivered", "read"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: sent, delivered, read" },
        { status: 400 }
      );
    }

    // Update message status in database
    // Note: messageId might come with 'm' prefix from frontend
    const messageIdNumber = messageId.toString().startsWith('m') 
      ? Number(messageId.toString().substring(1)) 
      : Number(messageId);
    
    const updatedMessage = await updateMessageStatus(
      messageIdNumber, 
      status
    );

    if (!updatedMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: {
        id: `m${updatedMessage.id}`,
        status: updatedMessage.status,
        chatId: updatedMessage.chatId
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in update message status endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 