import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

export const guessCommand = {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Guess a number between 1 and 100!"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "❌ The /guess command can only be played in a server text channel.",
        ephemeral: true,
      });
      return;
    }

    if (!interaction.channel) return;
    const secret = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    const MAX = 7;

    const makeButtons = (disabled = false) => new ActionRowBuilder<ButtonBuilder>().addComponents(
      ["1-25", "26-50", "51-75", "76-100"].map((label, i) =>
        new ButtonBuilder().setCustomId(`range_${i}`).setLabel(label).setStyle(ButtonStyle.Primary).setDisabled(disabled)
      )
    );

    const msg = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("🔢 Number Guessing Game").setDescription(`I'm thinking of a number between **1 and 100**.\nYou have **${MAX}** attempts. Use the buttons to narrow it down, then type your guess!`).setTimestamp()],
      components: [makeButtons()],
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, filter: b => b.user.id === interaction.user.id, time: 120_000 });
    const msgCollector = interaction.channel.createMessageCollector({ filter: m => m.author.id === interaction.user.id, time: 120_000 });

    let low = 1, high = 100;

    collector.on("collect", async btn => {
      await btn.deferUpdate();
      const ranges = [[1,25],[26,50],[51,75],[76,100]];
      const idx = parseInt(btn.customId.split("_")[1]!);
      [low, high] = ranges[idx]!;
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle("🔢 Guessing Game").setDescription(`Range narrowed to **${low}–${high}**.\nNow type your exact guess! (${MAX - attempts} attempts left)`).setTimestamp()], components: [makeButtons(true)] });
    });

    msgCollector.on("collect", async m => {
      const guess = parseInt(m.content);
      if (isNaN(guess)) return;
      attempts++;
      await m.delete().catch(() => null);

      if (guess === secret) {
        collector.stop(); msgCollector.stop();
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle("🎉 Correct!").setDescription(`**${guess}** was right! Got it in **${attempts}** attempt(s).`).setTimestamp()], components: [] });
        return;
      }

      if (attempts >= MAX) {
        collector.stop(); msgCollector.stop();
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xed4245).setTitle("❌ Game Over").setDescription(`Out of attempts! The number was **${secret}**.`).setTimestamp()], components: [] });
        return;
      }

      const hint = guess < secret ? "📈 Too low!" : "📉 Too high!";
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle("🔢 Guessing Game").setDescription(`**${hint}**\nGuess: ${guess} | Attempts left: **${MAX - attempts}**`).setTimestamp()], components: [makeButtons(true)] });
    });

    collector.on("end", async (_, reason) => { if (reason === "time") await interaction.editReply({ components: [] }); });
  },
};
