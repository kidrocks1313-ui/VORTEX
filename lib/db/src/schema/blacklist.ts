import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

export const blacklistTable = pgTable("blacklist", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  username: text("username").notNull(),
  addedBy: text("added_by").notNull(),
  reason: text("reason"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type Blacklist = typeof blacklistTable.$inferSelect;
export type InsertBlacklist = typeof blacklistTable.$inferInsert;
