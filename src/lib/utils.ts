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
