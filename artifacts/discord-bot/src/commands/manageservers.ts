import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { isOwner } from "../lib/permissions.js";

export const manageServersCommand = {
  data: new SlashCommandBuilder()
    .setName("manageservers")
    .setDescription("View all servers the bot is in and remove it from ones you don't want (Owner only)"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        content: "❌ Only Owners can manage servers.",
        ephemeral: true,
      });
      return;
    }

    const guilds = [...interaction.client.guilds.cache.values()];

    if (guilds.length === 0) {
      await interaction.reply({
        content: "❌ The bot is not in any servers.",
        ephemeral: true,
      });
      return;
    }

    // Discord select menus support max 25 options
    const options = guilds.slice(0, 25).map((guild) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(guild.name.slice(0, 100))
        .setDescription(`ID: ${guild.id} · Members: ${guild.memberCount}`)
        .setValue(guild.id)
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("leave_servers")
      .setPlaceholder("Select servers for the bot to LEAVE...")
      .setMinValues(1)
      .setMaxValues(options.length)
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const listEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🌐 Server Management")
      .setDescription(
        `The bot is currently in **${guilds.length}** server(s).\n\nSelect the servers below that you want the bot to **leave**. This cannot be undone.`
      )
      .addFields(
        guilds.slice(0, 25).map((guild) => ({
          name: guild.name,
          value: `ID: \`${guild.id}\` · Members: ${guild.memberCount}`,
          inline: true,
        }))
      )
      .setTimestamp();

    const reply = await interaction.reply({
      embeds: [listEmbed],
      components: [row],
      ephemeral: true,
    });

    // Wait for the user to select servers (2 minute timeout)
    try {
      const selection = await reply.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 120_000,
      });

      await selection.deferUpdate();

      const selectedIds = selection.values;
      const left: string[] = [];
      const failed: string[] = [];

      for (const guildId of selectedIds) {
        const guild = interaction.client.guilds.cache.get(guildId);
        if (!guild) {
          failed.push(guildId);
          continue;
        }
        try {
          const name = guild.name;
          await guild.leave();
          left.push(name);
        } catch {
          failed.push(guild.name);
        }
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(left.length > 0 ? 0x57f287 : 0xed4245)
        .setTitle("✅ Server Management Complete")
        .setTimestamp();

      if (left.length > 0) {
        resultEmbed.addFields({
          name: `Left ${left.length} server(s)`,
          value: left.map((n) => `• ${n}`).join("\n"),
          inline: false,
        });
      }

      if (failed.length > 0) {
        resultEmbed.addFields({
          name: `Failed to leave ${failed.length} server(s)`,
          value: failed.map((n) => `• ${n}`).join("\n"),
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [resultEmbed], components: [] });
    } catch {
      // Timed out
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setDescription("⏱️ Timed out — no servers were removed."),
        ],
        components: [],
      });
    }
  },
};
