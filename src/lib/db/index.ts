import { drizzle } from "drizzle-orm/postgres-js";
import { Pool } from '@neondatabase/serverless';
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

// For use with Neon or other PostgreSQL providers
// Connection string in format: postgres://user:password@host:port/database
const connectionString = env.DATABASE_URL;

// Determine if we're in a serverless environment (Vercel Edge or serverless functions)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

let db;
let sql;

if (isServerless) {
  // For serverless environments (Vercel Edge, AWS Lambda)
  const pool = new Pool({ connectionString });
  // @ts-ignore - Known type issue with drizzle-orm and Neon serverless
  db = drizzle(pool, { schema });
  sql = pool;
} else {
  // For local development or dedicated servers
  const client = postgres(connectionString, { prepare: false });
  db = drizzle(client, { schema });
  sql = postgres(connectionString, { prepare: false });
}

export { db, sql }; 