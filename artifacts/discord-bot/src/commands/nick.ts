import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const nickCommand = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change a user's nickname")
    .addUserOption(opt => opt.setName("user").setDescription("User to rename").setRequired(true))
    .addStringOption(opt => opt.setName("nickname").setDescription("New nickname (leave blank to reset)").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true }); return;
    }
    const target = interaction.options.getUser("user", true);
    const nick = interaction.options.getString("nickname") ?? null;
    const member = interaction.guild?.members.cache.get(target.id);
    if (!member) { await interaction.reply({ content: "❌ User not found in this server.", ephemeral: true }); return; }

    await member.setNickname(nick, `Changed by ${interaction.user.tag}`);
    await interaction.reply({ content: nick ? `✅ Set **${target.username}**'s nickname to **${nick}**.` : `✅ Reset **${target.username}**'s nickname.`, ephemeral: true });
  },
};
