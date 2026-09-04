import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isOwner } from "../lib/permissions.js";

export const addHeadDeveloperCommand = {
  data: new SlashCommandBuilder()
    .setName("addheaddeveloper")
    .setDescription("Add a staff member as Head Developer (Owner only)")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to add").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        content: "❌ Only Owners can add Head Developers.",
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
      await db
        .update(developersTable)
        .set({ role: "head_developer" })
        .where(eq(developersTable.userId, targetUser.id));
      await interaction.reply({
        content: `✅ **${targetUser.tag}** has been promoted to **Head Developer**.`,
      });
    } else {
      await db.insert(developersTable).values({
        userId: targetUser.id,
        username: targetUser.tag,
        role: "head_developer",
        addedBy: interaction.user.id,
      });
      await interaction.reply({
        content: `✅ **${targetUser.tag}** has been added as a **Head Developer**.`,
      });
    }
  },
};
