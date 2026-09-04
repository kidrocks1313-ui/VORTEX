import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import { db, blacklistTable } from "@workspace/db";
import { globalBlacklistCommand } from "../commands/globalblacklist.js";
import {
  setPermissionStoreForTests,
  type PermissionStore,
} from "../lib/permissions.js";

type Role = "developer" | "senior_developer" | "head_developer" | "security";
type Subcommand = "add" | "remove" | "check";

const roleByUser = new Map<string, Role>();
let restorePermissionStore: (() => void) | undefined;

function createMemoryPermissionStore(): PermissionStore {
  return {
    async getDeveloperRole(userId) {
      return roleByUser.get(userId) ?? null;
    },
  };
}

type BlacklistRow = {
  userId: string;
  username: string;
  addedBy: string;
  reason: string | null;
  addedAt: Date;
};

function stubBlacklistDatabase(rows: BlacklistRow[]) {
  const database = db as any;
  const originalSelect = database.select;
  const originalInsert = database.insert;
  const originalDelete = database.delete;
  const calls = {
    selects: 0,
    inserts: [] as Array<{ table: unknown; values: unknown }>,
    deletes: [] as unknown[],
  };

  database.select = () => {
    calls.selects++;
    return {
      from: () => ({
        where: async () => rows,
      }),
    };
  };
  database.insert = (table: unknown) => ({
    values: async (values: unknown) => {
      calls.inserts.push({ table, values });
    },
  });
  database.delete = (table: unknown) => ({
    where: async () => {
      calls.deletes.push(table);
    },
  });

  return {
    calls,
    restore() {
      database.select = originalSelect;
      database.insert = originalInsert;
      database.delete = originalDelete;
    },
  };
}

function createInteraction(actorId: string, subcommand: Subcommand, options: {
  reason?: string | null;
  dmError?: Error;
  banErrors?: Array<Error | undefined>;
} = {}): any {
  const replies: unknown[] = [];
  const deferredReplies: unknown[] = [];
  const editedReplies: unknown[] = [];
  const dmPayloads: unknown[] = [];
  const banCalls: Array<{ userId: string; options: unknown }> = [];
  const targetUser = {
    id: "target-id",
    tag: "target-tag",
    displayAvatarURL: () => "https://example.test/avatar.png",
    send: async (payload: unknown) => {
      dmPayloads.push(payload);
      if (options.dmError) throw options.dmError;
    },
  };
  const guilds = (options.banErrors ?? [undefined, new Error("missing permission")])
    .map((error, index) => ({
      bans: {
        create: async (userId: string, banOptions: unknown) => {
          banCalls.push({ userId, options: banOptions });
          if (error) throw error;
        },
      },
      id: `guild-${index}`,
    }));

  return {
    user: { id: actorId, tag: `${actorId}-tag` },
    options: {
      getSubcommand: () => subcommand,
      getUser: () => targetUser,
      getString: () => options.reason ?? null,
    },
    client: {
      guilds: {
        cache: new Map(guilds.map((guild) => [guild.id, guild])),
      },
    },
    reply: async (payload: unknown) => {
      replies.push(payload);
    },
    deferReply: async (payload: unknown) => {
      deferredReplies.push(payload);
    },
    editReply: async (payload: unknown) => {
      editedReplies.push(payload);
    },
    replies,
    deferredReplies,
    editedReplies,
    dmPayloads,
    banCalls,
  };
}

const existingEntry: BlacklistRow = {
  userId: "target-id",
  username: "target-tag",
  addedBy: "owner-id",
  reason: "previous reason",
  addedAt: new Date("2026-09-04T12:00:00.000Z"),
};

before(() => {
  restorePermissionStore = setPermissionStoreForTests(createMemoryPermissionStore());
});

after(() => {
  restorePermissionStore?.();
});

beforeEach(() => {
  roleByUser.clear();
});

afterEach(() => {
  restorePermissionStore?.();
  restorePermissionStore = setPermissionStoreForTests(createMemoryPermissionStore());
});

describe("global blacklist command authorization", () => {
  for (const subcommand of ["add", "remove", "check"] as const) {
    it(`covers owner, developer, and non-staff outcomes for ${subcommand}`, async () => {
      const actors: Array<{ id: string; role?: Role; authorized: boolean }> = [
        { id: "owner-id", authorized: true },
        { id: "developer-id", role: "developer", authorized: true },
        { id: "unknown-id", authorized: false },
      ];

      for (const actor of actors) {
        if (actor.role) roleByUser.set(actor.id, actor.role);

        const database = stubBlacklistDatabase([existingEntry]);
        const interaction = createInteraction(actor.id, subcommand);

        try {
          await globalBlacklistCommand.execute(interaction);

          if (!actor.authorized) {
            assert.deepEqual(interaction.replies, [
              {
                content:
                  "❌ You do not have permission to use this command. Only owners and staff members can use the global blacklist.",
                ephemeral: true,
              },
            ]);
            assert.equal(database.calls.selects, 0);
            assert.equal(database.calls.inserts.length, 0);
            assert.equal(database.calls.deletes.length, 0);
            assert.equal(interaction.dmPayloads.length, 0);
            assert.equal(interaction.banCalls.length, 0);
            continue;
          }

          assert.equal(interaction.replies.length, 1);
          assert.equal(
            Boolean(
              interaction.replies[0] &&
                (interaction.replies[0] as { content?: string }).content?.includes(
                  "do not have permission",
                ),
            ),
            false,
          );
        } finally {
          database.restore();
        }
      }
    });
  }
});

describe("global blacklist command records and side effects", () => {
  it("rejects a duplicate add without writing, DMing, or banning", async () => {
    const database = stubBlacklistDatabase([existingEntry]);
    const interaction = createInteraction("owner-id", "add", {
      reason: "duplicate reason",
    });

    try {
      await globalBlacklistCommand.execute(interaction);

      assert.deepEqual(interaction.replies, [
        {
          content: "❌ **target-tag** is already globally blacklisted.",
          ephemeral: true,
        },
      ]);
      assert.equal(interaction.deferredReplies.length, 0);
      assert.equal(database.calls.inserts.length, 0);
      assert.equal(interaction.dmPayloads.length, 0);
      assert.equal(interaction.banCalls.length, 0);
    } finally {
      database.restore();
    }
  });

  it("reports a missing record when removing", async () => {
    const database = stubBlacklistDatabase([]);
    const interaction = createInteraction("developer-id", "remove");
    roleByUser.set("developer-id", "developer");

    try {
      await globalBlacklistCommand.execute(interaction);

      assert.deepEqual(interaction.replies, [
        {
          content: "❌ **target-tag** is not in the global blacklist.",
          ephemeral: true,
        },
      ]);
      assert.equal(database.calls.deletes.length, 0);
    } finally {
      database.restore();
    }
  });

  it("reports a missing record when checking", async () => {
    const database = stubBlacklistDatabase([]);
    const interaction = createInteraction("owner-id", "check");

    try {
      await globalBlacklistCommand.execute(interaction);

      assert.deepEqual(interaction.replies, [
        {
          content: "✅ **target-tag** is **not** globally blacklisted.",
          ephemeral: true,
        },
      ]);
    } finally {
      database.restore();
    }
  });

  it("writes, DMs, and bans during an authorized add", async () => {
    const database = stubBlacklistDatabase([]);
    const interaction = createInteraction("developer-id", "add", {
      reason: "Repeated abuse",
    });
    roleByUser.set("developer-id", "developer");

    try {
      await globalBlacklistCommand.execute(interaction);

      assert.deepEqual(database.calls.inserts, [
        {
          table: blacklistTable,
          values: {
            userId: "target-id",
            username: "target-tag",
            addedBy: "developer-id",
            reason: "Repeated abuse",
          },
        },
      ]);
      assert.deepEqual(interaction.deferredReplies, [{ ephemeral: true }]);
      assert.equal(interaction.dmPayloads.length, 1);
      assert.equal(
        (interaction.dmPayloads[0] as any).embeds[0].data.title,
        "⛔ You have been globally blacklisted",
      );
      assert.equal(
        (interaction.dmPayloads[0] as any).embeds[0].data.fields[0].value,
        "Repeated abuse",
      );
      assert.deepEqual(interaction.banCalls, [
        {
          userId: "target-id",
          options: { reason: "Global Blacklist: Repeated abuse" },
        },
        {
          userId: "target-id",
          options: { reason: "Global Blacklist: Repeated abuse" },
        },
      ]);
      assert.deepEqual(interaction.editedReplies, [
        "✅ **target-tag** has been globally blacklisted and banned from **1** server(s).\n**Reason:** Repeated abuse",
      ]);
    } finally {
      database.restore();
    }
  });

  it("removes an existing record for an authorized owner", async () => {
    const database = stubBlacklistDatabase([existingEntry]);
    const interaction = createInteraction("owner-id", "remove");

    try {
      await globalBlacklistCommand.execute(interaction);

      assert.deepEqual(database.calls.deletes, [blacklistTable]);
      assert.deepEqual(interaction.replies, [
        {
          content: "✅ **target-tag** has been removed from the global blacklist.",
          ephemeral: true,
        },
      ]);
    } finally {
      database.restore();
    }
  });

  it("returns the existing record details for an authorized check", async () => {
    const database = stubBlacklistDatabase([existingEntry]);
    const interaction = createInteraction("developer-id", "check");
    roleByUser.set("developer-id", "developer");

    try {
      await globalBlacklistCommand.execute(interaction);

      assert.equal(interaction.replies.length, 1);
      const embed = (interaction.replies[0] as any).embeds[0].data;
      assert.equal(embed.title, "⛔ Globally Blacklisted");
      assert.equal(embed.description, "**target-tag** is on the global blacklist.");
      assert.deepEqual(embed.fields.slice(0, 2), [
        { name: "Reason", value: "previous reason" },
        { name: "User ID", value: "target-id" },
      ]);
    } finally {
      database.restore();
    }
  });
});