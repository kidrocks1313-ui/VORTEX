import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const vcmuteCommand = {
  data: new SlashCommandBuilder()
    .setName("vcmute")
    .setDescription("Server-mute a user in voice chat")
    .addUserOption(opt => opt.setName("user").setDescription("User to server-mute").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true }); return;
    }
    const target = interaction.options.getUser("user", true);
    const member = interaction.guild?.members.cache.get(target.id);
    if (!member?.voice.channel) { await interaction.reply({ content: "❌ That user is not in a voice channel.", ephemeral: true }); return; }

    await member.voice.setMute(true, `Server-muted by ${interaction.user.tag}`);
    await interaction.reply({ content: `🔇 **${target.username}** has been server-muted in VC.` });
  },
};
