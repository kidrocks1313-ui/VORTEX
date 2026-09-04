import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const iqCommand = {
  data: new SlashCommandBuilder()
    .setName("iq")
    .setDescription("Check someone's IQ 🧠")
    .addUserOption((opt) => opt.setName("user").setDescription("User to check (default: you)").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const iq = Math.floor(Math.random() * 200) + 1;
    const label =
      iq < 50 ? "🪨 Rock smart" : iq < 80 ? "😬 Below average" : iq < 100 ? "😐 Average" :
      iq < 120 ? "🙂 Above average" : iq < 140 ? "🤓 Smart" : iq < 160 ? "🧠 Genius" : "🚀 Galaxy brain";

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("🧠 IQ Test Results").addFields({ name: user.username, value: `**IQ: ${iq}**\n${label}` }).setTimestamp()],
    });
  },
};
