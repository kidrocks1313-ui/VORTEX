import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db, warningsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const warningsCommand = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a user in this server")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to check").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to view warnings.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const guildId = interaction.guildId!;

    const userWarnings = await db
      .select()
      .from(warningsTable)
      .where(and(eq(warningsTable.userId, targetUser.id), eq(warningsTable.guildId, guildId)));

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle(`⚠️ Warnings for ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp();

    if (userWarnings.length === 0) {
      embed.setDescription("This user has no warnings in this server.");
    } else {
      embed.setDescription(`**${userWarnings.length}** warning(s) total`);
      userWarnings.forEach((w, i) => {
        embed.addFields({
          name: `#${i + 1} — <t:${Math.floor(w.warnedAt.getTime() / 1000)}:R>`,
          value: `**Reason:** ${w.reason}\n**By:** <@${w.warnedBy}>`,
          inline: false,
        });
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
