import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const SLAP_MSGS = ["slaps", "smacks", "whacks", "claps", "hits with a fish 🐟"];

export const slapCommand = {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Slap someone 👋")
    .addUserOption((opt) => opt.setName("user").setDescription("User to slap").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const msg = SLAP_MSGS[Math.floor(Math.random() * SLAP_MSGS.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xed4245).setTitle("👋 Slap!").setDescription(`**${interaction.user.username}** ${msg} **${target.username}**! 💥`).setTimestamp()],
    });
  },
};
