import { defineConfig } from "drizzle-kit";

import * as dotenv from "dotenv";
import fs from "fs";

// Set default database URL
let databaseUrl = "";

// In development, try to read from local env file
if (process.env.NODE_ENV !== "production") {
  const envPath = ".env.development.local";
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL=([^\n]+)/);
      if (match && match[1]) {
        databaseUrl = match[1];
      }
    }
  } catch (error) {
    console.error("Error reading .env file:", error);
  }

  // Fallback to dotenv if direct read fails
  if (!databaseUrl) {
    dotenv.config({ path: envPath });
  }
}

// Check for environment variables (including Vercel's)
databaseUrl = process.env.DATABASE_URL || 
              process.env.POSTGRES_URL || 
              process.env.NEXT_PUBLIC_DATABASE_URL || 
              databaseUrl ||
              "postgres://postgres:postgres@localhost:5432/chat_app";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
}); 