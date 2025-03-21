import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/env";
import { parse } from "pg-connection-string";

// Parse the connection string into components
const dbConfig = parse(env.DATABASE_URL);

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: dbConfig.host || "localhost",
    user: dbConfig.user || "postgres",
    password: dbConfig.password || "postgres",
    database: dbConfig.database || "chat_app",
    port: dbConfig.port ? parseInt(dbConfig.port) : 5432,
    ssl: !!dbConfig.ssl
  },
  verbose: true,
  strict: true,
}); 