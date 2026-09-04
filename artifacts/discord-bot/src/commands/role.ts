import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const roleCommand = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Add or remove a role from a user")
    .addSubcommand(sub => sub.setName("add").setDescription("Add a role to a user")
      .addUserOption(opt => opt.setName("user").setDescription("User").setRequired(true))
      .addRoleOption(opt => opt.setName("role").setDescription("Role to add").setRequired(true)))
    .addSubcommand(sub => sub.setName("remove").setDescription("Remove a role from a user")
      .addUserOption(opt => opt.setName("user").setDescription("User").setRequired(true))
      .addRoleOption(opt => opt.setName("role").setDescription("Role to remove").setRequired(true))),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true }); return;
    }
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser("user", true);
    const role = interaction.options.getRole("role", true);
    const member = interaction.guild?.members.cache.get(target.id);
    if (!member) { await interaction.reply({ content: "❌ User not found.", ephemeral: true }); return; }

    if (sub === "add") {
      await member.roles.add(role.id, `Added by ${interaction.user.tag}`);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle("✅ Role Added").addFields({ name: "User", value: `${target.tag}`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true }).setTimestamp()] });
    } else {
      await member.roles.remove(role.id, `Removed by ${interaction.user.tag}`);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xed4245).setTitle("✅ Role Removed").addFields({ name: "User", value: `${target.tag}`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true }).setTimestamp()] });
    }
  },
};
