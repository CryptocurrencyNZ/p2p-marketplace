import { NextResponse } from "next/server";
import { getChats } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;

    const data = await getChats();
    const chat = data.chats.find((c: any) => c.id === Number(chatId));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get additional user information
    const otherUser = chat.user1 === "buyer123" ? chat.user2 : chat.user1;
    
    // Mock user data - in a real app this would come from a database
    const user = {
      name: otherUser === "seller456" ? "Alice Crypto" : "Bob Trader",
      address: otherUser,
      avatar: "/api/placeholder/48/48",
      status: "online",
      lastSeen: "Active now",
      verified: true
    };

    // Add status to messages if not present
    const messagesWithStatus = chat.messages.map((msg: any) => ({
      ...msg,
      status: msg.status || "delivered",
    }));

    return NextResponse.json({ 
      id: chat.id,
      user,
      messages: messagesWithStatus,
      encrypted: true,
      verified: true
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 