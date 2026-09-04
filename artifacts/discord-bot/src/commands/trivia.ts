import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

const QUESTIONS = [
  { q: "What is the capital of France?", a: "Paris", choices: ["London", "Paris", "Berlin", "Madrid"] },
  { q: "How many sides does a hexagon have?", a: "6", choices: ["5", "6", "7", "8"] },
  { q: "What planet is closest to the Sun?", a: "Mercury", choices: ["Venus", "Earth", "Mercury", "Mars"] },
  { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", choices: ["Picasso", "Michelangelo", "Leonardo da Vinci", "Raphael"] },
  { q: "What is the largest ocean on Earth?", a: "Pacific", choices: ["Atlantic", "Indian", "Arctic", "Pacific"] },
  { q: "How many bones are in the human body?", a: "206", choices: ["196", "206", "216", "226"] },
  { q: "What gas do plants absorb from the atmosphere?", a: "Carbon dioxide", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"] },
  { q: "In what year did World War II end?", a: "1945", choices: ["1943", "1944", "1945", "1946"] },
  { q: "What is the chemical symbol for gold?", a: "Au", choices: ["Go", "Gd", "Au", "Ag"] },
  { q: "What is the fastest land animal?", a: "Cheetah", choices: ["Lion", "Horse", "Cheetah", "Greyhound"] },
  { q: "How many continents are there?", a: "7", choices: ["5", "6", "7", "8"] },
  { q: "What is the smallest planet in our solar system?", a: "Mercury", choices: ["Mars", "Mercury", "Pluto", "Venus"] },
  { q: "Who wrote Romeo and Juliet?", a: "William Shakespeare", choices: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"] },
  { q: "What is H2O commonly known as?", a: "Water", choices: ["Water", "Hydrogen", "Helium", "Salt"] },
  { q: "What country has the most natural lakes?", a: "Canada", choices: ["Russia", "USA", "Canada", "Brazil"] },
];

export const triviaCommand = {
  data: new SlashCommandBuilder().setName("trivia").setDescription("Answer a trivia question!"),

  async execute(interaction: ChatInputCommandInteraction) {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]!;
    const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
    const emojis = ["🅰️", "🅱️", "🇨", "🇩"];

    const buttons = shuffled.map((choice, i) =>
      new ButtonBuilder().setCustomId(`trivia_${choice}`).setLabel(`${emojis[i]} ${choice}`).setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const msg = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("🧠 Trivia Time!").setDescription(q.q).setFooter({ text: "You have 15 seconds!" }).setTimestamp()],
      components: [row],
      fetchReply: true,
    });

    try {
      const btn = await msg.awaitMessageComponent({ componentType: ComponentType.Button, filter: (b) => b.user.id === interaction.user.id, time: 15_000 });
      const selected = btn.customId.replace("trivia_", "");
      const correct = selected === q.a;

      const resultButtons = shuffled.map((choice, i) =>
        new ButtonBuilder().setCustomId(`done_${i}`).setLabel(`${emojis[i]} ${choice}`)
          .setStyle(choice === q.a ? ButtonStyle.Success : choice === selected && !correct ? ButtonStyle.Danger : ButtonStyle.Secondary)
          .setDisabled(true)
      );

      await btn.update({
        embeds: [new EmbedBuilder().setColor(correct ? 0x57f287 : 0xed4245).setTitle(correct ? "✅ Correct!" : "❌ Wrong!").setDescription(q.q).addFields({ name: "Correct Answer", value: q.a }).setTimestamp()],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(resultButtons)],
      });
    } catch {
      await interaction.editReply({ components: [] });
    }
  },
};
