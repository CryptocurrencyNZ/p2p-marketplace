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
    const buyer = await findOrCreateUser("buyer123");
    const alice = await findOrCreateUser("seller456");
    const bob = await findOrCreateUser("trader789");
    const carol = await findOrCreateUser("crypto_carol");
    const dave = await findOrCreateUser("defi_dave");
    const eve = await findOrCreateUser("eth_eve");

    // Create first chat (Alice Crypto - active and starred)
    console.log("Creating chats with messages...");
    const chat1 = await createChat(buyer.id, alice.id, "Hi, is this item still available?");
    
    if (!chat1) {
      throw new Error("Failed to create chat with Alice");
    }

    // Add messages to the first chat
    await addMessageToChat(chat1.id, alice.id, "Yes, it's still available! Are you interested?");
    await addMessageToChat(chat1.id, buyer.id, "Great! I'd like to know more about the specifications.");
    await addMessageToChat(chat1.id, alice.id, "It's a brand new model with the latest features.");
    
    // Create a file message
    await addMessageToChat(
      chat1.id, 
      alice.id, 
      "Here are the detailed specifications.", 
      true, 
      {
        fileType: "pdf",
        fileName: "product_specs.pdf",
        fileSize: "2.4 MB"
      }
    );

    await addMessageToChat(chat1.id, buyer.id, "Thanks for the information! By the way, have you checked the latest token price?");
    await addMessageToChat(chat1.id, alice.id, "Yes, it's up 15% today. Good time to buy more.");
    await addMessageToChat(chat1.id, buyer.id, "I agree. I'll let you know my decision about the item by tomorrow.");
    
    // Star the chat
    await db.update(chats).set({ starred: true }).where(eq(chats.id, chat1.id));

    // Create a second chat with Bob (more casual conversation)
    const chat2 = await createChat(buyer.id, bob.id, "Hello, I saw your listing for the NFT collection.");
    
    if (!chat2) {
      throw new Error("Failed to create chat with Bob");
    }
    
    await addMessageToChat(chat2.id, bob.id, "Hi there! Yes, I'm selling a few pieces from that collection.");
    await addMessageToChat(chat2.id, buyer.id, "What's your asking price for the rare ones?");
    await addMessageToChat(chat2.id, bob.id, "The floor price is 0.5 ETH, but we can negotiate.");
    await addMessageToChat(chat2.id, buyer.id, "That sounds reasonable. When was the last time you checked the price?");
    await addMessageToChat(chat2.id, bob.id, "AHAHAHAHAH");
    await addMessageToChat(chat2.id, buyer.id, "?");
    await addMessageToChat(chat2.id, bob.id, "Sorry, wrong chat! The last price check was this morning.");

    // Create a third chat with Carol (with unread messages)
    const chat3 = await createChat(buyer.id, carol.id, "Hi Carol, I'm interested in your smart contract services.");
    
    if (!chat3) {
      throw new Error("Failed to create chat with Carol");
    }
    
    await addMessageToChat(chat3.id, carol.id, "Hello! I'd be happy to discuss my services.");
    await addMessageToChat(chat3.id, buyer.id, "Great! What's your rate for developing a custom NFT marketplace?");
    await addMessageToChat(chat3.id, carol.id, "It depends on the complexity, but typically around 3 ETH for a basic setup.");
    await addMessageToChat(chat3.id, buyer.id, "That works for my budget. Can you show me some previous work?");
    
    // Add a recent message that will be unread
    const unreadMsg1 = await addMessageToChat(chat3.id, carol.id, "The smart contract has been deployed successfully");
    await db.update(chatMessages).set({ status: "delivered" }).where(eq(chatMessages.id, unreadMsg1.id));

    // Create a fourth chat with Dave (starred but without recent activity)
    const chat4 = await createChat(buyer.id, dave.id, "Hey Dave, I need help with staking.");
    
    if (!chat4) {
      throw new Error("Failed to create chat with Dave");
    }
    
    await addMessageToChat(chat4.id, dave.id, "Hi there! What are you trying to stake?");
    await addMessageToChat(chat4.id, buyer.id, "Some ETH, but I'm not sure which protocol to use.");
    await addMessageToChat(chat4.id, dave.id, "I'd recommend Lido or Rocket Pool for ETH staking. They're the most established.");
    await addMessageToChat(chat4.id, buyer.id, "Thanks! I'll look into those options.");
    await addMessageToChat(chat4.id, dave.id, "No problem! Let me know if you need more help.");
    await addMessageToChat(chat4.id, buyer.id, "Can you help me with the staking process?");
    
    // Star this chat
    await db.update(chats).set({ starred: true }).where(eq(chats.id, chat4.id));

    // Create a fifth chat with Eve (old conversation)
    const chat5 = await createChat(buyer.id, eve.id, "Hi Eve, are you going to the Ethereum conference?");
    
    if (!chat5) {
      throw new Error("Failed to create chat with Eve");
    }
    
    await addMessageToChat(chat5.id, eve.id, "Hey! Yes, I'll be there. Are you presenting?");
    await addMessageToChat(chat5.id, buyer.id, "No, just attending. Maybe we can meet up?");
    await addMessageToChat(chat5.id, eve.id, "Definitely! Let's coordinate closer to the date.");
    await addMessageToChat(chat5.id, buyer.id, "Sounds good!");
    await addMessageToChat(chat5.id, eve.id, "Looking forward to the new protocol update");

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