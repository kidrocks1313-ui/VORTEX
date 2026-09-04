import { Client, EmbedBuilder, Events, TextChannel, AuditLogEvent } from "discord.js";
import { db, developersTable, securitySettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { OWNER_IDS } from "../lib/permissions.js";

// userId -> deletion timestamps
const nukeTracker = new Map<string, number[]>();
const NUKE_THRESHOLD = 3;     // deletions
const NUKE_TIMEFRAME = 10_000; // ms

async function isStaff(userId: string): Promise<boolean> {
  if (OWNER_IDS.includes(userId)) return true;
  const devs = await db.select().from(developersTable).where(eq(developersTable.userId, userId));
  return devs.length > 0;
}

async function alertStaff(client: Client, embed: EmbedBuilder, guildName: string) {
  const allDevs = await db.select().from(developersTable);
  const allIds = [...new Set([...OWNER_IDS, ...allDevs.map((d) => d.userId)])];
  for (const userId of allIds) {
    try {
      const user = await client.users.fetch(userId);
      await user.send({ content: `<@${userId}> 🚨 **NUKE ALERT in ${guildName}!**`, embeds: [embed] });
    } catch { /* DMs disabled */ }
  }
}

async function trackDeletion(client: Client, guildId: string, auditEvent: AuditLogEvent) {
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const settings = await db.select().from(securitySettingsTable).where(eq(securitySettingsTable.guildId, guildId));
    if (settings.length > 0 && !settings[0]!.antiNukeEnabled) return;

    // Fetch audit logs to find executor
    const logs = await guild.fetchAuditLogs({ type: auditEvent, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || !entry.executor) return;

    const executorId = entry.executor.id;
    if (await isStaff(executorId)) return;

    const now = Date.now();
    const key = `${executorId}:${guildId}`;
    const timestamps = nukeTracker.get(key) ?? [];
    const recent = timestamps.filter((t) => now - t < NUKE_TIMEFRAME);
    recent.push(now);
    nukeTracker.set(key, recent);

    if (recent.length >= NUKE_THRESHOLD) {
      nukeTracker.delete(key);

      const member = guild.members.cache.get(executorId);
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("💣 NUKE ATTEMPT DETECTED")
        .setDescription(`A user has mass-deleted **${recent.length}** channels/roles in the last 10 seconds in **${guild.name}**.`)
        .addFields(
          { name: "Executor", value: `${entry.executor.tag} (<@${executorId}>)`, inline: true },
          { name: "Deletions", value: `${recent.length}`, inline: true },
          { name: "Action", value: member ? "Kicked" : "Not in server", inline: true },
        )
        .setTimestamp();

      // Kick the nuker
      try {
        await member?.kick("🛡️ Anti-Nuke: Mass deletion detected");
      } catch { /* skip */ }

      await alertStaff(client, embed, guild.name);

      // Log to log channel
      if (settings[0]?.logChannelId) {
        try {
          const logCh = await client.channels.fetch(settings[0].logChannelId) as TextChannel;
          await logCh.send({ embeds: [embed] });
        } catch { /* skip */ }
      }

      console.log(`💣 Nuke attempt detected in ${guild.name} by ${entry.executor.tag}`);
    }
  } catch { /* skip */ }
}

export function setupAntiNuke(client: Client) {
  client.on(Events.ChannelDelete, async (channel) => {
    if (!("guild" in channel)) return;
    await trackDeletion(client, channel.guild.id, AuditLogEvent.ChannelDelete);
  });

  client.on(Events.GuildRoleDelete, async (role) => {
    await trackDeletion(client, role.guild.id, AuditLogEvent.RoleDelete);
  });

  client.on(Events.GuildBanAdd, async (ban) => {
    // Track mass bans
    await trackDeletion(client, ban.guild.id, AuditLogEvent.MemberBanAdd);
  });
}
