import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

const RIDDLES = [
  { q: "What has keys but no locks, space but no room, and you can enter but can't go inside?", a: "A keyboard" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps" },
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", a: "An echo" },
  { q: "What has to be broken before you can use it?", a: "An egg" },
  { q: "I'm tall when I'm young and short when I'm old. What am I?", a: "A candle" },
  { q: "What gets wetter the more it dries?", a: "A towel" },
  { q: "What can you catch but not throw?", a: "A cold" },
  { q: "I have cities but no houses, forests but no trees, and water but no fish. What am I?", a: "A map" },
  { q: "What has one eye but can't see?", a: "A needle" },
  { q: "What runs but never walks, has a mouth but never talks?", a: "A river" },
];

export const riddleCommand = {
  data: new SlashCommandBuilder().setName("riddle").setDescription("Get a riddle — can you solve it?"),

  async execute(interaction: ChatInputCommandInteraction) {
    const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)]!;

    const btn = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("reveal").setLabel("Reveal Answer").setStyle(ButtonStyle.Secondary).setEmoji("👁️")
    );

    const msg = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x9b59b6).setTitle("🧩 Riddle").setDescription(riddle.q).setFooter({ text: "Click to reveal the answer!" }).setTimestamp()],
      components: [btn],
      fetchReply: true,
    });

    try {
      const i = await msg.awaitMessageComponent({ componentType: ComponentType.Button, filter: (b) => b.user.id === interaction.user.id, time: 60_000 });
      await i.update({
        embeds: [new EmbedBuilder().setColor(0x57f287).setTitle("🧩 Riddle — Answer").addFields({ name: "❓ Riddle", value: riddle.q }, { name: "✅ Answer", value: riddle.a }).setTimestamp()],
        components: [],
      });
    } catch {
      await interaction.editReply({ components: [] });
    }
  },
};
