import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const DICE_EMOJIS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export const diceCommand = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll one or more dice")
    .addIntegerOption((opt) => opt.setName("count").setDescription("Number of dice to roll (1-10)").setMinValue(1).setMaxValue(10).setRequired(false))
    .addIntegerOption((opt) => opt.setName("sides").setDescription("Number of sides (default: 6)").setMinValue(2).setMaxValue(100).setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    const count = interaction.options.getInteger("count") ?? 1;
    const sides = interaction.options.getInteger("sides") ?? 6;
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    const display = sides === 6 ? rolls.map((r) => DICE_EMOJIS[r - 1]).join(" ") : rolls.map((r) => `**${r}**`).join(", ");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🎲 Dice Roll (${count}d${sides})`)
      .setDescription(display)
      .addFields(count > 1 ? [{ name: "Total", value: `${total}`, inline: true }, { name: "Average", value: `${(total / count).toFixed(1)}`, inline: true }] : [])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
