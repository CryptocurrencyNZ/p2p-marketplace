import { db } from "@/lib/db";
import { users, chats, chatParticipants, chatMessages } from "@/lib/db/schema";
import { findOrCreateUser, createChat, addMessageToChat } from "@/lib/db/utils";
import { eq } from "drizzle-orm";

// Main seed function
export async function seed() {
  try {
    console.log("Starting database seed...");

    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(chatMessages);
    await db.delete(chatParticipants);
    await db.delete(chats);
    await db.delete(users);

    // Create users
    console.log("Creating users...");
    const user1 = await findOrCreateUser("buyer123");
    const user2 = await findOrCreateUser("seller456");

    // Create first chat
    console.log("Creating chats with messages...");
    const chat1 = await createChat(user1.id, user2.id, "Hi, is this item still available?");
    
    if (!chat1) {
      throw new Error("Failed to create chat1");
    }

    // Add messages to the first chat
    await addMessageToChat(chat1.id, user2.id, "Yes, it's still available! Are you interested?");
    await addMessageToChat(chat1.id, user1.id, "Great! I'd like to know more about the specifications.");
    await addMessageToChat(chat1.id, user2.id, "It's a brand new model with the latest features.");
    
    // Create a file message
    await addMessageToChat(
      chat1.id, 
      user2.id, 
      "Here are the detailed specifications.", 
      true, 
      {
        fileType: "pdf",
        fileName: "product_specs.pdf",
        fileSize: "2.4 MB"
      }
    );

    await addMessageToChat(chat1.id, user1.id, "Thanks for the information!");
    
    // Star the chat
    await db.update(chats).set({ starred: true }).where(eq(chats.id, chat1.id));

    // Create a second chat for more data
    const user3 = await findOrCreateUser("trader789");
    const chat2 = await createChat(user1.id, user3.id, "Hello, I saw your listing for the NFT collection.");
    
    if (!chat2) {
      throw new Error("Failed to create chat2");
    }
    
    await addMessageToChat(chat2.id, user3.id, "Hi there! Yes, I'm selling a few pieces from that collection.");
    await addMessageToChat(chat2.id, user1.id, "What's your asking price for the rare ones?");
    await addMessageToChat(chat2.id, user3.id, "The floor price is 0.5 ETH, but we can negotiate.");

    console.log("Seed completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error };
  }
}

// If this file is executed directly
if (require.main === module) {
  seed()
    .then((result) => {
      console.log("Seed result:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
} 