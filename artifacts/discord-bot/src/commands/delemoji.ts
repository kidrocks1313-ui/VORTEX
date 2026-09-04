import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const delemojiCommand = {
  data: new SlashCommandBuilder()
    .setName("delemoji")
    .setDescription("Delete an emoji from this server")
    .addStringOption(opt => opt.setName("name").setDescription("Emoji name to delete").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true }); return;
    }
    const name = interaction.options.getString("name", true);
    const emoji = interaction.guild!.emojis.cache.find(e => e.name === name);
    if (!emoji) { await interaction.reply({ content: `❌ No emoji named **${name}** found.`, ephemeral: true }); return; }

    await emoji.delete(`Deleted by ${interaction.user.tag}`);
    await interaction.reply({ content: `✅ Emoji **${name}** deleted.` });
  },
};
