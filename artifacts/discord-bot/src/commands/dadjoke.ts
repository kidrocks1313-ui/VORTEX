import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const DAD_JOKES = [
  "I'm afraid for the calendar. Its days are numbered.",
  "What do you call cheese that isn't yours? Nacho cheese.",
  "Why do fathers take an extra pair of socks when they go golfing? In case they get a hole in one!",
  "I don't trust stairs. They're always up to something.",
  "Did I tell you the joke about construction? I'm still working on it.",
  "Why can't a nose be 12 inches long? Because then it'd be a foot.",
  "What do you call an elephant that doesn't matter? An irrelephant.",
  "I only know 25 letters of the alphabet. I don't know y.",
  "Did you hear about the restaurant on the moon? Great food, no atmosphere.",
  "What do you call a bear with no teeth? A gummy bear.",
  "I would avoid the sushi if I were you. It's a little fishy.",
  "What do you call a factory that makes okay products? A satisfactory.",
  "Why do cows wear bells? Because their horns don't work.",
  "What do you call a sad cup of coffee? Depresso.",
  "I used to be a banker, but I lost interest.",
];

export const dadjokeCommand = {
  data: new SlashCommandBuilder().setName("dadjoke").setDescription("Get a dad joke 😄"),

  async execute(interaction: ChatInputCommandInteraction) {
    const joke = DAD_JOKES[Math.floor(Math.random() * DAD_JOKES.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle("👨 Dad Joke").setDescription(joke).setTimestamp()],
    });
  },
};
