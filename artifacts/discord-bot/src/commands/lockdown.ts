import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const lockdownCommand = {
  data: new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Lock ALL channels in this server")
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for lockdown").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to lockdown the server.", ephemeral: true });
      return;
    }

    const reason = interaction.options.getString("reason") ?? "No reason provided";
    await interaction.deferReply();

    const guild = interaction.guild!;
    const everyone = guild.roles.everyone;
    let locked = 0;

    for (const [, channel] of guild.channels.cache) {
      if (!channel.isTextBased()) continue;
      if (!channel.permissionsFor(guild.members.me!)?.has("ManageChannels")) continue;
      try {
        await (channel as TextChannel).permissionOverwrites.edit(everyone, { SendMessages: false }, { reason: `Lockdown by ${interaction.user.tag}: ${reason}` });
        locked++;
      } catch { /* skip */ }
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle("🔒 Server Locked Down")
          .setDescription(`**${locked}** channels have been locked.`)
          .addFields(
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: true }
          )
          .setTimestamp(),
      ],
    });
  },
};
