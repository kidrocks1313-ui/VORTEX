import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isOwner } from "../lib/permissions.js";

export const removeHeadDeveloperCommand = {
  data: new SlashCommandBuilder()
    .setName("removeheaddeveloper")
    .setDescription("Remove a Head Developer from the team (Owner only)")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Head Developer to remove").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        content: "❌ Only Owners can remove Head Developers.",
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);

    const existing = await db
      .select()
      .from(developersTable)
      .where(eq(developersTable.userId, targetUser.id));

    if (existing.length === 0 || existing[0]!.role !== "head_developer") {
      await interaction.reply({
        content: `❌ **${targetUser.tag}** is not a Head Developer.`,
        ephemeral: true,
      });
      return;
    }

    await db.delete(developersTable).where(eq(developersTable.userId, targetUser.id));

    await interaction.reply({
      content: `✅ **${targetUser.tag}** has been removed from the team.`,
    });
  },
};
