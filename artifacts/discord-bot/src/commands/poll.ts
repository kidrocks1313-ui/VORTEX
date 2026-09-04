import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const pollCommand = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll")
    .addStringOption((opt) => opt.setName("question").setDescription("The poll question").setRequired(true))
    .addStringOption((opt) => opt.setName("option1").setDescription("Option 1").setRequired(true))
    .addStringOption((opt) => opt.setName("option2").setDescription("Option 2").setRequired(true))
    .addStringOption((opt) => opt.setName("option3").setDescription("Option 3").setRequired(false))
    .addStringOption((opt) => opt.setName("option4").setDescription("Option 4").setRequired(false))
    .addStringOption((opt) => opt.setName("option5").setDescription("Option 5").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("question", true);
    const NUMS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
    const options = [1, 2, 3, 4, 5]
      .map((n) => interaction.options.getString(`option${n}`))
      .filter(Boolean) as string[];

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📊 " + question)
      .setDescription(options.map((o, i) => `${NUMS[i]} ${o}`).join("\n\n"))
      .setFooter({ text: `Poll by ${interaction.user.tag}` })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await msg.react(NUMS[i]!);
    }
  },
};
