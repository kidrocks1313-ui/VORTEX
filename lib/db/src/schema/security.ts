import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const securitySettingsTable = pgTable("security_settings", {
  guildId: text("guild_id").primaryKey(),
  antiRaidEnabled: boolean("anti_raid_enabled").default(true).notNull(),
  antiSpamEnabled: boolean("anti_spam_enabled").default(true).notNull(),
  antiNukeEnabled: boolean("anti_nuke_enabled").default(true).notNull(),
  logChannelId: text("log_channel_id"),
});

export type SecuritySettings = typeof securitySettingsTable.$inferSelect;
