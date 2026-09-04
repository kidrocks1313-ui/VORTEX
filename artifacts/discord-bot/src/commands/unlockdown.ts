import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const unlockdownCommand = {
  data: new SlashCommandBuilder()
    .setName("unlockdown")
    .setDescription("Unlock ALL channels in this server"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to unlock the server.", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const guild = interaction.guild!;
    const everyone = guild.roles.everyone;
    let unlocked = 0;

    for (const [, channel] of guild.channels.cache) {
      if (!channel.isTextBased()) continue;
      if (!channel.permissionsFor(guild.members.me!)?.has("ManageChannels")) continue;
      try {
        await (channel as TextChannel).permissionOverwrites.edit(everyone, { SendMessages: null }, { reason: `Unlockdown by ${interaction.user.tag}` });
        unlocked++;
      } catch { /* skip */ }
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle("🔓 Server Unlocked")
          .setDescription(`**${unlocked}** channels have been unlocked.`)
          .addFields({ name: "Moderator", value: interaction.user.tag, inline: true })
          .setTimestamp(),
      ],
    });
  },
};
