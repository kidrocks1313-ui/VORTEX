# TikTok Bot (Global Blacklist Bot)

A Discord bot with global blacklisting and staff management across all servers it's in.

## Run & Operate

- **Discord Bot workflow** — starts the bot (`pnpm --filter @workspace/discord-bot run dev`)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env vars: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_OWNER_ID`, `DATABASE_URL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Discord: discord.js v14
- DB: PostgreSQL + Drizzle ORM
- Bot entry: `artifacts/discord-bot/src/index.ts`

## Where things live

- `artifacts/discord-bot/src/commands/` — all slash command handlers
- `artifacts/discord-bot/src/lib/permissions.ts` — owner/developer permission checks
- `lib/db/src/schema/blacklist.ts` — blacklist DB table
- `lib/db/src/schema/developers.ts` — staff/developers DB table

## Commands

| Command | Who can use | Description |
|---|---|---|
| `/globalblacklist add <user> [reason]` | Owner + all staff | Blacklists user, DMs them, bans from all servers |
| `/globalblacklist remove <user>` | Owner + all staff | Removes from blacklist |
| `/globalblacklist check <user>` | Anyone | Checks if a user is blacklisted |
| `/adddeveloper <user>` | Owner only | Adds a Developer |
| `/addseniordeveloper <user>` | Owner only | Adds/promotes to Senior Developer |
| `/addheaddeveloper <user>` | Owner only | Adds/promotes to Head Developer |
| `/retiredeveloper <user>` | Owner only | Removes a staff member |
| `/developers` | Anyone | Lists all staff, highest to lowest rank |

## Staff Hierarchy (highest → lowest)

1. 👑 Owner (you)
2. 🔷 Head Developer
3. 🔹 Senior Developer
4. ⚙️ Developer

## User preferences

- Owner Discord ID: 1392224478175690752
