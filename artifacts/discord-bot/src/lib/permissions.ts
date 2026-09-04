import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { db, developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const OWNER_IDS = (process.env.DISCORD_OWNER_IDS ?? process.env.DISCORD_OWNER_ID ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export function isOwner(userId: string): boolean {
  return OWNER_IDS.includes(userId);
}

export async function getDeveloperRole(userId: string): Promise<string | null> {
  const result = await db
    .select()
    .from(developersTable)
    .where(eq(developersTable.userId, userId));
  return result.length > 0 ? result[0]!.role : null;
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
