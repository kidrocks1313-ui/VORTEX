import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

const DURATIONS: Record<string, number> = {
  "60s": 60 * 1000,
  "5min": 5 * 60 * 1000,
  "10min": 10 * 60 * 1000,
  "30min": 30 * 60 * 1000,
  "1hr": 60 * 60 * 1000,
  "6hr": 6 * 60 * 60 * 1000,
  "12hr": 12 * 60 * 60 * 1000,
  "24hr": 24 * 60 * 60 * 1000,
  "7days": 7 * 24 * 60 * 60 * 1000,
};

export const muteCommand = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a user in this server")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to mute").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("duration").setDescription("Duration of the mute").setRequired(true)
        .addChoices(
          { name: "60 seconds", value: "60s" },
          { name: "5 minutes", value: "5min" },
          { name: "10 minutes", value: "10min" },
          { name: "30 minutes", value: "30min" },
          { name: "1 hour", value: "1hr" },
          { name: "6 hours", value: "6hr" },
          { name: "12 hours", value: "12hr" },
          { name: "24 hours", value: "24hr" },
          { name: "7 days", value: "7days" },
        )
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the mute").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to mute members.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const durationKey = interaction.options.getString("duration", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const durationMs = DURATIONS[durationKey]!;
    const member = interaction.guild?.members.cache.get(targetUser.id);

    if (!member) {
      await interaction.reply({ content: "❌ That user is not in this server.", ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ content: "❌ I cannot mute this user — they may have a higher role than me.", ephemeral: true });
      return;
    }

    try {
      await member.timeout(durationMs, `${interaction.user.tag}: ${reason}`);

      await targetUser.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xfee75c)
            .setTitle("🔇 You have been muted")
            .setDescription(`You have been timed out in **${interaction.guild?.name}** for **${durationKey}**.`)
            .addFields({ name: "Reason", value: reason })
            .setTimestamp(),
        ],
      }).catch(() => null);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xfee75c)
            .setTitle("🔇 User Muted")
            .addFields(
              { name: "User", value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: "Duration", value: durationKey, inline: true },
              { name: "Moderator", value: interaction.user.tag, inline: true },
              { name: "Reason", value: reason }
            )
            .setTimestamp(),
        ],
      });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to mute: ${e}`, ephemeral: true });
    }
  },
};
