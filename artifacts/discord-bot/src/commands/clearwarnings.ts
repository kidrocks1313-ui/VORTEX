import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db, warningsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const clearWarningsCommand = {
  data: new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings for a user in this server")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to clear warnings for").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to clear warnings.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const guildId = interaction.guildId!;

    const existing = await db
      .select()
      .from(warningsTable)
      .where(and(eq(warningsTable.userId, targetUser.id), eq(warningsTable.guildId, guildId)));

    if (existing.length === 0) {
      await interaction.reply({ content: `❌ **${targetUser.tag}** has no warnings to clear.`, ephemeral: true });
      return;
    }

    await db.delete(warningsTable).where(
      and(eq(warningsTable.userId, targetUser.id), eq(warningsTable.guildId, guildId))
    );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle("✅ Warnings Cleared")
          .addFields(
            { name: "User", value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
            { name: "Warnings Removed", value: `${existing.length}`, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true }
          )
          .setTimestamp(),
      ],
    });
  },
};
