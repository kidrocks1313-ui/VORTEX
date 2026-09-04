import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const JOKES = [
  ["Why don't scientists trust atoms?", "Because they make up everything!"],
  ["I told my wife she was drawing her eyebrows too high.", "She looked surprised."],
  ["What do you call a fake noodle?", "An impasta."],
  ["Why did the scarecrow win an award?", "Because he was outstanding in his field."],
  ["I used to hate facial hair...", "but then it grew on me."],
  ["What do you call cheese that isn't yours?", "Nacho cheese."],
  ["Why can't you give Elsa a balloon?", "Because she'll let it go."],
  ["I'm reading a book about anti-gravity.", "It's impossible to put down."],
  ["Did you hear about the guy who invented Lifesavers?", "He made a mint."],
  ["Why did the bicycle fall over?", "Because it was two-tired."],
  ["What do you call a sleeping dinosaur?", "A dino-snore."],
  ["Why don't eggs tell jokes?", "They'd crack each other up."],
  ["What do you call a fish without eyes?", "A fsh."],
  ["Why did the math book look so sad?", "Because it had too many problems."],
  ["What's a vampire's favourite fruit?", "A blood orange."],
];

export const jokeCommand = {
  data: new SlashCommandBuilder().setName("joke").setDescription("Get a random joke"),

  async execute(interaction: ChatInputCommandInteraction) {
    const [setup, punchline] = JOKES[Math.floor(Math.random() * JOKES.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle("😂 Random Joke").addFields({ name: setup!, value: punchline! }).setTimestamp()],
    });
  },
};
