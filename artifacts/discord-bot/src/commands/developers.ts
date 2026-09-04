import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { db, developersTable } from "@workspace/db";
import { OWNER_IDS } from "../lib/permissions.js";

const roleOrder: Record<string, number> = {
  head_developer: 1,
  senior_developer: 2,
  developer: 3,
};

const roleLabels: Record<string, string> = {
  head_developer: "Head Developer",
  senior_developer: "Senior Developer",
  developer: "Developer",
  security: "Security",
};

export const developersCommand = {
  data: new SlashCommandBuilder()
    .setName("developers")
    .setDescription("View the full staff team list"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const allDevs = await db.select().from(developersTable);

    // Sort highest to lowest rank
    allDevs.sort(
      (a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99)
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("👑 Staff Team")
      .setTimestamp();

    // Fetch all owner usernames
    const ownerLines: string[] = [];
    for (const ownerId of OWNER_IDS) {
      try {
        const ownerUser = await interaction.client.users.fetch(ownerId);
        ownerLines.push(`<@${ownerId}> (${ownerUser.tag})`);
      } catch {
        ownerLines.push(`<@${ownerId}>`);
      }
    }

    embed.addFields({
      name: `👑 Owner${OWNER_IDS.length > 1 ? "s" : ""} (${OWNER_IDS.length})`,
      value: ownerLines.join("\n"),
      inline: false,
    });

    if (allDevs.length === 0) {
      embed.addFields({
        name: "Staff",
        value: "No staff members have been added yet.",
        inline: false,
      });
    } else {
      const grouped: Record<string, typeof allDevs> = {};
      for (const dev of allDevs) {
        if (!grouped[dev.role]) grouped[dev.role] = [];
        grouped[dev.role]!.push(dev);
      }

      const roleOrder2 = ["head_developer", "senior_developer", "developer", "security"];
      const roleEmojis: Record<string, string> = {
        head_developer: "🔷",
        senior_developer: "🔹",
        developer: "⚙️",
        security: "🛡️",
      };

      for (const role of roleOrder2) {
        const members = grouped[role];
        if (!members || members.length === 0) continue;

        const label = roleLabels[role] ?? role;
        const emoji = roleEmojis[role] ?? "•";
        const value = members
          .map((d) => `<@${d.userId}> (${d.username})`)
          .join("\n");

        embed.addFields({
          name: `${emoji} ${label} (${members.length})`,
          value,
          inline: false,
        });
      }
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
