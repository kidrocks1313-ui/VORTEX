import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { OWNER_IDS } from "../lib/permissions.js";

const startTime = Date.now();

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export const botInfoCommand = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("View information about this bot"),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const uptime = formatUptime(Date.now() - startTime);
    const serverCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

    // Fetch owner usernames
    const ownerNames: string[] = [];
    for (const id of OWNER_IDS) {
      try {
        const user = await client.users.fetch(id);
        ownerNames.push(`${user.tag}`);
      } catch {
        ownerNames.push(`<@${id}>`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${client.user?.username ?? "Bot"} Info`)
      .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null)
      .addFields(
        { name: "🤖 Bot Name", value: client.user?.tag ?? "Unknown", inline: true },
        { name: "🆔 Bot ID", value: client.user?.id ?? "Unknown", inline: true },
        { name: "👑 Owner(s)", value: ownerNames.join(", ") || "None", inline: false },
        { name: "🌐 Servers", value: `${serverCount}`, inline: true },
        { name: "👥 Total Users", value: `${userCount}`, inline: true },
        { name: "⏱️ Uptime", value: uptime, inline: true },
        { name: "📡 Ping", value: `${client.ws.ping}ms`, inline: true },
        { name: "📚 Library", value: "discord.js v14", inline: true },
        { name: "🛠️ Node.js", value: process.version, inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
