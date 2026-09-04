import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const reverseCommand = {
  data: new SlashCommandBuilder()
    .setName("reverse")
    .setDescription("Reverse a piece of text")
    .addStringOption((opt) => opt.setName("text").setDescription("Text to reverse").setRequired(true).setMaxLength(500)),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString("text", true);
    const reversed = [...text].reverse().join("");
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("🔄 Reversed Text").addFields({ name: "Original", value: text }, { name: "Reversed", value: reversed }).setTimestamp()],
    });
  },
};
