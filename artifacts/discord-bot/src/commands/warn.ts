import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db, warningsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const warnCommand = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user in this server")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to warn").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the warning").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to warn members.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const guildId = interaction.guildId!;

    await db.insert(warningsTable).values({
      userId: targetUser.id,
      guildId,
      reason,
      warnedBy: interaction.user.id,
    });

    // Get total warning count for this user in this server
    const allWarnings = await db
      .select()
      .from(warningsTable)
      .where(and(eq(warningsTable.userId, targetUser.id), eq(warningsTable.guildId, guildId)));

    await targetUser.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xfee75c)
          .setTitle("⚠️ You have been warned")
          .setDescription(`You received a warning in **${interaction.guild?.name}**.`)
          .addFields(
            { name: "Reason", value: reason },
            { name: "Total Warnings", value: `${allWarnings.length}` }
          )
          .setTimestamp(),
      ],
    }).catch(() => null);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xfee75c)
          .setTitle("⚠️ User Warned")
          .addFields(
            { name: "User", value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Total Warnings", value: `${allWarnings.length}`, inline: true },
            { name: "Reason", value: reason }
          )
          .setTimestamp(),
      ],
    });
  },
};
