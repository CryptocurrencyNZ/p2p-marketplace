import * as dotenv from "dotenv";
import { existsSync, readFileSync } from "fs";

// Load environment variables from .env.development.local directly
const envPath = ".env.development.local";
let databaseUrl = "";

// Try to read the database URL directly from the file
try {
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
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

const getEnvironmentVariable = (name: string, defaultValue?: string): string => {
  // For DATABASE_URL, use our directly read value if available
  if (name === "DATABASE_URL" && databaseUrl) {
    return databaseUrl;
  }
  
  const value = process.env[name] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

export const env = {
  NODE_ENV: getEnvironmentVariable("NODE_ENV", "development"),
  DATABASE_URL: getEnvironmentVariable("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/chat_app"),
  JWT_SECRET: getEnvironmentVariable("JWT_SECRET", "your-secret-key-change-in-production"),
  MESSAGE_EXPIRATION_HOURS: parseInt(getEnvironmentVariable("MESSAGE_EXPIRATION_HOURS", "24")),
}; 