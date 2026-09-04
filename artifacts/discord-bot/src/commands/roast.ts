import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const ROASTS = [
  "You're the reason the bot has a permission system.",
  "Your Wi-Fi password is probably 'password123'.",
  "You look like you'd argue with a Discord bot and lose.",
  "I've seen better decision-making in a coin flip.",
  "Your profile picture was clearly chosen at 3 AM.",
  "You type with two fingers and we can all tell.",
  "You're the human equivalent of a 404 error.",
  "Your Discord status says 'online' but your brain is clearly AFK.",
  "You're not the sharpest tool in the shed — you're more like the shed.",
  "I'd roast you harder but my bot's guidelines say I have to be somewhat reasonable.",
  "You're living proof that even bots have standards.",
  "You'd struggle to find Waldo if he was the only one in the picture.",
  "Your takes are so cold they could fix global warming.",
  "You remind me of a software update — nobody asked for you but here you are.",
  "You're the type to read the terms and conditions... and still get it wrong.",
];

export const roastCommand = {
  data: new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Roast someone 🔥")
    .addUserOption(opt => opt.setName("user").setDescription("User to roast (default: you)").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const r = ROASTS[Math.floor(Math.random() * ROASTS.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xff4500).setTitle("🔥 Roasted!").setDescription(`${user}...\n\n*${r}*`).setFooter({ text: "All in good fun 😄" }).setTimestamp()],
    });
  },
};
