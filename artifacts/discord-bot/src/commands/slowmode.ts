import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const slowmodeCommand = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode in this channel")
    .addIntegerOption((opt) =>
      opt.setName("seconds").setDescription("Seconds between messages (0 to disable)").setMinValue(0).setMaxValue(21600).setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to set slowmode.", ephemeral: true });
      return;
    }

    const seconds = interaction.options.getInteger("seconds", true);
    const channel = interaction.channel as TextChannel;

    try {
      await channel.setRateLimitPerUser(seconds);

      await interaction.reply({
        content: seconds === 0
          ? `✅ Slowmode has been **disabled** in ${channel}.`
          : `✅ Slowmode set to **${seconds}s** in ${channel}.`,
      });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to set slowmode: ${e}`, ephemeral: true });
    }
  },
};
