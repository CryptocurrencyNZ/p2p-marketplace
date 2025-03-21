import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import fs from "fs/promises"
import path from "path"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to get environment variable with fallback
function getEnvironmentVariable(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  NODE_ENV: getEnvironmentVariable("NODE_ENV", "development"),
  DATABASE_URL: getEnvironmentVariable("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/chat_app"),
  JWT_SECRET: getEnvironmentVariable("JWT_SECRET", "your-secret-key-change-in-production"),
  MESSAGE_EXPIRATION_HOURS: parseInt(getEnvironmentVariable("MESSAGE_EXPIRATION_HOURS", "24")),
};

// Path to our fake database file
const chatsFilePath = path.join(process.cwd(), "src/data/chats.json")

// Read the chats from the file
export async function getChats() {
  const fileContent = await fs.readFile(chatsFilePath, "utf-8")
  return JSON.parse(fileContent)
}

// Save chats to the file
export async function saveChats(data: any) {
  await fs.writeFile(chatsFilePath, JSON.stringify(data, null, 2), "utf-8")
  return data
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

// Format relative time based on timestamp
export function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? "Yesterday" : `${days} days ago`;
  } else if (diffInSeconds < 2419200) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Format user display data
export function formatUserDisplay(username: string) {
  switch (username) {
    case "seller456":
      return {
        name: "Alice Crypto",
        address: "0xF3b2...9a4D",
        fullAddress: "0xF3b217A5F7A9a4D",
        avatar: "/api/placeholder/40/40",
        status: "online"
      };
    case "trader789":
      return {
        name: "Bob Blockchain",
        address: "0x7D1c...3e5F",
        fullAddress: "0x7D1c3e5F",
        avatar: "/api/placeholder/40/40",
        status: "offline"
      };
    case "crypto_carol":
      return {
        name: "Carol Coinbase",
        address: "0x4A9d...7B2e",
        fullAddress: "0x4A9d7B2e",
        avatar: "/api/placeholder/40/40",
        status: "online"
      };
    case "defi_dave":
      return {
        name: "Dave DeFi",
        address: "0x2E6b...1F8c",
        fullAddress: "0x2E6b1F8c",
        avatar: "/api/placeholder/40/40",
        status: "idle"
      };
    case "eth_eve":
      return {
        name: "Eve Ethereum",
        address: "0x9C3a...8D2b",
        fullAddress: "0x9C3a8D2b",
        avatar: "/api/placeholder/40/40",
        status: "offline"
      };
    case "buyer123":
    default:
      return {
        name: "You",
        address: "0x1234...5678",
        fullAddress: "0x1234567890123456789012345678901234567890",
        avatar: "/api/placeholder/40/40",
        status: "online"
      };
  }
}
