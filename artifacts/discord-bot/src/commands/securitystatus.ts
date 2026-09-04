import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db, securitySettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const securityStatusCommand = {
  data: new SlashCommandBuilder()
    .setName("securitystatus")
    .setDescription("View the current security settings for this server"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to view security settings.", ephemeral: true });
      return;
    }

    const guildId = interaction.guildId!;
    const settings = await db.select().from(securitySettingsTable).where(eq(securitySettingsTable.guildId, guildId));

    const s = settings[0] ?? { antiRaidEnabled: true, antiSpamEnabled: true, antiNukeEnabled: true, logChannelId: null };

    const status = (v: boolean) => v ? "✅ Enabled" : "❌ Disabled";

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("🛡️ Security Status")
          .setDescription(`Security configuration for **${interaction.guild?.name}**`)
          .addFields(
            { name: "🚨 Anti-Raid", value: status(s.antiRaidEnabled), inline: true },
            { name: "⚠️ Anti-Spam", value: status(s.antiSpamEnabled), inline: true },
            { name: "💣 Anti-Nuke", value: status(s.antiNukeEnabled), inline: true },
            { name: "📋 Log Channel", value: s.logChannelId ? `<#${s.logChannelId}>` : "Not set", inline: false },
          )
          .setFooter({ text: "Use /securitysetup to configure" })
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  },
};
