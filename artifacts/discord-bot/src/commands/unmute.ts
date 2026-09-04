import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const unmuteCommand = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove a timeout (unmute) from a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to unmute").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to unmute members.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const member = interaction.guild?.members.cache.get(targetUser.id);

    if (!member) {
      await interaction.reply({ content: "❌ That user is not in this server.", ephemeral: true });
      return;
    }

    if (!member.isCommunicationDisabled()) {
      await interaction.reply({ content: `❌ **${targetUser.tag}** is not currently muted.`, ephemeral: true });
      return;
    }

    try {
      await member.timeout(null);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle("🔊 User Unmuted")
            .addFields(
              { name: "User", value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: "Moderator", value: interaction.user.tag, inline: true }
            )
            .setTimestamp(),
        ],
      });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to unmute: ${e}`, ephemeral: true });
    }
  },
};
