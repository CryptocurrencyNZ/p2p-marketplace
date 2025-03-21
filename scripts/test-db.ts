import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import fs from 'fs';

// Print environment variables directly from file
console.log("Reading .env.development.local file directly:");
try {
  const envContent = fs.readFileSync('.env.development.local', 'utf8');
  console.log(envContent);
} catch (error) {
  console.error("Error reading .env file:", error);
}

// Load environment variables from .env.development.local
console.log("Loading environment variables with dotenv:");
dotenv.config({ path: ".env.development.local" });

// Print all environment variables
console.log("Environment variables after dotenv.config():");
Object.keys(process.env).forEach(key => {
  if (key.includes("DATABASE")) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

async function testConnection() {
  // Get the database URL directly from the environment file
  const databaseUrlFromEnv = process.env.DATABASE_URL;
  
  // Get the URL directly from the file content
  let databaseUrl = databaseUrlFromEnv;
  
  // If we still don't have a valid URL, use the one from Neon in .env.development.local
  if (!databaseUrl || databaseUrl === "postgres://postgres:postgres@localhost:5432/chat_app") {
    try {
      const envContent = fs.readFileSync('.env.development.local', 'utf8');
      const match = envContent.match(/DATABASE_URL=([^\n]+)/);
      if (match && match[1]) {
        databaseUrl = match[1];
      }
    } catch (error) {
      console.error("Error reading .env file for URL:", error);
    }
  }
  
  console.log("Testing database connection...");
  console.log("Database URL from env:", databaseUrlFromEnv);
  console.log("Database URL to use:", databaseUrl);
  
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined. Please check your .env.development.local file.");
    return;
  }
  
  try {
    // Create a new postgres client and drizzle instance
    const client = postgres(databaseUrl, { prepare: false });
    const db = drizzle(client, { schema });
    
    // Try to execute a simple query
    const result = await db.query.users.findMany({
      limit: 5
    });
    
    console.log("Connection successful!");
    console.log("Found users:", result.length);
    
    if (result.length > 0) {
      console.log("Sample user:", {
        id: result[0].id,
        username: result[0].username
      });
    } else {
      console.log("No users found. Let's create a test user.");
      
      // Create a test user if none exist
      const [newUser] = await db.insert(schema.users).values({
        username: "test_user",
        passwordHash: "not_a_real_hash",
        hasSeenDisclaimer: true
      }).returning();
      
      console.log("Created test user:", newUser);
    }
    
    // Close the connection
    await client.end();
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

testConnection().catch(console.error); 