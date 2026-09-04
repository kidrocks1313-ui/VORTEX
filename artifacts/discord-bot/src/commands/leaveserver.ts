import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isOwner } from "../lib/permissions.js";

export const leaveServerCommand = {
  data: new SlashCommandBuilder()
    .setName("leaveserver")
    .setDescription("Make the bot leave a specific server (Owner only)")
    .addStringOption((opt) =>
      opt
        .setName("serverid")
        .setDescription("The ID of the server to leave")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        content: "❌ Only Owners can remove the bot from servers.",
        ephemeral: true,
      });
      return;
    }

    const serverId = interaction.options.getString("serverid", true).trim();
    const guild = interaction.client.guilds.cache.get(serverId);

    if (!guild) {
      // List available servers to help
      const serverList = [...interaction.client.guilds.cache.values()]
        .map((g) => `• **${g.name}** — \`${g.id}\``)
        .join("\n");

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle("❌ Server Not Found")
            .setDescription(`The bot is not in a server with ID \`${serverId}\`.\n\n**Servers the bot is in:**\n${serverList || "None"}`)
        ],
        ephemeral: true,
      });
      return;
    }

    const serverName = guild.name;

    // Can't leave the server the command was run in without replying first
    await interaction.reply({
      content: `✅ Leaving **${serverName}**...`,
      ephemeral: true,
    });

    await guild.leave();
  },
};
