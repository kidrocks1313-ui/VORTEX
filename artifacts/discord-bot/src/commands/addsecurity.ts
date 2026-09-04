import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isSeniorOrAbove, OWNER_IDS } from "../lib/permissions.js";

export const addSecurityCommand = {
  data: new SlashCommandBuilder()
    .setName("addsecurity")
    .setDescription("Add a staff member as Security (Senior Dev, Head Dev, or Owner)")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to add").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isSeniorOrAbove(interaction.user.id))) {
      await interaction.reply({
        content: "❌ Only Senior Developers, Head Developers, and Owners can add Security members.",
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

    await interaction.deferReply();

    await db.insert(developersTable).values({
      userId: targetUser.id,
      username: targetUser.tag,
      role: "security",
      addedBy: interaction.user.id,
    });

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
            reason: "Security alert invite",
          });
          inviteUrl = invite.url;
        }
      }
    } catch {
      // Could not create invite
    }

    const alertEmbed = new EmbedBuilder()
      .setColor(0xff9900)
      .setTitle("🛡️ Security Alert")
      .setDescription(
        `**${serverName}** is in need of security support!\n\nPlease check the server and make sure everything is under control.`
      )
      .addFields(
        { name: "Server", value: serverName, inline: true },
        { name: "Requested by", value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
        { name: "Server Link", value: inviteUrl, inline: false }
      )
      .setTimestamp();

    // Collect all user IDs to DM: owners + all developers
    const allDevs = await db.select().from(developersTable);
    const devIds = allDevs.map((d) => d.userId);
    const allIds = [...new Set([...OWNER_IDS, ...devIds])];

    let dmCount = 0;
    for (const userId of allIds) {
      try {
        const user = await interaction.client.users.fetch(userId);
        await user.send({ content: `<@${userId}> 🚨 **Security alert — your attention is needed!**`, embeds: [alertEmbed] });
        dmCount++;
      } catch {
        // User has DMs disabled or not found
      }
    }

    await interaction.editReply(
      `✅ **${targetUser.tag}** has been added as **Security**.\n📨 Security alert sent to **${dmCount}** staff member(s).`
    );
  },
};
