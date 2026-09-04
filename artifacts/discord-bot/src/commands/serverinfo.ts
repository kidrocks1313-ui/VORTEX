import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const serverInfoCommand = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("View information about this server"),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
      return;
    }

    await guild.fetch();
    const owner = await guild.fetchOwner().catch(() => null);
    const channels = guild.channels.cache;
    const textChannels = channels.filter((c) => c.isTextBased()).size;
    const voiceChannels = channels.filter((c) => c.isVoiceBased()).size;
    const roles = guild.roles.cache.size - 1; // exclude @everyone

    const verificationLevels: Record<number, string> = {
      0: "None",
      1: "Low",
      2: "Medium",
      3: "High",
      4: "Very High",
    };

    const boostLevels: Record<number, string> = {
      0: "No Level",
      1: "Level 1",
      2: "Level 2",
      3: "Level 3",
    };

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: "📋 Server ID", value: guild.id, inline: true },
        { name: "👑 Owner", value: owner ? `${owner.user.tag}` : "Unknown", inline: true },
        { name: "📅 Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: "👥 Members", value: `${guild.memberCount}`, inline: true },
        { name: "💬 Text Channels", value: `${textChannels}`, inline: true },
        { name: "🔊 Voice Channels", value: `${voiceChannels}`, inline: true },
        { name: "🏷️ Roles", value: `${roles}`, inline: true },
        { name: "🚀 Boost Level", value: boostLevels[guild.premiumTier] ?? "Unknown", inline: true },
        { name: "✨ Boosts", value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
        { name: "🔒 Verification", value: verificationLevels[guild.verificationLevel] ?? "Unknown", inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 1024 }));
    }

    await interaction.reply({ embeds: [embed] });
  },
};
