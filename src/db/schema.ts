import {
  timestamp,
  pgTable,
  text,
  boolean,
  primaryKey,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { number } from "zod";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Business logic schema
export const userProfile = pgTable("userProfiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  auth_id: text("auth_id").unique(),
  username: text("string").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
});

export const listings = pgTable("listings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_auth_id: text("user_auth_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  price: numeric("price").notNull(),
  isBuy: boolean("is_buy").notNull(),
  currency: text("currency").notNull(),
  crypto_type: text("crypto_type").notNull(),
  descrption: text("descrption").notNull(),
});

export const elo = pgTable("userElo", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  auth_id: text("auth_id").unique(),
  elo: numeric("elo").default("-1"),
});
