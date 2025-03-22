// Make sure to install the 'postgres' package
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle({ client: queryClient });

const result = await db.execute("select 1");

// import { drizzle } from "drizzle-orm/node-postgres";

// export const db = drizzle(process.env.DATABASE_URL!);
