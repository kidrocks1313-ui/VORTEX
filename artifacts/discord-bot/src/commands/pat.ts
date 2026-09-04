import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const PAT_MSGS = ["gently pats", "headpats", "gives a soft pat to", "lovingly pats", "boops the head of"];

export const patCommand = {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Pat someone on the head 🫶")
    .addUserOption((opt) => opt.setName("user").setDescription("User to pat").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const msg = PAT_MSGS[Math.floor(Math.random() * PAT_MSGS.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle("🫶 Pat!").setDescription(`**${interaction.user.username}** ${msg} **${target.username}** 🥰`).setTimestamp()],
    });
  },
};
