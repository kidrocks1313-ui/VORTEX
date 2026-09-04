import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

function mockText(text: string): string {
  return [...text].map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("");
}

export const mockCommand = {
  data: new SlashCommandBuilder()
    .setName("mock")
    .setDescription("SpOnGeBoB mOcKiNg TeXt")
    .addStringOption((opt) => opt.setName("text").setDescription("Text to mock").setRequired(true).setMaxLength(500)),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString("text", true);
    await interaction.reply({ content: `${mockText(text)} 🧽` });
  },
};
