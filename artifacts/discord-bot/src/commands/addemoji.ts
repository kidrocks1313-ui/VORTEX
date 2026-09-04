import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const addemojiCommand = {
  data: new SlashCommandBuilder()
    .setName("addemoji")
    .setDescription("Add an emoji to this server from a URL")
    .addStringOption(opt => opt.setName("name").setDescription("Emoji name").setRequired(true))
    .addStringOption(opt => opt.setName("url").setDescription("Image URL (png/jpg/gif)").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true }); return;
    }
    const name = interaction.options.getString("name", true).replace(/\s/g, "_");
    const url = interaction.options.getString("url", true);

    try {
      const emoji = await interaction.guild!.emojis.create({ name, attachment: url, reason: `Added by ${interaction.user.tag}` });
      await interaction.reply({ content: `✅ Emoji **${emoji.name}** added! ${emoji}` });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to add emoji: ${e}`, ephemeral: true });
    }
  },
};
