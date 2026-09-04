import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isDeveloperOrOwner } from "../lib/permissions.js";

export const addSeniorDeveloperCommand = {
  data: new SlashCommandBuilder()
    .setName("addseniordeveloper")
    .setDescription("Add a staff member as Senior Developer")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to add").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isDeveloperOrOwner(interaction.user.id))) {
      await interaction.reply({
        content: "❌ Only owners and staff members can manage the team.",
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);

    const existing = await db
      .select()
      .from(developersTable)
      .where(eq(developersTable.userId, targetUser.id));

    if (existing.length > 0) {
      // Update their role
      await db
        .update(developersTable)
        .set({ role: "senior_developer" })
        .where(eq(developersTable.userId, targetUser.id));
      await interaction.reply({
        content: `✅ **${targetUser.tag}** has been promoted to **Senior Developer**.`,
      });
    } else {
      await db.insert(developersTable).values({
        userId: targetUser.id,
        username: targetUser.tag,
        role: "senior_developer",
        addedBy: interaction.user.id,
      });
      await interaction.reply({
        content: `✅ **${targetUser.tag}** has been added as a **Senior Developer**.`,
      });
    }
  },
};
