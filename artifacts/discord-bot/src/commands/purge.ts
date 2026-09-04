import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { isServerAdminOrAbove } from "../lib/permissions.js";

export const purgeCommand = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete multiple messages in this channel")
    .addIntegerOption((opt) =>
      opt.setName("amount").setDescription("Number of messages to delete (1-100)").setMinValue(1).setMaxValue(100).setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Only delete messages from this user (optional)").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await isServerAdminOrAbove(interaction.user.id, interaction))) {
      await interaction.reply({ content: "❌ You need Administrator permission to purge messages.", ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger("amount", true);
    const targetUser = interaction.options.getUser("user");
    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await channel.messages.fetch({ limit: amount });
      const toDelete = targetUser
        ? messages.filter((m) => m.author.id === targetUser.id)
        : messages;

      const deleted = await channel.bulkDelete(toDelete, true);

      await interaction.editReply(
        `✅ Deleted **${deleted.size}** message(s)${targetUser ? ` from **${targetUser.tag}**` : ""}.`
      );
    } catch (e) {
      await interaction.editReply(`❌ Failed to delete messages: ${e}`);
    }
  },
};
