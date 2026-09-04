import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, PermissionFlagsBits } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const lockCommand = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock this channel so members cannot send messages")
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for locking").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to lock channels.", ephemeral: true });
      return;
    }

    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const channel = interaction.channel as TextChannel;
    const everyone = interaction.guild?.roles.everyone;

    if (!everyone) {
      await interaction.reply({ content: "❌ Could not find the @everyone role.", ephemeral: true });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(everyone, { SendMessages: false }, { reason: `${interaction.user.tag}: ${reason}` });
      await interaction.reply(`🔒 **${channel.name}** has been locked.\n**Reason:** ${reason}`);
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to lock channel: ${e}`, ephemeral: true });
    }
  },
};
