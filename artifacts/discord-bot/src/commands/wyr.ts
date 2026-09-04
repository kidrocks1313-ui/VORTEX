import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const QUESTIONS = [
  ["Fight 100 duck-sized horses", "Fight 1 horse-sized duck"],
  ["Have free WiFi everywhere you go", "Have free food everywhere you go"],
  ["Be able to fly", "Be able to breathe underwater"],
  ["Know the date you die", "Know the cause of your death"],
  ["Be famous for something embarrassing", "Be unknown for something amazing"],
  ["Lose all your memories", "Never be able to make new memories"],
  ["Always be 10 minutes late", "Always be 20 minutes early"],
  ["Only speak in questions", "Only speak in rhymes"],
  ["Have a rewind button for your life", "Have a pause button for your life"],
  ["Be able to read minds", "Be able to become invisible"],
  ["Live in the past", "Live in the future"],
  ["Never use social media again", "Never watch movies/TV again"],
  ["Give up your phone", "Give up your computer"],
  ["Be 4 feet tall", "Be 8 feet tall"],
  ["Talk to animals", "Speak all human languages"],
];

export const wyrCommand = {
  data: new SlashCommandBuilder().setName("wyr").setDescription("Would you rather...?"),

  async execute(interaction: ChatInputCommandInteraction) {
    const [a, b] = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x9b59b6).setTitle("🤔 Would You Rather...?").addFields(
        { name: "🅰️ Option A", value: a!, inline: false },
        { name: "🅱️ Option B", value: b!, inline: false },
      ).setFooter({ text: "Reply with A or B!" }).setTimestamp()],
    });
  },
};
