import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { db, blacklistTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isDeveloperOrOwner } from "../lib/permissions.js";

export const globalBlacklistCommand = {
  data: new SlashCommandBuilder()
    .setName("globalblacklist")
    .setDescription("Manage the global blacklist")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a user to the global blacklist")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("User to blacklist")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("reason")
            .setDescription("Reason for blacklisting")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a user from the global blacklist")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("User to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("check")
        .setDescription("Check if a user is globally blacklisted")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("User to check").setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser("user", true);

    // Permission check for add/remove/check
    if (!(await isDeveloperOrOwner(interaction.user.id))) {
      await interaction.reply({
        content:
          "❌ You do not have permission to use this command. Only owners and staff members can use the global blacklist.",
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "add") {
      const reason =
        interaction.options.getString("reason") ?? "No reason provided";

      // Check already blacklisted
      const existing = await db
        .select()
        .from(blacklistTable)
        .where(eq(blacklistTable.userId, targetUser.id));
      if (existing.length > 0) {
        await interaction.reply({
          content: `❌ **${targetUser.tag}** is already globally blacklisted.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      // Save to DB
      await db.insert(blacklistTable).values({
        userId: targetUser.id,
        username: targetUser.tag,
        addedBy: interaction.user.id,
        reason,
      });

      // DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("⛔ You have been globally blacklisted")
          .setDescription(
            `You have been added to the global blacklist and will be banned from all servers managed by this bot.`
          )
          .addFields({ name: "Reason", value: reason })
          .setTimestamp();
        await targetUser.send({ embeds: [dmEmbed] });
      } catch {
        // User has DMs disabled — continue anyway
      }

      // Ban from all guilds
      let bannedCount = 0;
      for (const [, guild] of interaction.client.guilds.cache) {
        try {
          await guild.bans.create(targetUser.id, {
            reason: `Global Blacklist: ${reason}`,
          });
          bannedCount++;
        } catch {
          // No ban permission in this guild
        }
      }

      await interaction.editReply(
        `✅ **${targetUser.tag}** has been globally blacklisted and banned from **${bannedCount}** server(s).\n**Reason:** ${reason}`
      );
    } else if (subcommand === "remove") {
      const existing = await db
        .select()
        .from(blacklistTable)
        .where(eq(blacklistTable.userId, targetUser.id));
      if (existing.length === 0) {
        await interaction.reply({
          content: `❌ **${targetUser.tag}** is not in the global blacklist.`,
          ephemeral: true,
        });
        return;
      }

      await db
        .delete(blacklistTable)
        .where(eq(blacklistTable.userId, targetUser.id));
      await interaction.reply({
        content: `✅ **${targetUser.tag}** has been removed from the global blacklist.`,
        ephemeral: true,
      });
    } else if (subcommand === "check") {
      const existing = await db
        .select()
        .from(blacklistTable)
        .where(eq(blacklistTable.userId, targetUser.id));

      if (existing.length === 0) {
        await interaction.reply({
          content: `✅ **${targetUser.tag}** is **not** globally blacklisted.`,
          ephemeral: true,
        });
        return;
      }

      const entry = existing[0]!;
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("⛔ Globally Blacklisted")
        .setDescription(`**${targetUser.tag}** is on the global blacklist.`)
        .addFields(
          { name: "Reason", value: entry.reason ?? "No reason provided" },
          { name: "User ID", value: entry.userId },
          {
            name: "Blacklisted At",
            value: `<t:${Math.floor(entry.addedAt.getTime() / 1000)}:F>`,
          }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
