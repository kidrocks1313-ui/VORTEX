import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isOwner } from "../lib/permissions.js";

export const inviteLinkCommand = {
  data: new SlashCommandBuilder()
    .setName("invitelink")
    .setDescription("Get the bot's invite link (Owner only)"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        content: "❌ Only Owners can get the invite link.",
        ephemeral: true,
      });
      return;
    }

    const clientId = process.env.DISCORD_CLIENT_ID!;
    const permissions = "8"; // Administrator
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot+applications.commands`;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🔗 Bot Invite Link")
      .setDescription(
        `Use the link below to add the bot to any server you have **Manage Server** permission in.`
      )
      .addFields({ name: "Invite Link", value: `[Click here to invite the bot](${inviteUrl})\n\`${inviteUrl}\`` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
