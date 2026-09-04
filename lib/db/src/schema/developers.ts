import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

export const developerRoles = [
  "developer",
  "senior_developer",
  "head_developer",
  "security",
] as const;
export type DeveloperRole = (typeof developerRoles)[number];

export const developersTable = pgTable("developers", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  username: text("username").notNull(),
  role: text("role").notNull().$type<DeveloperRole>(),
  addedBy: text("added_by").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type Developer = typeof developersTable.$inferSelect;
export type InsertDeveloper = typeof developersTable.$inferInsert;
