import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const unbanCommand = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from this server")
    .addStringOption((opt) =>
      opt.setName("userid").setDescription("The user ID to unban").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the unban").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to unban members.", ephemeral: true });
      return;
    }

    const userId = interaction.options.getString("userid", true).trim();
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    try {
      const ban = await interaction.guild?.bans.fetch(userId).catch(() => null);
      if (!ban) {
        await interaction.reply({ content: `❌ No ban found for user ID \`${userId}\`.`, ephemeral: true });
        return;
      }

      await interaction.guild?.bans.remove(userId, `${interaction.user.tag}: ${reason}`);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle("✅ User Unbanned")
            .addFields(
              { name: "User", value: `${ban.user.tag} (\`${userId}\`)`, inline: true },
              { name: "Moderator", value: interaction.user.tag, inline: true },
              { name: "Reason", value: reason }
            )
            .setTimestamp(),
        ],
      });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to unban: ${e}`, ephemeral: true });
    }
  },
};
