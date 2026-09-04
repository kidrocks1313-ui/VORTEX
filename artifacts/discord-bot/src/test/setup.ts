// Keep permission tests independent from the developer's environment and database.
process.env.DATABASE_URL ??= "postgresql://permission-tests.invalid/test";
process.env.DISCORD_OWNER_IDS = "owner-id";
delete process.env.DISCORD_OWNER_ID;