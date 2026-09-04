import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";

type Suit = "♠️" | "♥️" | "♦️" | "♣️";
type Card = { suit: Suit; value: string; points: number };

const SUITS: Suit[] = ["♠️", "♥️", "♦️", "♣️"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      const points = value === "A" ? 11 : ["J", "Q", "K"].includes(value) ? 10 : parseInt(value);
      deck.push({ suit, value, points });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function handTotal(hand: Card[]): number {
  let total = hand.reduce((sum, c) => sum + c.points, 0);
  let aces = hand.filter((c) => c.value === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function handString(hand: Card[], hideSecond = false): string {
  return hand
    .map((c, i) => (hideSecond && i === 1 ? "🂠 Hidden" : `${c.value}${c.suit}`))
    .join("  ");
}

function buildEmbed(
  playerHand: Card[],
  dealerHand: Card[],
  status: string,
  color: number,
  hideDealer: boolean
): EmbedBuilder {
  const dealerTotal = hideDealer ? "?" : handTotal(dealerHand);
  return new EmbedBuilder()
    .setColor(color)
    .setTitle("🃏 Blackjack")
    .addFields(
      {
        name: `🤖 Dealer's Hand ${hideDealer ? "" : `(${dealerTotal})`}`,
        value: handString(dealerHand, hideDealer),
        inline: false,
      },
      {
        name: `👤 Your Hand (${handTotal(playerHand)})`,
        value: handString(playerHand),
        inline: false,
      },
      { name: "Status", value: status, inline: false }
    );
}

function buildButtons(disabled = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("bj_hit")
      .setLabel("Hit")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🃏")
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("bj_stand")
      .setLabel("Stand")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🛑")
      .setDisabled(disabled)
  );
}

export const blackjackCommand = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Play a game of Blackjack against the dealer"),

  async execute(interaction: ChatInputCommandInteraction) {
    const deck = buildDeck();
    const playerHand: Card[] = [deck.pop()!, deck.pop()!];
    const dealerHand: Card[] = [deck.pop()!, deck.pop()!];

    // Natural blackjack check
    if (handTotal(playerHand) === 21) {
      const embed = buildEmbed(playerHand, dealerHand, "🎉 **Blackjack! You win!**", 0x57f287, false);
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const msg = await interaction.reply({
      embeds: [buildEmbed(playerHand, dealerHand, "Your turn! Hit or Stand?", 0x5865f2, true)],
      components: [buildButtons()],
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
    });

    collector.on("collect", async (btn) => {
      await btn.deferUpdate();

      if (btn.customId === "bj_hit") {
        playerHand.push(deck.pop()!);
        const total = handTotal(playerHand);

        if (total > 21) {
          collector.stop("bust");
          await interaction.editReply({
            embeds: [buildEmbed(playerHand, dealerHand, `💥 **Bust! You went over 21 with ${total}. Dealer wins.**`, 0xed4245, false)],
            components: [buildButtons(true)],
          });
          return;
        }

        if (total === 21) {
          collector.stop("21");
        } else {
          await interaction.editReply({
            embeds: [buildEmbed(playerHand, dealerHand, `Total: **${total}** — Hit or Stand?`, 0x5865f2, true)],
            components: [buildButtons()],
          });
        }
      }

      if (btn.customId === "bj_stand" || handTotal(playerHand) === 21) {
        // Dealer plays
        while (handTotal(dealerHand) < 17) {
          dealerHand.push(deck.pop()!);
        }

        const playerTotal = handTotal(playerHand);
        const dealerTotal = handTotal(dealerHand);

        let status: string;
        let color: number;

        if (dealerTotal > 21) {
          status = `🎉 **Dealer busted (${dealerTotal})! You win!**`;
          color = 0x57f287;
        } else if (playerTotal > dealerTotal) {
          status = `🎉 **You win! ${playerTotal} vs ${dealerTotal}.**`;
          color = 0x57f287;
        } else if (dealerTotal > playerTotal) {
          status = `😔 **Dealer wins! ${dealerTotal} vs ${playerTotal}.**`;
          color = 0xed4245;
        } else {
          status = `🤝 **It's a tie! Both have ${playerTotal}.**`;
          color = 0xfee75c;
        }

        collector.stop("done");
        await interaction.editReply({
          embeds: [buildEmbed(playerHand, dealerHand, status, color, false)],
          components: [buildButtons(true)],
        });
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await interaction.editReply({
          embeds: [buildEmbed(playerHand, dealerHand, "⏱️ **Game timed out.**", 0x747f8d, true)],
          components: [buildButtons(true)],
        });
      }
    });
  },
};
