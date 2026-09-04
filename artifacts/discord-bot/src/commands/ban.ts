import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const banCommand = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from this server")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to ban").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the ban").setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt.setName("delete_days").setDescription("Days of messages to delete (0-7)").setMinValue(0).setMaxValue(7).setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to ban members.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const deleteDays = interaction.options.getInteger("delete_days") ?? 0;

    const member = interaction.guild?.members.cache.get(targetUser.id);
    if (member && !member.bannable) {
      await interaction.reply({ content: "❌ I cannot ban this user — they may have a higher role than me.", ephemeral: true });
      return;
    }

    try {
      await targetUser.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle("🔨 You have been banned")
            .setDescription(`You have been banned from **${interaction.guild?.name}**.`)
            .addFields({ name: "Reason", value: reason })
            .setTimestamp(),
        ],
      }).catch(() => null);

      await interaction.guild?.bans.create(targetUser.id, { reason: `${interaction.user.tag}: ${reason}`, deleteMessageDays: deleteDays });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle("🔨 User Banned")
            .addFields(
              { name: "User", value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: "Moderator", value: interaction.user.tag, inline: true },
              { name: "Reason", value: reason }
            )
            .setTimestamp(),
        ],
      });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to ban: ${e}`, ephemeral: true });
    }
  },
};
