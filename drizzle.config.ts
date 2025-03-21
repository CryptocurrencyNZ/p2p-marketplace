import { defineConfig } from "drizzle-kit";

import * as dotenv from "dotenv";
import fs from "fs";

// Load .env.development.local file directly
const envPath = ".env.development.local";
let databaseUrl = "";

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
  databaseUrl = process.env.DATABASE_URL || "";
}

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