import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import {
  ChannelType,
  ChatInputCommandInteraction,
  DMChannel,
  GuildTextBasedChannel,
  Message,
} from "discord.js";
import { guessCommand } from "../commands/guess.js";

type GuildChannelDouble = Pick<
  GuildTextBasedChannel,
  "createMessageCollector"
>;
type DmChannelDouble = Pick<DMChannel, "type">;
type MessageCollectorDouble = ReturnType<
  GuildTextBasedChannel["createMessageCollector"]
>;
type ComponentCollectorDouble = Pick<
  ReturnType<Message["createMessageComponentCollector"]>,
  "on"
>;
type MessageDouble = {
  createMessageComponentCollector: () => ComponentCollectorDouble;
};

type InteractionDouble = ChatInputCommandInteraction & {
  replies: unknown[];
};

function createCollectorDouble<T>(): T {
  return new EventEmitter() as T;
}

function createInteraction(inGuild: boolean) {
  const replies: unknown[] = [];
  let messageCollectorCalls = 0;
  let componentCollectorCalls = 0;

  const messageCollector = createCollectorDouble<MessageCollectorDouble>();
  const componentCollector = createCollectorDouble<ComponentCollectorDouble>();
  const channel: GuildChannelDouble | DmChannelDouble = inGuild
    ? {
        createMessageCollector: () => {
          messageCollectorCalls++;
          return messageCollector;
        },
      }
    : { type: ChannelType.DM };
  const message: MessageDouble = {
    createMessageComponentCollector: () => {
      componentCollectorCalls++;
      return componentCollector;
    },
  };

  const interaction = {
    inGuild: () => inGuild,
    channel,
    user: { id: "player-id" },
    reply: async (payload: unknown) => {
      replies.push(payload);
      return message;
    },
    editReply: async (payload: unknown) => {
      replies.push(payload);
      return message;
    },
    replies,
  } as unknown as InteractionDouble;

  return {
    interaction,
    replies,
    get messageCollectorCalls() {
      return messageCollectorCalls;
    },
    get componentCollectorCalls() {
      return componentCollectorCalls;
    },
  };
}

describe("/guess command", () => {
  it("explains that it is server-only when used in a direct message", async () => {
    const testInteraction = createInteraction(false);

    await guessCommand.execute(testInteraction.interaction);

    assert.deepEqual(testInteraction.replies, [
      {
        content: "❌ The /guess command can only be played in a server text channel.",
        ephemeral: true,
      },
    ]);
    assert.equal(testInteraction.messageCollectorCalls, 0);
    assert.equal(testInteraction.componentCollectorCalls, 0);
  });

  it("starts both game collectors after replying in a guild", async () => {
    const testInteraction = createInteraction(true);

    await guessCommand.execute(testInteraction.interaction);

    assert.equal(testInteraction.replies.length, 1);
    const initialReply = testInteraction.replies[0] as {
      embeds: Array<{ data: { title?: string; description?: string } }>;
      components: unknown[];
      fetchReply: boolean;
    };
    assert.equal(initialReply.fetchReply, true);
    assert.equal(initialReply.embeds[0]?.data.title, "🔢 Number Guessing Game");
    assert.match(
      initialReply.embeds[0]?.data.description ?? "",
      /between \*\*1 and 100\*\*/,
    );
    assert.equal(initialReply.components.length, 1);
    assert.equal(testInteraction.messageCollectorCalls, 1);
    assert.equal(testInteraction.componentCollectorCalls, 1);
  });
});