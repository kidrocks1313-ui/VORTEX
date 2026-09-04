import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const CHOICES = ["rock", "paper", "scissors"];
const EMOJIS: Record<string, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };
const BEATS: Record<string, string> = { rock: "scissors", paper: "rock", scissors: "paper" };

export const rpsCommand = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock, Paper, Scissors")
    .addStringOption((opt) => opt.setName("choice").setDescription("Your choice").setRequired(true).addChoices({ name: "🪨 Rock", value: "rock" }, { name: "📄 Paper", value: "paper" }, { name: "✂️ Scissors", value: "scissors" })),

  async execute(interaction: ChatInputCommandInteraction) {
    const player = interaction.options.getString("choice", true);
    const bot = CHOICES[Math.floor(Math.random() * 3)]!;
    const tie = player === bot;
    const win = BEATS[player] === bot;

    const [status, color] = tie ? ["🤝 It's a tie!", 0xfee75c] : win ? ["🎉 You win!", 0x57f287] : ["😔 You lose!", 0xed4245];

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(color as number).setTitle("✂️ Rock Paper Scissors").addFields({ name: "Your choice", value: `${EMOJIS[player]} ${player}`, inline: true }, { name: "Bot's choice", value: `${EMOJIS[bot]} ${bot}`, inline: true }, { name: "Result", value: status as string }).setTimestamp()],
    });
  },
};
