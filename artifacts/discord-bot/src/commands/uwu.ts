import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

function uwuify(text: string): string {
  return text
    .replace(/r|l/g, "w")
    .replace(/R|L/g, "W")
    .replace(/n([aeiou])/g, "ny$1")
    .replace(/N([aeiou])/g, "Ny$1")
    .replace(/ove/g, "uv")
    .replace(/!/g, " OwO!")
    .replace(/\?/g, " UwU?")
    .replace(/th/g, "d")
    .replace(/Th/g, "D");
}

export const uwuCommand = {
  data: new SlashCommandBuilder()
    .setName("uwu")
    .setDescription("UwUify your text OwO")
    .addStringOption((opt) => opt.setName("text").setDescription("Text to uwuify").setRequired(true).setMaxLength(500)),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString("text", true);
    const result = uwuify(text);
    await interaction.reply({ content: result });
  },
};
