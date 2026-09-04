import { Client, EmbedBuilder, Events, Message, TextChannel } from "discord.js";
import { db, securitySettingsTable, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { OWNER_IDS } from "../lib/permissions.js";

// userId+guildId -> message timestamps
const msgTracker = new Map<string, number[]>();
const SPAM_THRESHOLD = 6;     // messages
const SPAM_TIMEFRAME = 4_000; // ms
const MENTION_LIMIT = 5;
const MUTE_DURATION = 5 * 60 * 1000; // 5 min

async function isStaff(userId: string): Promise<boolean> {
  if (OWNER_IDS.includes(userId)) return true;
  const devs = await db.select().from(developersTable).where(eq(developersTable.userId, userId));
  return devs.length > 0;
}

async function logAction(client: Client, guildId: string, embed: EmbedBuilder) {
  const settings = await db.select().from(securitySettingsTable).where(eq(securitySettingsTable.guildId, guildId));
  if (settings[0]?.logChannelId) {
    try {
      const ch = await client.channels.fetch(settings[0].logChannelId) as TextChannel;
      await ch.send({ embeds: [embed] });
    } catch { /* skip */ }
  }
}

export function setupAntiSpam(client: Client) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const settings = await db.select().from(securitySettingsTable).where(eq(securitySettingsTable.guildId, guildId));
    if (settings.length > 0 && !settings[0]!.antiSpamEnabled) return;
    if (await isStaff(message.author.id)) return;

    const member = message.guild.members.cache.get(message.author.id);
    if (!member || !member.moderatable) return;

    // ── Anti mention spam ──
    const mentions = message.mentions.users.size + message.mentions.roles.size;
    if (mentions >= MENTION_LIMIT) {
      await message.delete().catch(() => null);
      await member.timeout(MUTE_DURATION, "Anti-Spam: Mass mention");

      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle("⚠️ Mass Mention Detected")
        .addFields(
          { name: "User", value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
          { name: "Mentions", value: `${mentions}`, inline: true },
          { name: "Action", value: "Muted for 5 minutes", inline: true },
        )
        .setTimestamp();

      await logAction(client, guildId, embed);

      message.author.send("⚠️ You have been muted for **5 minutes** for mass mentioning users.").catch(() => null);
      return;
    }

    // ── Anti message spam ──
    const key = `${message.author.id}:${guildId}`;
    const now = Date.now();
    const timestamps = msgTracker.get(key) ?? [];
    const recent = timestamps.filter((t) => now - t < SPAM_TIMEFRAME);
    recent.push(now);
    msgTracker.set(key, recent);

    if (recent.length >= SPAM_THRESHOLD) {
      msgTracker.delete(key);
      await member.timeout(MUTE_DURATION, "Anti-Spam: Message spam");

      // Delete recent messages
      try {
        const msgs = await message.channel.messages.fetch({ limit: 10 });
        const toDelete = msgs.filter((m) => m.author.id === message.author.id);
        await (message.channel as TextChannel).bulkDelete(toDelete, true);
      } catch { /* skip */ }

      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle("⚠️ Spam Detected")
        .addFields(
          { name: "User", value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
          { name: "Messages", value: `${recent.length} in 4s`, inline: true },
          { name: "Action", value: "Muted for 5 minutes", inline: true },
        )
        .setTimestamp();

      await logAction(client, guildId, embed);
      message.author.send("⚠️ You have been muted for **5 minutes** for spamming.").catch(() => null);
    }
  });
}
