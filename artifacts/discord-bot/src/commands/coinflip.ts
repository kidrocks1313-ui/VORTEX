import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const coinflipCommand = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin")
    .addStringOption((opt) => opt.setName("call").setDescription("Heads or tails?").addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" }).setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    const call = interaction.options.getString("call");
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const emoji = result === "heads" ? "🪙" : "🔘";
    const won = call ? call === result : null;

    const embed = new EmbedBuilder()
      .setColor(won === null ? 0xfee75c : won ? 0x57f287 : 0xed4245)
      .setTitle(`${emoji} Coin Flip`)
      .setDescription(`The coin landed on **${result.toUpperCase()}**!${won !== null ? (won ? "\n\n🎉 You called it right!" : "\n\n❌ Wrong call!") : ""}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
