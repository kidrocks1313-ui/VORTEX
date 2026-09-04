import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const FACTS = [
  "A group of flamingos is called a flamboyance.",
  "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
  "Octopuses have three hearts, two of which stop beating when they swim.",
  "A day on Venus is longer than a year on Venus.",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
  "The shortest war in history was between Britain and Zanzibar on August 27, 1896 — it lasted 38 minutes.",
  "Bananas are berries, but strawberries aren't.",
  "There are more possible iterations of a chess game than there are atoms in the observable universe.",
  "The average person walks about 100,000 miles in their lifetime — enough to walk around the Earth four times.",
  "A bolt of lightning is five times hotter than the surface of the sun.",
  "Crows can recognize and remember human faces.",
  "The Great Wall of China is not visible from space with the naked eye.",
  "A group of cats is called a clowder.",
  "Wombats produce cube-shaped poop — the only animals known to do so.",
  "The smell of rain has a name: petrichor.",
  "Scotland's national animal is the unicorn.",
  "A day on Mars is 24 hours and 37 minutes.",
  "Sharks are older than trees.",
  "Pineapples take about 18-20 months to grow.",
  "The dot above a lowercase 'i' or 'j' is called a tittle.",
];

export const factCommand = {
  data: new SlashCommandBuilder().setName("fact").setDescription("Get a random interesting fact"),

  async execute(interaction: ChatInputCommandInteraction) {
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x00b0f4).setTitle("🧠 Random Fact").setDescription(fact).setTimestamp()],
    });
  },
};
