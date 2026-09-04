import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const TRUTHS = [
  "What's your most embarrassing moment?", "Have you ever lied to your best friend?",
  "What's the most childish thing you still do?", "What's your biggest fear?",
  "What's your most embarrassing text message?", "Have you ever cheated on a test?",
  "What's the worst thing you've ever said to someone?", "Have you ever had a crush on a teacher?",
  "What's a secret you've never told anyone?", "Have you ever been caught doing something you shouldn't?",
];

const DARES = [
  "Send a voice message saying 'I love cheese' in your weirdest voice.",
  "Change your nickname to 'potato' for 1 hour.",
  "Copy the last text you sent and share it here.",
  "Write a 5-sentence love letter to your favourite food.",
  "DM a random person in the server with just '👀'.",
  "Set your status to something embarrassing for 10 minutes.",
  "Speak in ONLY caps for the next 5 messages.",
  "Type your deepest secret — but in a different language.",
  "Send the last photo in your camera roll.",
  "Describe yourself in 3 emojis only.",
];

export const todCommand = {
  data: new SlashCommandBuilder()
    .setName("tod")
    .setDescription("Truth or Dare!")
    .addStringOption((opt) =>
      opt.setName("type").setDescription("Truth or Dare").setRequired(true)
        .addChoices({ name: "🤔 Truth", value: "truth" }, { name: "😈 Dare", value: "dare" })
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString("type", true);
    const isTruth = type === "truth";
    const list = isTruth ? TRUTHS : DARES;
    const item = list[Math.floor(Math.random() * list.length)]!;

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(isTruth ? 0x5865f2 : 0xed4245)
        .setTitle(isTruth ? "🤔 Truth" : "😈 Dare")
        .setDescription(item)
        .setTimestamp()],
    });
  },
};
