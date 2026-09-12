import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { db, developersTable } from "@workspace/db";
import type { DeveloperRole } from "@workspace/db";
import { eq } from "drizzle-orm";

const DEFAULT_OWNER_IDS = [
  "1392224478175690752",
  "1515077206886453469",
  "1434663490160955407",
  "1439284476688466113",
  "549433335101915137",
  "367457980679192578",
];
const configuredOwnerIds = (process.env.DISCORD_OWNER_IDS ?? process.env.DISCORD_OWNER_ID ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const OWNER_IDS = configuredOwnerIds.length > 0 ? configuredOwnerIds : DEFAULT_OWNER_IDS;

export function isOwner(userId: string): boolean {
  return OWNER_IDS.includes(userId);
}

export interface PermissionStore {
  getDeveloperRole(userId: string): Promise<DeveloperRole | null>;
}

const databasePermissionStore: PermissionStore = {
  async getDeveloperRole(userId: string): Promise<DeveloperRole | null> {
    const result = await db
      .select()
      .from(developersTable)
      .where(eq(developersTable.userId, userId));
    return result.length > 0 ? result[0]!.role : null;
  },
};

let permissionStore: PermissionStore = databasePermissionStore;

export async function getDeveloperRole(userId: string): Promise<string | null> {
  return permissionStore.getDeveloperRole(userId);
}

/**
 * Replaces the database-backed permission lookup for isolated tests.
 * Returns a cleanup function so tests cannot leak permission state.
 */
export function setPermissionStoreForTests(store: PermissionStore): () => void {
  const previousStore = permissionStore;
  permissionStore = store;
  return () => {
    permissionStore = previousStore;
  };
}

export function resetPermissionStoreForTests(): void {
  permissionStore = databasePermissionStore;
}

/** Any developer rank or owner */
export async function isDeveloperOrOwner(userId: string): Promise<boolean> {
  if (isOwner(userId)) return true;
  const role = await getDeveloperRole(userId);
  return role !== null;
}

/** Senior developer, head developer, or owner */
export async function isSeniorOrAbove(userId: string): Promise<boolean> {
  if (isOwner(userId)) return true;
  const role = await getDeveloperRole(userId);
  return role === "senior_developer" || role === "head_developer";
}

/** Head developer or owner only */
export async function isHeadOrOwner(userId: string): Promise<boolean> {
  if (isOwner(userId)) return true;
  const role = await getDeveloperRole(userId);
  return role === "head_developer";
}

/**
 * Server admin check — passes if the user is:
 * - A bot owner, OR
 * - Any developer rank in the DB, OR
 * - Has Administrator permission in the current guild
 */
export async function isServerAdminOrAbove(userId: string, interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (isOwner(userId)) return true;
  const role = await getDeveloperRole(userId);
  if (role !== null) return true;
  const member = interaction.guild?.members.cache.get(userId)
    ?? await interaction.guild?.members.fetch(userId).catch(() => null);
  return member?.permissions.has(PermissionFlagsBits.Administrator) ?? false;
}

export { OWNER_IDS };
