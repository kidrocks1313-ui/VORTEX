import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isHeadOrOwner } from "../lib/permissions.js";

export const retireDeveloperCommand = {
  data: new SlashCommandBuilder()
    .setName("retiredeveloper")
    .setDescription("Remove a staff member from the team (Head Dev or Owner)")
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("Staff member to retire")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isHeadOrOwner(interaction.user.id))) {
      await interaction.reply({
        content: "❌ Only Head Developers and Owners can retire staff members.",
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);

    const existing = await db
      .select()
      .from(developersTable)
      .where(eq(developersTable.userId, targetUser.id));

    if (existing.length === 0) {
      await interaction.reply({
        content: `❌ **${targetUser.tag}** is not a staff member.`,
        ephemeral: true,
      });
      return;
    }

    const role = existing[0]!.role.replace(/_/g, " ");
    await db
      .delete(developersTable)
      .where(eq(developersTable.userId, targetUser.id));

    await interaction.reply({
      content: `✅ **${targetUser.tag}** (${role}) has been retired from the team.`,
    });
  },
};
