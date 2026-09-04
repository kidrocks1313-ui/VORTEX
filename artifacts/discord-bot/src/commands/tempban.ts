import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

const DURATIONS: Record<string, number> = {
  "1hr": 60 * 60 * 1000, "6hr": 6 * 60 * 60 * 1000,
  "12hr": 12 * 60 * 60 * 1000, "24hr": 24 * 60 * 60 * 1000,
  "3days": 3 * 24 * 60 * 60 * 1000, "7days": 7 * 24 * 60 * 60 * 1000,
};

export const tempbanCommand = {
  data: new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("Temporarily ban a user")
    .addUserOption(opt => opt.setName("user").setDescription("User to ban").setRequired(true))
    .addStringOption(opt => opt.setName("duration").setDescription("Ban duration").setRequired(true).addChoices(
      { name: "1 hour", value: "1hr" }, { name: "6 hours", value: "6hr" },
      { name: "12 hours", value: "12hr" }, { name: "24 hours", value: "24hr" },
      { name: "3 days", value: "3days" }, { name: "7 days", value: "7days" },
    ))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to tempban.", ephemeral: true }); return;
    }
    const target = interaction.options.getUser("user", true);
    const durKey = interaction.options.getString("duration", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const ms = DURATIONS[durKey]!;

    await target.send({ embeds: [new EmbedBuilder().setColor(0xed4245).setTitle("🔨 Temporarily Banned").setDescription(`You have been temp-banned from **${interaction.guild?.name}** for **${durKey}**.`).addFields({ name: "Reason", value: reason }).setTimestamp()] }).catch(() => null);
    await interaction.guild?.bans.create(target.id, { reason: `Tempban (${durKey}) by ${interaction.user.tag}: ${reason}` });

    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xed4245).setTitle("🔨 Temp Banned").addFields({ name: "User", value: `${target.tag}`, inline: true }, { name: "Duration", value: durKey, inline: true }, { name: "Reason", value: reason }).setTimestamp()] });

    setTimeout(async () => {
      await interaction.guild?.bans.remove(target.id, "Tempban expired").catch(() => null);
    }, ms);
  },
};
