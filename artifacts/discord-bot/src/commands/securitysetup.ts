import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ChannelType } from "discord.js";
import { db, securitySettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const securitySetupCommand = {
  data: new SlashCommandBuilder()
    .setName("securitysetup")
    .setDescription("Configure the security system for this server")
    .addSubcommand((sub) =>
      sub.setName("antiraid").setDescription("Toggle anti-raid protection")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable or disable").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("antispam").setDescription("Toggle anti-spam protection")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable or disable").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("antinuke").setDescription("Toggle anti-nuke protection")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable or disable").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("logchannel").setDescription("Set the channel for security logs")
        .addChannelOption((opt) =>
          opt.setName("channel").setDescription("Log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to configure security.", ephemeral: true });
      return;
    }

    const guildId = interaction.guildId!;
    const sub = interaction.options.getSubcommand();

    // Upsert settings
    const existing = await db.select().from(securitySettingsTable).where(eq(securitySettingsTable.guildId, guildId));
    if (existing.length === 0) {
      await db.insert(securitySettingsTable).values({ guildId });
    }

    let message = "";

    if (sub === "antiraid") {
      const enabled = interaction.options.getBoolean("enabled", true);
      await db.update(securitySettingsTable).set({ antiRaidEnabled: enabled }).where(eq(securitySettingsTable.guildId, guildId));
      message = `🛡️ Anti-Raid is now **${enabled ? "enabled" : "disabled"}**.`;
    } else if (sub === "antispam") {
      const enabled = interaction.options.getBoolean("enabled", true);
      await db.update(securitySettingsTable).set({ antiSpamEnabled: enabled }).where(eq(securitySettingsTable.guildId, guildId));
      message = `⚠️ Anti-Spam is now **${enabled ? "enabled" : "disabled"}**.`;
    } else if (sub === "antinuke") {
      const enabled = interaction.options.getBoolean("enabled", true);
      await db.update(securitySettingsTable).set({ antiNukeEnabled: enabled }).where(eq(securitySettingsTable.guildId, guildId));
      message = `💣 Anti-Nuke is now **${enabled ? "enabled" : "disabled"}**.`;
    } else if (sub === "logchannel") {
      const channel = interaction.options.getChannel("channel", true);
      await db.update(securitySettingsTable).set({ logChannelId: channel.id }).where(eq(securitySettingsTable.guildId, guildId));
      message = `📋 Security logs will now be sent to <#${channel.id}>.`;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("🔧 Security Settings Updated")
          .setDescription(message)
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  },
};
