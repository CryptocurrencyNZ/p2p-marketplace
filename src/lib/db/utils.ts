import { db } from "@/lib/db";
import { chats, chatParticipants, chatMessages, users } from "@/lib/db/schema";
import { and, eq, or } from "drizzle-orm";

// Get a chat by ID with all its messages
export async function getChatById(chatId: number) {
  // Get the chat
  const chatData = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    with: {
      messages: {
        orderBy: (messages) => messages.timestamp,
      },
      participants: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!chatData) return null;

  return chatData;
}

// Get all chats for a user
export async function getChatsByUserId(userId: number) {
  // Get all chats where the user is a participant
  const userChats = await db.query.chatParticipants.findMany({
    where: eq(chatParticipants.userId, userId),
    with: {
      chat: {
        with: {
          messages: {
            orderBy: (messages) => messages.timestamp,
            limit: 1,
          },
          participants: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  return userChats.map(participant => participant.chat);
}

// Create a new chat between two users
export async function createChat(user1Id: number, user2Id: number, initialMessage?: string) {
  // Start a transaction
  return await db.transaction(async (tx) => {
    // Create the chat
    const [newChat] = await tx
      .insert(chats)
      .values({
        starred: false,
        encrypted: true,
        verified: true,
      })
      .returning();

    // Add participants
    await tx.insert(chatParticipants).values([
      { chatId: newChat.id, userId: user1Id },
      { chatId: newChat.id, userId: user2Id },
    ]);

    // Add initial message if provided
    if (initialMessage) {
      await tx.insert(chatMessages).values({
        chatId: newChat.id,
        senderId: user1Id,
        content: initialMessage,
        status: "sent",
      });
    }

    // Return the new chat with participants
    return await getChatById(newChat.id);
  });
}

// Add a message to a chat
export async function addMessageToChat(chatId: number, senderId: number, content: string, isFile = false, fileData?: {
  fileType: string;
  fileName: string;
  fileSize: string;
}) {
  // Check if user is a participant in the chat
  const participant = await db.query.chatParticipants.findFirst({
    where: and(
      eq(chatParticipants.chatId, chatId),
      eq(chatParticipants.userId, senderId)
    ),
  });

  if (!participant) {
    throw new Error("User is not a participant in this chat");
  }

  // Create the message
  const [newMessage] = await db
    .insert(chatMessages)
    .values({
      chatId,
      senderId,
      content,
      status: "sent",
      isFile: isFile,
      ...(isFile && fileData && {
        fileType: fileData.fileType,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
      }),
    })
    .returning();

  return newMessage;
}

// Update message status
export async function updateMessageStatus(messageId: number, status: "sent" | "delivered" | "read") {
  const [updatedMessage] = await db
    .update(chatMessages)
    .set({ status })
    .where(eq(chatMessages.id, messageId))
    .returning();

  return updatedMessage;
}

// Star or unstar a chat
export async function updateChatStarred(chatId: number, starred: boolean) {
  const [updatedChat] = await db
    .update(chats)
    .set({ starred })
    .where(eq(chats.id, chatId))
    .returning();

  return updatedChat;
}

// Find or create a user by username
export async function findOrCreateUser(username: string) {
  // Look for existing user
  let user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  // If not found, create a new one
  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        passwordHash: "placeholder", // In a real app, use proper password hashing
        hasSeenDisclaimer: true,
      })
      .returning();
    
    user = newUser;
  }

  return user;
} 