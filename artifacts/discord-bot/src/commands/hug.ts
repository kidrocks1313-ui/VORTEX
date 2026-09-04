import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const HUG_MSGS = ["wraps their arms around", "gives a warm hug to", "squeezes tightly", "gives a big bear hug to", "cuddles up to"];

export const hugCommand = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hug someone 🤗")
    .addUserOption((opt) => opt.setName("user").setDescription("User to hug").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const msg = HUG_MSGS[Math.floor(Math.random() * HUG_MSGS.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xff69b4).setTitle("🤗 Hug!").setDescription(`**${interaction.user.username}** ${msg} **${target.username}** 💕`).setTimestamp()],
    });
  },
};
