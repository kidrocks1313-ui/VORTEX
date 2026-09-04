import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const unhideCommand = {
  data: new SlashCommandBuilder()
    .setName("unhide")
    .setDescription("Make this channel visible to @everyone again"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true }); return;
    }
    const channel = interaction.channel as TextChannel;
    const everyone = interaction.guild!.roles.everyone;
    await channel.permissionOverwrites.edit(everyone, { ViewChannel: null }, { reason: `Unhidden by ${interaction.user.tag}` });
    await interaction.reply(`👁️ **${channel.name}** is now visible to @everyone.`);
  },
};
