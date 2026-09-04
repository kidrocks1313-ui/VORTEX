import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const QUOTES = [
  ["Be the change you wish to see in the world.", "Mahatma Gandhi"],
  ["The only way to do great work is to love what you do.", "Steve Jobs"],
  ["In the middle of difficulty lies opportunity.", "Albert Einstein"],
  ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
  ["Life is what happens when you're busy making other plans.", "John Lennon"],
  ["The future belongs to those who believe in the beauty of their dreams.", "Eleanor Roosevelt"],
  ["Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"],
  ["You miss 100% of the shots you don't take.", "Wayne Gretzky"],
  ["Whether you think you can or you think you can't, you're right.", "Henry Ford"],
  ["The best time to plant a tree was 20 years ago. The second best time is now.", "Chinese Proverb"],
  ["An eye for an eye will make the whole world blind.", "Gandhi"],
  ["Not all those who wander are lost.", "J.R.R. Tolkien"],
  ["Do one thing every day that scares you.", "Eleanor Roosevelt"],
  ["Well-behaved women seldom make history.", "Laurel Thatcher Ulrich"],
  ["The unexamined life is not worth living.", "Socrates"],
];

export const quoteCommand = {
  data: new SlashCommandBuilder().setName("quote").setDescription("Get an inspirational quote"),

  async execute(interaction: ChatInputCommandInteraction) {
    const [text, author] = QUOTES[Math.floor(Math.random() * QUOTES.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("💬 Inspirational Quote").setDescription(`*"${text}"*`).setFooter({ text: `— ${author}` }).setTimestamp()],
    });
  },
};
