import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { OWNER_IDS } from "../lib/permissions.js";

export const requestSecurityCommand = {
  data: new SlashCommandBuilder()
    .setName("requestsecurity")
    .setDescription("Send a security alert to all staff members and owners"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const serverName = interaction.guild?.name ?? "a server";

    // Generate a server invite link
    let inviteUrl = "No invite available";
    try {
      if (interaction.guild) {
        const channel = interaction.guild.channels.cache
          .filter((c) => c.isTextBased() && c.permissionsFor(interaction.guild!.members.me!)?.has("CreateInstantInvite"))
          .first();
        if (channel) {
          const invite = await interaction.guild.invites.create(channel.id, {
            maxAge: 0,
            maxUses: 0,
            reason: "Security request invite",
          });
          inviteUrl = invite.url;
        }
      }
    } catch {
      // Could not create invite
    }

    const alertEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("🚨 Security Requested")
      .setDescription(
        `**${serverName}** is requesting security support!\n\nPlease check the server and make sure everything is under control.`
      )
      .addFields(
        { name: "Server", value: serverName, inline: true },
        { name: "Requested by", value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
        { name: "Server Link", value: inviteUrl, inline: false }
      )
      .setTimestamp();

    // DM all owners + all staff
    const allDevs = await db.select().from(developersTable);
    const devIds = allDevs.map((d) => d.userId);
    const allIds = [...new Set([...OWNER_IDS, ...devIds])];

    let dmCount = 0;
    for (const userId of allIds) {
      try {
        const user = await interaction.client.users.fetch(userId);
        await user.send({
          content: `<@${userId}> 🚨 **Security requested — your attention is needed!**`,
          embeds: [alertEmbed],
        });
        dmCount++;
      } catch {
        // DMs disabled or user not found
      }
    }

    await interaction.editReply(
      `✅ Security alert sent to **${dmCount}** staff member(s) and owner(s).`
    );
  },
};
