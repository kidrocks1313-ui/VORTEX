import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const hideCommand = {
  data: new SlashCommandBuilder()
    .setName("hide")
    .setDescription("Hide this channel from @everyone"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true }); return;
    }
    const channel = interaction.channel as TextChannel;
    const everyone = interaction.guild!.roles.everyone;
    await channel.permissionOverwrites.edit(everyone, { ViewChannel: false }, { reason: `Hidden by ${interaction.user.tag}` });
    await interaction.reply({ content: `🙈 **${channel.name}** is now hidden from @everyone.`, ephemeral: true });
  },
};
