import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const chooseCommand = {
  data: new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Let the bot choose between options")
    .addStringOption((opt) => opt.setName("options").setDescription("Options separated by commas (e.g. pizza, sushi, tacos)").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const raw = interaction.options.getString("options", true);
    const choices = raw.split(",").map((s) => s.trim()).filter(Boolean);

    if (choices.length < 2) {
      await interaction.reply({ content: "❌ Please provide at least 2 options separated by commas.", ephemeral: true });
      return;
    }

    const chosen = choices[Math.floor(Math.random() * choices.length)]!;

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("🤔 I Choose...").setDescription(`**${chosen}**`).addFields({ name: "Options", value: choices.map((c) => `• ${c}`).join("\n") }).setTimestamp()],
    });
  },
};
