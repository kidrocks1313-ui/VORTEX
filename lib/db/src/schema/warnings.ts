import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

export const warningsTable = pgTable("warnings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  guildId: text("guild_id").notNull(),
  reason: text("reason").notNull(),
  warnedBy: text("warned_by").notNull(),
  warnedAt: timestamp("warned_at").defaultNow().notNull(),
});

export type Warning = typeof warningsTable.$inferSelect;
export type InsertWarning = typeof warningsTable.$inferInsert;
