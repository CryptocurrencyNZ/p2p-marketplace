import * as dotenv from "dotenv";
import { existsSync, readFileSync } from "fs";

// Only try to read local env files in development
let databaseUrl = "";
if (process.env.NODE_ENV === 'development') {
  // Load environment variables from .env.development.local directly
  const envPath = ".env.development.local";
  
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
} else {
  // In production (Vercel), use the environment variables directly
  databaseUrl = process.env.DATABASE_URL || 
                process.env.POSTGRES_URL || 
                process.env.NEXT_PUBLIC_DATABASE_URL || 
                "";
}

const getEnvironmentVariable = (name: string, defaultValue?: string): string => {
  // For DATABASE_URL, handle special cases
  if (name === "DATABASE_URL") {
    // First check for DATABASE_URL directly
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }
    
    // Then check for Vercel Postgres URL
    if (process.env.POSTGRES_URL) {
      return process.env.POSTGRES_URL;
    }
    
    // Finally use our directly read value or default
    if (databaseUrl) {
      return databaseUrl;
    }
  }
  
  const value = process.env[name] || defaultValue;
  if (value === undefined) {
    console.warn(`Environment variable ${name} is not set, using default if provided`);
  }
  return value || "";
};

export const env = {
  NODE_ENV: getEnvironmentVariable("NODE_ENV", "development"),
  DATABASE_URL: getEnvironmentVariable("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/chat_app"),
  JWT_SECRET: getEnvironmentVariable("JWT_SECRET", "your-secret-key-change-in-production"),
  MESSAGE_EXPIRATION_HOURS: parseInt(getEnvironmentVariable("MESSAGE_EXPIRATION_HOURS", "24")),
}; 