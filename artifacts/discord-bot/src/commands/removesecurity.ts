import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isHeadOrOwner } from "../lib/permissions.js";

export const removeSecurityCommand = {
  data: new SlashCommandBuilder()
    .setName("removesecurity")
    .setDescription("Remove a Security member from the team (Head Dev or Owner)")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Security member to remove").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isHeadOrOwner(interaction.user.id))) {
      await interaction.reply({
        content: "❌ Only Head Developers and Owners can remove Security members.",
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);

    const existing = await db
      .select()
      .from(developersTable)
      .where(eq(developersTable.userId, targetUser.id));

    if (existing.length === 0 || existing[0]!.role !== "security") {
      await interaction.reply({
        content: `❌ **${targetUser.tag}** is not a Security member.`,
        ephemeral: true,
      });
      return;
    }

    await db.delete(developersTable).where(eq(developersTable.userId, targetUser.id));

    await interaction.reply({
      content: `✅ **${targetUser.tag}** has been removed from the Security team.`,
    });
  },
};
