import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const rateCommand = {
  data: new SlashCommandBuilder()
    .setName("rate")
    .setDescription("Rate anything out of 10")
    .addStringOption((opt) => opt.setName("thing").setDescription("What to rate").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const thing = interaction.options.getString("thing", true);
    const rating = Math.floor(Math.random() * 11);
    const bar = "⭐".repeat(rating) + "☆".repeat(10 - rating);
    const label =
      rating === 0 ? "Absolute garbage 🗑️" : rating <= 2 ? "Pretty bad 😬" : rating <= 4 ? "Below average 😐" :
      rating <= 6 ? "Decent 👍" : rating <= 8 ? "Pretty good! 😄" : rating <= 9 ? "Amazing! 🔥" : "PERFECT! 💯";

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle("⭐ Rating").addFields(
        { name: "Thing", value: thing, inline: true },
        { name: "Rating", value: `${rating}/10`, inline: true },
        { name: "Score", value: `${bar}\n${label}` },
      ).setTimestamp()],
    });
  },
};
