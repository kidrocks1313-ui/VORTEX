import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const softbanCommand = {
  data: new SlashCommandBuilder()
    .setName("softban")
    .setDescription("Softban a user (ban + unban to delete their messages)")
    .addUserOption(opt => opt.setName("user").setDescription("User to softban").setRequired(true))
    .addIntegerOption(opt => opt.setName("delete_days").setDescription("Days of messages to delete (1-7, default 7)").setMinValue(1).setMaxValue(7).setRequired(false))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to softban.", ephemeral: true }); return;
    }
    const target = interaction.options.getUser("user", true);
    const days = interaction.options.getInteger("delete_days") ?? 7;
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    await interaction.deferReply();
    await interaction.guild?.bans.create(target.id, { deleteMessageDays: days, reason: `Softban by ${interaction.user.tag}: ${reason}` });
    await interaction.guild?.bans.remove(target.id, "Softban — auto-unban");

    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle("🧹 User Softbanned").setDescription(`**${target.tag}** was softbanned — banned and immediately unbanned to delete their last **${days}** day(s) of messages.`).addFields({ name: "Reason", value: reason }).setTimestamp()] });
  },
};
