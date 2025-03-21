import { pgTable, serial, varchar, boolean, integer, timestamp, text, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  hasSeenDisclaimer: boolean("has_seen_disclaimer").default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
  sentMessages: many(messages),
  receivedMessages: many(messages),
  blocked: many(blockedUsers, { relationName: "blocker" }),
  blockedBy: many(blockedUsers, { relationName: "blocked" }),
}));

export const blockedUsers = pgTable("blocked_users", {
  blockerId: integer("blocker_id").references(() => users.id).notNull(),
  blockedId: integer("blocked_id").references(() => users.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.blockerId, table.blockedId] }),
}));

export const blockedUsersRelations = relations(blockedUsers, ({ one }) => ({
  blocker: one(users, {
    fields: [blockedUsers.blockerId],
    references: [users.id],
    relationName: "blocker",
  }),
  blocked: one(users, {
    fields: [blockedUsers.blockedId],
    references: [users.id],
    relationName: "blocked",
  }),
}));

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type NewBlockedUser = typeof blockedUsers.$inferInsert; 