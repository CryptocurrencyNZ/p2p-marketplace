import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

// For use with Neon or other PostgreSQL providers
// Connection string in format: postgres://user:password@host:port/database
const connectionString = env.DATABASE_URL;

// For use in server environments (edge: true = Vercel Edge Functions)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Creating a clean client without drizzle for raw SQL if needed
export const sql = postgres(connectionString, { prepare: false }); 