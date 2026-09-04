import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const shipCommand = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Ship two users together 💘")
    .addUserOption((opt) => opt.setName("user1").setDescription("First user").setRequired(true))
    .addUserOption((opt) => opt.setName("user2").setDescription("Second user").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const u1 = interaction.options.getUser("user1", true);
    const u2 = interaction.options.getUser("user2", true);
    const score = Math.floor(Math.random() * 101);
    const bar = Math.floor(score / 10);
    const label =
      score < 20 ? "💔 No chance" : score < 40 ? "😬 Unlikely" : score < 60 ? "🙂 Maybe?" :
      score < 80 ? "💕 Pretty good!" : score < 95 ? "❤️ Great match!" : "💘 SOULMATES!";
    const name = u1.username.slice(0, Math.ceil(u1.username.length / 2)) + u2.username.slice(Math.floor(u2.username.length / 2));

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xff69b4).setTitle("💘 Ship").addFields(
        { name: "💑 Ship Name", value: `**${name}**`, inline: false },
        { name: "💯 Compatibility", value: `${"❤️".repeat(bar)}${"🖤".repeat(10 - bar)} **${score}%**`, inline: false },
        { name: "Verdict", value: label, inline: false },
      ).setTimestamp()],
    });
  },
};
