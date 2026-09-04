import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const kickCommand = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from this server")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to kick").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the kick").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to kick members.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const member = interaction.guild?.members.cache.get(targetUser.id);

    if (!member) {
      await interaction.reply({ content: "❌ That user is not in this server.", ephemeral: true });
      return;
    }

    if (!member.kickable) {
      await interaction.reply({ content: "❌ I cannot kick this user — they may have a higher role than me.", ephemeral: true });
      return;
    }

    try {
      await targetUser.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xfee75c)
            .setTitle("👢 You have been kicked")
            .setDescription(`You have been kicked from **${interaction.guild?.name}**.`)
            .addFields({ name: "Reason", value: reason })
            .setTimestamp(),
        ],
      }).catch(() => null);

      await member.kick(`${interaction.user.tag}: ${reason}`);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xfee75c)
            .setTitle("👢 User Kicked")
            .addFields(
              { name: "User", value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: "Moderator", value: interaction.user.tag, inline: true },
              { name: "Reason", value: reason }
            )
            .setTimestamp(),
        ],
      });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to kick: ${e}`, ephemeral: true });
    }
  },
};
