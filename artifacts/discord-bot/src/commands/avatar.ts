import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const avatarCommand = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View someone's avatar")
    .addUserOption(opt => opt.setName("user").setDescription("User to view (default: you)").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const member = interaction.guild?.members.cache.get(user.id);
    const globalUrl = user.displayAvatarURL({ size: 1024 });
    const serverUrl = member?.displayAvatarURL({ size: 1024 });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🖼️ ${user.username}'s Avatar`)
      .setImage(serverUrl ?? globalUrl)
      .addFields({ name: "🔗 Links", value: `[Global Avatar](${globalUrl})${serverUrl && serverUrl !== globalUrl ? ` | [Server Avatar](${serverUrl})` : ""}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
