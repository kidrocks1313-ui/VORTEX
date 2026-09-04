import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const unlockCommand = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock this channel so members can send messages again"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to unlock channels.", ephemeral: true });
      return;
    }

    const channel = interaction.channel as TextChannel;
    const everyone = interaction.guild?.roles.everyone;

    if (!everyone) {
      await interaction.reply({ content: "❌ Could not find the @everyone role.", ephemeral: true });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(everyone, { SendMessages: null });
      await interaction.reply(`🔓 **${channel.name}** has been unlocked.`);
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to unlock channel: ${e}`, ephemeral: true });
    }
  },
};
