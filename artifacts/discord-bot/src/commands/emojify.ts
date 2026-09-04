import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

const MAP: Record<string, string> = {
  a:"🅰️",b:"🅱️",c:"🇨",d:"🇩",e:"🇪",f:"🇫",g:"🇬",h:"🇭",i:"ℹ️",j:"🇯",
  k:"🇰",l:"🇱",m:"Ⓜ️",n:"🇳",o:"🅾️",p:"🅿️",q:"🇶",r:"🇷",s:"🇸",t:"🇹",
  u:"🇺",v:"🇻",w:"🇼",x:"❌",y:"🇾",z:"💤",
  "0":"0️⃣","1":"1️⃣","2":"2️⃣","3":"3️⃣","4":"4️⃣","5":"5️⃣","6":"6️⃣","7":"7️⃣","8":"8️⃣","9":"9️⃣",
  "!":"❗","?":"❓"," ":"   ",
};

export const emojifyCommand = {
  data: new SlashCommandBuilder()
    .setName("emojify")
    .setDescription("Convert text to emojis")
    .addStringOption((opt) => opt.setName("text").setDescription("Text to emojify").setRequired(true).setMaxLength(50)),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString("text", true).toLowerCase();
    const result = [...text].map((c) => MAP[c] ?? c).join(" ");

    if (result.length > 2000) {
      await interaction.reply({ content: "❌ Text too long after conversion!", ephemeral: true });
      return;
    }

    await interaction.reply({ content: result });
  },
};
