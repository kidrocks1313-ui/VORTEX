import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isSeniorOrAbove } from "../lib/permissions.js";

export const removeDeveloperCommand = {
  data: new SlashCommandBuilder()
    .setName("removedeveloper")
    .setDescription("Remove a Developer from the team (Senior Dev, Head Dev, or Owner)")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Developer to remove").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isSeniorOrAbove(interaction.user.id))) {
      await interaction.reply({
        content: "❌ Only Senior Developers, Head Developers, and Owners can remove Developers.",
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);

    const existing = await db
      .select()
      .from(developersTable)
      .where(eq(developersTable.userId, targetUser.id));

    if (existing.length === 0 || existing[0]!.role !== "developer") {
      await interaction.reply({
        content: `❌ **${targetUser.tag}** is not a Developer.`,
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
