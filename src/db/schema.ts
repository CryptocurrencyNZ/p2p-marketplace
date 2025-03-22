import {
  timestamp,
  pgTable,
  text,
  boolean,
  primaryKey,
  integer,
  numeric,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

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
  age: integer("age"),
  username: text("string").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
});

export const tradeSession = pgTable("trade_session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id),
  vendor_id: text("receiver_id")
    .notNull()
    .references(() => users.id),
  customer_id: text("customer_id")
    .notNull()
    .references(() => users.id),
  onChain: boolean("onchain").notNull(),
  vendor_start: boolean("vendor_start").default(false),
  customer_start: boolean("customer_start").default(false),

  vendor_wallet: text("vendor_wallet"),
  customer_wallet: text("customer_wallet"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  vendor_complete: numeric("vendor_complete"),
  customer_complete: numeric("customer_complete"),
});

// Chat schema - single table approach
export const messages = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fromVender: boolean("from_vendor").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  session_id: text("session_id")
    .notNull()
    .references(() => tradeSession.id),
});

// Starred chats table - tracks which users have starred which conversations
export const starredChats = pgTable(
  "starred_chats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id").notNull(),
  },
  (table) => {
    return {
      // Create a unique constraint on userId and conversationId
      // to prevent duplicate stars from the same user on same conversation
      userConversationUnique: unique().on(table.userId, table.conversationId),
    };
  },
);

export const listings = pgTable("listings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_auth_id: text("user_auth_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  price: numeric("price").notNull(),
  marginRate: numeric("margin_rate").notNull(),
  isBuy: boolean("is_buy").notNull(),
  currency: text("currency").notNull(),
  descrption: text("descrption").notNull(),
  onChainProof: boolean("on_chain_proof").notNull(),
  isComplete: boolean("is_complete").default(false),
});

export const elo = pgTable("userElo", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  auth_id: text("auth_id").unique(),
  elo: numeric("elo").default("-1"),
});