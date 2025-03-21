import { NextResponse } from "next/server";
import { getChats, formatUserDisplay } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    // Get current user from query param (will be replaced with auth in production)
    const url = new URL(request.url);
    const currentUserName = url.searchParams.get("userId") || "buyer123";
    
    // Get chat from file
    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));
    
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Make sure the user is part of this chat
    if (chat.user1 !== currentUserName && chat.user2 !== currentUserName) {
      return NextResponse.json(
        { error: "User is not a participant in this chat" },
        { status: 403 }
      );
    }

    // Get the other user
    const otherUser = chat.user1 === currentUserName ? chat.user2 : chat.user1;
    
    // Format user data for frontend
    const userDisplay = formatUserDisplay(otherUser);
    
    // Process messages to match frontend format
    const formattedMessages = chat.messages.map((msg: any) => {
      // Format timestamp to AM/PM format
      const date = new Date(msg.timestamp);
      const formattedTime = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return {
        id: `m${msg.id}`, // Frontend uses string IDs with 'm' prefix
        sender: msg.sender === currentUserName ? "me" : "them",
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
      id: chat.id.toString(),
      user: {
        name: userDisplay.name,
        address: userDisplay.fullAddress, // Full address for the chat detail page
        avatar: "/api/placeholder/48/48", // Larger avatar for the chat page
        status: userDisplay.status,
        lastSeen: userDisplay.status === "online" ? "Active now" : "Last seen recently",
        verified: true
      },
      messages: formattedMessages,
      encrypted: chat.encrypted !== false, // Default to true if not specified
      verified: chat.verified !== false, // Default to true if not specified
      starred: chat.starred || false
    }, { status: 200 });
  } catch (error) {
    console.error("Error in chat detail endpoint:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 