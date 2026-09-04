import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isSeniorOrAbove } from "../lib/permissions.js";

export const addDeveloperCommand = {
  data: new SlashCommandBuilder()
    .setName("adddeveloper")
    .setDescription("Add a staff member as Developer (Senior Dev, Head Dev, or Owner)")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to add").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isSeniorOrAbove(interaction.user.id))) {
      await interaction.reply({
        content: "❌ Only Senior Developers, Head Developers, and Owners can add Developers.",
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
      await interaction.reply({
        content: `❌ **${targetUser.tag}** is already a staff member (${existing[0]!.role.replace(/_/g, " ")}).`,
        ephemeral: true,
      });
      return;
    }

    await db.insert(developersTable).values({
      userId: targetUser.id,
      username: targetUser.tag,
      role: "developer",
      addedBy: interaction.user.id,
    });

    await interaction.reply({
      content: `✅ **${targetUser.tag}** has been added as a **Developer**.`,
    });
  },
};
