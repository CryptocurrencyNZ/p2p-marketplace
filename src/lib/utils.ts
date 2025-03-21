import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import fs from "fs/promises"
import path from "path"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Path to our fake database file
const chatsFilePath = path.join(process.cwd(), "src/data/chats.json")

// Read the chats from the file
export async function getChats() {
  const fileContent = await fs.readFile(chatsFilePath, "utf-8")
  return JSON.parse(fileContent)
}

// Save chats to the file
export async function saveChats(chats: any) {
  await fs.writeFile(chatsFilePath, JSON.stringify(chats, null, 2))
}

// Update message status
export async function updateMessageStatus(chatId: number, messageId: number, status: 'sent' | 'delivered' | 'read') {
  // Get current chats
  const data = await getChats();
  
  // Find the chat
  const chat = data.chats.find((c: any) => c.id === chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  
  // Find the message
  const message = chat.messages.find((m: any) => m.id === messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  
  // Update status
  message.status = status;
  
  // Save changes
  await saveChats(data);
  
  return message;
}
