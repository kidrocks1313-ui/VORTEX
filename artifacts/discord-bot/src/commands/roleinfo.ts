import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const roleinfoCommand = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("View information about a role")
    .addRoleOption(opt => opt.setName("role").setDescription("Role to inspect").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole("role", true);
    const fullRole = interaction.guild?.roles.cache.get(role.id);
    if (!fullRole) { await interaction.reply({ content: "❌ Role not found.", ephemeral: true }); return; }

    const perms = fullRole.permissions.toArray().slice(0, 10).join(", ") || "None";

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(fullRole.color || 0x5865f2).setTitle(`🏷️ Role: ${fullRole.name}`)
        .addFields(
          { name: "ID", value: fullRole.id, inline: true },
          { name: "Color", value: fullRole.hexColor, inline: true },
          { name: "Position", value: `${fullRole.position}`, inline: true },
          { name: "Members", value: `${fullRole.members.size}`, inline: true },
          { name: "Mentionable", value: fullRole.mentionable ? "Yes" : "No", inline: true },
          { name: "Hoisted", value: fullRole.hoist ? "Yes" : "No", inline: true },
          { name: "Created", value: `<t:${Math.floor(fullRole.createdTimestamp / 1000)}:R>`, inline: true },
          { name: "Permissions", value: perms, inline: false },
        ).setTimestamp()],
    });
  },
};
