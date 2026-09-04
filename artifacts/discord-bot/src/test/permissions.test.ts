import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import { db } from "@workspace/db";
import { addDeveloperCommand } from "../commands/adddeveloper.js";
import { securitySetupCommand } from "../commands/securitysetup.js";
import {
  getDeveloperRole,
  isDeveloperOrOwner,
  isHeadOrOwner,
  isOwner,
  isSeniorOrAbove,
  isServerAdminOrAbove,
  resetPermissionStoreForTests,
  setPermissionStoreForTests,
  type PermissionStore,
} from "../lib/permissions.js";

const roleByUser = new Map<string, "developer" | "senior_developer" | "head_developer" | "security">();
let restorePermissionStore: (() => void) | undefined;

function createMemoryPermissionStore(): PermissionStore {
  return {
    async getDeveloperRole(userId) {
      return roleByUser.get(userId) ?? null;
    },
  };
}

function createInteraction(
  userId: string,
  overrides: Record<string, unknown> = {},
): any {
  const replies: unknown[] = [];
  return {
    user: { id: userId, tag: `${userId}-tag` },
    guildId: "guild-id",
    guild: {
      name: "Test Guild",
      members: {
        cache: new Map(),
        fetch: async () => null,
      },
    },
    options: {
      getUser: () => ({ id: "target-id", tag: "target-tag" }),
      getSubcommand: () => "antiraid",
      getBoolean: () => false,
      getChannel: () => ({ id: "log-channel-id" }),
    },
    reply: async (payload: unknown) => {
      replies.push(payload);
    },
    deferReply: async () => undefined,
    editReply: async (payload: unknown) => {
      replies.push(payload);
    },
    replies,
    ...overrides,
  };
}

function stubDatabase(rows: unknown[] = []): () => void {
  const database = db as any;
  const originalSelect = database.select;
  const originalInsert = database.insert;
  const originalUpdate = database.update;

  database.select = () => ({
    from: () => ({
      where: async () => rows,
    }),
  });
  database.insert = () => ({
    values: async () => undefined,
  });
  database.update = () => ({
    set: () => ({
      where: async () => undefined,
    }),
  });

  return () => {
    database.select = originalSelect;
    database.insert = originalInsert;
    database.update = originalUpdate;
  };
}

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

describe("database-backed permission helpers", () => {
  it("uses the production database query boundary for developer roles", async () => {
    const restoreDatabase = stubDatabase([{ role: "developer" }]);
    resetPermissionStoreForTests();

    try {
      assert.equal(await getDeveloperRole("developer-id"), "developer");
    } finally {
      restoreDatabase();
    }
  });

  it("recognizes owners without a developer row", async () => {
    assert.equal(isOwner("owner-id"), true);
    assert.equal(await isDeveloperOrOwner("owner-id"), true);
    assert.equal(await isSeniorOrAbove("owner-id"), true);
    assert.equal(await isHeadOrOwner("owner-id"), true);
  });

  it("applies the expected rank boundaries to database roles", async () => {
    roleByUser.set("developer-id", "developer");
    assert.equal(await isDeveloperOrOwner("developer-id"), true);
    assert.equal(await isSeniorOrAbove("developer-id"), false);
    assert.equal(await isHeadOrOwner("developer-id"), false);

    roleByUser.set("senior-id", "senior_developer");
    assert.equal(await isSeniorOrAbove("senior-id"), true);
    assert.equal(await isHeadOrOwner("senior-id"), false);

    roleByUser.set("head-id", "head_developer");
    assert.equal(await isHeadOrOwner("head-id"), true);

    roleByUser.set("security-id", "security");
    assert.equal(await isDeveloperOrOwner("security-id"), true);
    assert.equal(await isSeniorOrAbove("security-id"), false);
  });

  it("rejects users with no owner or staff record", async () => {
    assert.equal(await isDeveloperOrOwner("unknown-id"), false);
    assert.equal(await isSeniorOrAbove("unknown-id"), false);
    assert.equal(await isHeadOrOwner("unknown-id"), false);
  });

  it("allows a database staff member to use server-admin checks", async () => {
    roleByUser.set("developer-id", "developer");
    const interaction = createInteraction("developer-id");

    assert.equal(await isServerAdminOrAbove("developer-id", interaction), true);
  });

  it("does not treat a non-staff member without Administrator as an admin", async () => {
    const interaction = createInteraction("unknown-id");

    assert.equal(await isServerAdminOrAbove("unknown-id", interaction), false);
  });
});

describe("representative staff and security commands", () => {
  it("blocks a Developer from adding another Developer", async () => {
    roleByUser.set("developer-id", "developer");
    const interaction = createInteraction("developer-id");

    await addDeveloperCommand.execute(interaction);

    assert.deepEqual(interaction.replies, [
      {
        content: "❌ Only Senior Developers, Head Developers, and Owners can add Developers.",
        ephemeral: true,
      },
    ]);
  });

  it("allows an Owner to add a Developer through the command handler", async () => {
    const restoreDatabase = stubDatabase([]);
    const interaction = createInteraction("owner-id");

    try {
      await addDeveloperCommand.execute(interaction);

      assert.deepEqual(interaction.replies, [
        { content: "✅ **target-tag** has been added as a **Developer**." },
      ]);
    } finally {
      restoreDatabase();
    }
  });

  it("allows a database Developer to update security settings", async () => {
    roleByUser.set("developer-id", "developer");
    const restoreDatabase = stubDatabase([]);
    const interaction = createInteraction("developer-id");

    try {
      await securitySetupCommand.execute(interaction);

      assert.equal(interaction.replies.length, 1);
      assert.match(
        (interaction.replies[0] as any).embeds[0].data.description,
        /Anti-Raid is now \*\*disabled\*\*/,
      );
    } finally {
      restoreDatabase();
    }
  });

  it("blocks a non-staff member from updating security settings", async () => {
    const interaction = createInteraction("unknown-id");

    await securitySetupCommand.execute(interaction);

    assert.deepEqual(interaction.replies, [
      {
        content: "❌ You need Administrator permission to configure security.",
        ephemeral: true,
      },
    ]);
  });
});