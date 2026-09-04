import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isDeveloperOrOwner } from "../lib/permissions.js";

export const massbanCommand = {
  data: new SlashCommandBuilder()
    .setName("massban")
    .setDescription("Ban multiple users by ID (dev/owner only)")
    .addStringOption(opt => opt.setName("userids").setDescription("Space or comma-separated user IDs").setRequired(true))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isDeveloperOrOwner(interaction.user.id))) {
      await interaction.reply({ content: "❌ Only developers and owners can use massban.", ephemeral: true }); return;
    }
    const raw = interaction.options.getString("userids", true);
    const ids = raw.split(/[\s,]+/).filter(id => /^\d+$/.test(id));
    const reason = interaction.options.getString("reason") ?? "Mass ban";
    if (ids.length === 0) { await interaction.reply({ content: "❌ No valid user IDs provided.", ephemeral: true }); return; }

    await interaction.deferReply();
    const banned: string[] = [], failed: string[] = [];
    for (const id of ids) {
      try { await interaction.guild?.bans.create(id, { reason: `Massban by ${interaction.user.tag}: ${reason}` }); banned.push(id); }
      catch { failed.push(id); }
    }

    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xed4245).setTitle("🔨 Mass Ban Complete")
      .addFields(
        { name: `✅ Banned (${banned.length})`, value: banned.length ? banned.map(id => `\`${id}\``).join(", ") : "None", inline: false },
        { name: `❌ Failed (${failed.length})`, value: failed.length ? failed.map(id => `\`${id}\``).join(", ") : "None", inline: false },
        { name: "Reason", value: reason },
      ).setTimestamp()] });
  },
};
