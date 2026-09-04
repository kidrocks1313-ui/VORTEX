import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "🎰"];
const WEIGHTS =  [30,    25,    20,    15,    7,     2,     1];

function spin(): string {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    rand -= WEIGHTS[i]!;
    if (rand <= 0) return SYMBOLS[i]!;
  }
  return SYMBOLS[0]!;
}

export const slotsCommand = {
  data: new SlashCommandBuilder().setName("slots").setDescription("Spin the slot machine! 🎰"),

  async execute(interaction: ChatInputCommandInteraction) {
    const reels = [spin(), spin(), spin()];
    const display = `| ${reels.join(" | ")} |`;
    const allMatch = reels.every((r) => r === reels[0]);
    const twoMatch = !allMatch && (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]);
    const hasDiamond = reels.includes("💎");

    const [result, color] =
      allMatch && reels[0] === "💎" ? ["💎 JACKPOT! You're rich!", 0xffd700] :
      allMatch ? ["🎉 Winner! Three of a kind!", 0x57f287] :
      twoMatch && hasDiamond ? ["✨ Two diamonds! Big win!", 0x57f287] :
      twoMatch ? ["👍 Two of a kind! Small win!", 0xfee75c] :
      ["😔 No match. Try again!", 0xed4245];

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(color as number).setTitle("🎰 Slot Machine").setDescription(`\`\`\`\n${display}\n\`\`\``).addFields({ name: "Result", value: result as string }).setTimestamp()],
    });
  },
};
