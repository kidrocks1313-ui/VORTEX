import { Client } from "discord.js";
import { setupAntiRaid } from "./antiRaid.js";
import { setupAntiSpam } from "./antiSpam.js";
import { setupAntiNuke } from "./antiNuke.js";

export function setupSecurity(client: Client) {
  setupAntiRaid(client);
  setupAntiSpam(client);
  setupAntiNuke(client);
  console.log("🛡️ Security systems active (Anti-Raid, Anti-Spam, Anti-Nuke)");
}
