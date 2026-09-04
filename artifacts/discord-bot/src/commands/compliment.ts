import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const COMPLIMENTS = [
  "You make the world a better place just by being in it! 🌟",
  "Your smile could light up the entire server. 😊",
  "You're incredibly smart and capable of anything you set your mind to! 🧠",
  "You have an amazing sense of humor! 😂",
  "The way you carry yourself is truly inspiring. 💫",
  "You're one of the most genuine people around! ❤️",
  "You make everyone around you feel valued and appreciated. 🥰",
  "Your creativity is absolutely next-level! 🎨",
  "You have an incredible ability to make people feel at ease. ✨",
  "You're the kind of person that makes everyone's day better! 🌈",
  "Your positivity is absolutely contagious! ☀️",
  "You're stronger than you know and braver than you think. 💪",
  "People are so lucky to have you in their lives! 🍀",
  "You bring so much joy and energy wherever you go! 🎉",
  "You're literally one of the coolest people ever. 😎",
];

export const complimentCommand = {
  data: new SlashCommandBuilder()
    .setName("compliment")
    .setDescription("Give someone a compliment 💕")
    .addUserOption(opt => opt.setName("user").setDescription("User to compliment (default: you)").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]!;
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xff69b4).setTitle("💕 Compliment").setDescription(`Hey ${user}!\n\n${c}`).setTimestamp()],
    });
  },
};
