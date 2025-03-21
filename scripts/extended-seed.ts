import { db } from "@/lib/db";
import { users, chats, chatParticipants, chatMessages } from "@/lib/db/schema";
import { findOrCreateUser } from "@/lib/db/utils";
import { eq } from "drizzle-orm";

// Sample data for conversations
const cryptoMessages = [
  "Have you seen the latest price action?",
  "I think this is a great opportunity to accumulate more tokens.",
  "The market seems to be recovering nicely.",
  "What's your take on the new upgrade coming next month?",
  "I've been staking my tokens for passive income.",
  "Gas fees are much lower these days.",
  "Do you prefer hardware wallets or software wallets?",
  "Have you tried any of the Layer 2 solutions?",
  "I'm bullish on the long-term prospects of this project.",
  "The team just published a new roadmap. Looks promising!",
  "Did you participate in the recent airdrop?",
  "I'm thinking of setting up a validator node.",
  "The DEX volume has been increasing steadily.",
  "This NFT collection seems to be gaining traction.",
  "Smart contract audits are essential before investing."
];

const tradingMessages = [
  "I'm looking to swap some tokens at a good rate.",
  "Would you be interested in an OTC trade?",
  "What's your asking price for this collectible?",
  "I can offer 1.5 ETH for the entire set.",
  "Let me check the current market value before making an offer.",
  "Would you consider a partial trade + partial payment?",
  "I've been collecting these NFTs since the beginning.",
  "The floor price has been steadily increasing.",
  "Are you flexible on the price?",
  "I can send the funds immediately if we agree on terms.",
  "Do you accept stablecoins as payment?",
  "Would you be willing to use an escrow service?",
  "I'm looking for rare items from this collection specifically.",
  "Can you prove provenance for this NFT?",
  "Let's finalize this deal soon before prices change."
];

const technicalMessages = [
  "I'm having issues connecting my wallet to the dApp.",
  "Have you tried the beta version of the platform?",
  "What node provider do you recommend?",
  "The smart contract needs optimization to reduce gas costs.",
  "I'm implementing EIP-1559 support in my project.",
  "Can you help debug this transaction issue?",
  "The API documentation seems outdated.",
  "I'm looking for a reliable oracle solution.",
  "What security measures do you have in place?",
  "Have you considered using a multisig wallet?",
  "I'm experimenting with zero-knowledge proofs.",
  "The indexing service isn't capturing all events.",
  "Solidity 0.8 has some nice safety features built-in.",
  "I'm working on a cross-chain bridge solution.",
  "Do you have experience with custom governance systems?"
];

const fileMessages = [
  { msg: "Here's the whitepaper for the project.", type: "pdf", name: "whitepaper_v2.pdf", size: "3.2 MB" },
  { msg: "Check out this transaction analysis.", type: "csv", name: "tx_analysis.csv", size: "1.7 MB" },
  { msg: "I created this diagram of the token economics.", type: "image", name: "tokenomics.png", size: "856 KB" },
  { msg: "This is the smart contract code we discussed.", type: "text", name: "contract.sol", size: "12 KB" },
  { msg: "Here's a screenshot of the error message.", type: "image", name: "error_screenshot.jpg", size: "1.1 MB" },
  { msg: "I've prepared a presentation about the project.", type: "ppt", name: "project_overview.pptx", size: "4.5 MB" },
  { msg: "The audit report from the security firm.", type: "pdf", name: "security_audit.pdf", size: "2.3 MB" },
  { msg: "Here's a sample dataset for testing.", type: "json", name: "test_data.json", size: "950 KB" }
];

// Array of usernames for creating a larger user base
const usernames = [
  "crypto_king", "blockchain_queen", "nft_collector", "defi_wizard",
  "token_trader", "eth_enthusiast", "bitcoin_baron", "web3_wanderer",
  "smart_contract_dev", "wallet_warrior", "hash_hunter", "chain_champion",
  "block_explorer", "validator_victor", "staking_star", "protocol_pioneer",
  "dapp_developer", "crypto_connector", "meta_mask", "neon_node"
];

// Function to get random items from an array
function getRandomItems(array: any[], count: number) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to get a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Our own create chat function that doesn't rely on getChatById
async function createChatDirectly(user1Id: number, user2Id: number, initialMessage: string) {
  try {
    // Create the chat
    const [newChat] = await db
      .insert(chats)
      .values({
        starred: false,
        encrypted: true,
        verified: true,
      })
      .returning();
      
    if (!newChat) {
      throw new Error("Failed to create chat record");
    }
    
    // Add participants
    await db.insert(chatParticipants).values([
      { chatId: newChat.id, userId: user1Id },
      { chatId: newChat.id, userId: user2Id },
    ]);

    // Add initial message if provided
    if (initialMessage) {
      await db.insert(chatMessages).values({
        chatId: newChat.id,
        senderId: user1Id,
        content: initialMessage,
        status: "sent",
      });
    }

    return newChat;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
}

// Our own function to add a message directly
async function addMessageDirectly(chatId: number, senderId: number, content: string, isFile = false, fileData?: {
  fileType: string;
  fileName: string;
  fileSize: string;
}) {
  try {
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
  } catch (error) {
    console.error(`Error adding message to chat ${chatId}:`, error);
    return null;
  }
}

// Extended seed function
async function extendedSeed() {
  try {
    console.log("Starting extended database seed...");

    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(chatMessages);
    await db.delete(chatParticipants);
    await db.delete(chats);
    await db.delete(users);

    // Create a large pool of users
    console.log("Creating user pool...");
    const createdUsers = [];
    
    // Create the main user
    const mainUser = await findOrCreateUser("buyer123");
    createdUsers.push(mainUser);
    
    // Create additional users
    for (const username of usernames) {
      const user = await findOrCreateUser(username);
      createdUsers.push(user);
    }
    
    console.log(`Created ${createdUsers.length} users`);

    // Create multiple chats for the main user
    console.log("Creating chats...");
    const totalChats = 20;
    const createdChats = [];

    for (let i = 0; i < totalChats; i++) {
      // Skip the main user when selecting a random user
      let otherUser;
      do {
        otherUser = createdUsers[getRandomInt(1, createdUsers.length - 1)];
      } while (otherUser.id === mainUser.id);
      
      // Determine chat type to select appropriate message set
      const chatType = i % 3;
      let messageSet;
      
      if (chatType === 0) {
        messageSet = cryptoMessages;
      } else if (chatType === 1) {
        messageSet = tradingMessages;
      } else {
        messageSet = technicalMessages;
      }
      
      // Create initial message
      const initialMessage = messageSet[getRandomInt(0, messageSet.length - 1)];
      
      // Create the chat using our direct function
      const chat = await createChatDirectly(mainUser.id, otherUser.id, initialMessage);
      
      if (!chat) {
        console.error(`Failed to create chat with ${otherUser.username}`);
        continue;
      }
      
      console.log(`Created chat ${chat.id} with ${otherUser.username}`);
      createdChats.push(chat);
      
      // Add random number of messages to the chat (3-15)
      const messageCount = getRandomInt(3, 15);
      const selectedMessages = getRandomItems(messageSet, messageCount);
      
      // Alternate between users for messages
      let currentSender = getRandomInt(0, 1) === 0 ? mainUser : otherUser;
      
      for (const message of selectedMessages) {
        await addMessageDirectly(chat.id, currentSender.id, message);
        
        // Switch sender for next message
        currentSender = currentSender.id === mainUser.id ? otherUser : mainUser;
      }
      
      // Randomly add file messages (20% chance)
      if (Math.random() < 0.2) {
        const fileMessage = fileMessages[getRandomInt(0, fileMessages.length - 1)];
        await addMessageDirectly(
          chat.id,
          otherUser.id,
          fileMessage.msg,
          true,
          {
            fileType: fileMessage.type,
            fileName: fileMessage.name,
            fileSize: fileMessage.size
          }
        );
      }
      
      // Randomly star chats (30% chance)
      if (Math.random() < 0.3) {
        await db.update(chats).set({ starred: true }).where(eq(chats.id, chat.id));
      }
    }
    
    console.log(`Created ${createdChats.length} chats with messages`);
    console.log("Extended seed completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error };
  }
}

// Execute the seed function
extendedSeed()
  .then((result) => {
    console.log("Seed result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  }); 