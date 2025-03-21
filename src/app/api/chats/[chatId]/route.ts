import { NextResponse } from "next/server";
import { getChatById } from "@/lib/db/utils";
import { findOrCreateUser } from "@/lib/db/utils";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    // Get current user from query param (will be replaced with auth in production)
    const url = new URL(request.url);
    const currentUserName = url.searchParams.get("userId") || "buyer123";

    // Get user from database
    const currentUser = await findOrCreateUser(currentUserName);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get chat from database
    const chat = await getChatById(Number(chatId));
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Find the other participant
    const otherParticipant = chat.participants.find(
      (p) => p.userId !== currentUser.id
    );

    if (!otherParticipant) {
      return NextResponse.json({ error: "Chat participant not found" }, { status: 404 });
    }

    // Get the other user's info
    const otherUser = otherParticipant.user;
    
    // Format user data for frontend
    const formattedUser = {
      name: otherUser.username === "seller456" ? "Alice Crypto" : "Bob Trader",
      address: otherUser.username === "seller456" ? "0xF3b217A5F7A9a4D" : "0x1234...5678",
      avatar: "/api/placeholder/48/48",
      status: "online",
      lastSeen: "Active now",
      verified: true
    };

    // Process messages to match frontend format
    const formattedMessages = chat.messages.map((msg) => {
      // Format timestamp from ISO to AM/PM format
      const date = new Date(msg.timestamp);
      const formattedTime = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return {
        id: `m${msg.id}`, // Frontend uses string IDs with 'm' prefix
        sender: msg.senderId === currentUser.id ? "me" : "them",
        content: msg.content,
        timestamp: formattedTime,
        status: msg.status || "delivered",
        ...(msg.isFile && {
          isFile: true,
          fileType: msg.fileType || "pdf",
          fileName: msg.fileName || "document.pdf",
          fileSize: msg.fileSize || "1.2 MB"
        })
      };
    });

    return NextResponse.json({ 
      id: chat.id,
      user: formattedUser,
      messages: formattedMessages,
      encrypted: chat.encrypted,
      verified: chat.verified,
      starred: chat.starred
    }, { status: 200 });
  } catch (error) {
    console.error("Error in chat detail endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 