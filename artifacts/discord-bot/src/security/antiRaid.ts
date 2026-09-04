import { Client, EmbedBuilder, TextChannel, Events, GuildMember } from "discord.js";
import { db, developersTable, securitySettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { OWNER_IDS } from "../lib/permissions.js";

// guildId -> array of join timestamps (ms)
const joinTracker = new Map<string, number[]>();
const RAID_THRESHOLD = 5;   // joins
const RAID_TIMEFRAME = 10_000; // ms

async function alertStaff(client: Client, embed: EmbedBuilder, guildName: string) {
  const allDevs = await db.select().from(developersTable);
  const allIds = [...new Set([...OWNER_IDS, ...allDevs.map((d) => d.userId)])];
  for (const userId of allIds) {
    try {
      const user = await client.users.fetch(userId);
      await user.send({ content: `<@${userId}> 🚨 **RAID ALERT in ${guildName}!**`, embeds: [embed] });
    } catch { /* DMs disabled */ }
  }
}

async function lockAllChannels(member: GuildMember) {
  const guild = member.guild;
  const everyone = guild.roles.everyone;
  const textChannels = guild.channels.cache.filter((c) => c.isTextBased() && c.permissionsFor(guild.members.me!)?.has("ManageChannels"));
  for (const [, ch] of textChannels) {
    try {
      await (ch as TextChannel).permissionOverwrites.edit(everyone, { SendMessages: false }, { reason: "🛡️ Anti-Raid: Automatic lockdown" });
    } catch { /* skip */ }
  }
}

export function setupAntiRaid(client: Client) {
  client.on(Events.GuildMemberAdd, async (member) => {
    const guildId = member.guild.id;

    // Check settings
    const settings = await db.select().from(securitySettingsTable).where(eq(securitySettingsTable.guildId, guildId));
    if (settings.length > 0 && !settings[0]!.antiRaidEnabled) return;

    const now = Date.now();
    const timestamps = joinTracker.get(guildId) ?? [];
    const recent = timestamps.filter((t) => now - t < RAID_TIMEFRAME);
    recent.push(now);
    joinTracker.set(guildId, recent);

    if (recent.length >= RAID_THRESHOLD) {
      joinTracker.set(guildId, []); // reset to avoid repeat triggers

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("🚨 RAID DETECTED")
        .setDescription(`**${member.guild.name}** is under a raid attack!\n\n**${recent.length}** users joined in the last 10 seconds.\n\nAll channels have been locked automatically.`)
        .addFields(
          { name: "Server", value: member.guild.name, inline: true },
          { name: "Members Joined", value: `${recent.length}`, inline: true },
        )
        .setTimestamp();

      await lockAllChannels(member);
      await alertStaff(client, embed, member.guild.name);

      // Log to log channel if set
      if (settings[0]?.logChannelId) {
        try {
          const logCh = await client.channels.fetch(settings[0].logChannelId) as TextChannel;
          await logCh.send({ embeds: [embed] });
        } catch { /* channel not found */ }
      }

      console.log(`🚨 Raid detected in ${member.guild.name} — lockdown triggered.`);
    }
  });
}
