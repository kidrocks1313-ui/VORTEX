import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ChatInputCommandInteraction,
} from "discord.js";
import { deployCommands } from "./deploy-commands.js";
import { setupSecurity } from "./security/setup.js";
import { globalBlacklistCommand } from "./commands/globalblacklist.js";
import { addDeveloperCommand } from "./commands/adddeveloper.js";
import { addSeniorDeveloperCommand } from "./commands/addseniordeveloper.js";
import { addHeadDeveloperCommand } from "./commands/addheaddeveloper.js";
import { retireDeveloperCommand } from "./commands/retiredeveloper.js";
import { removeDeveloperCommand } from "./commands/removedeveloper.js";
import { removeSeniorDeveloperCommand } from "./commands/removeseniordeveloper.js";
import { removeHeadDeveloperCommand } from "./commands/removeheaddeveloper.js";
import { addSecurityCommand } from "./commands/addsecurity.js";
import { removeSecurityCommand } from "./commands/removesecurity.js";
import { manageServersCommand } from "./commands/manageservers.js";
import { inviteLinkCommand } from "./commands/invitelink.js";
import { leaveServerCommand } from "./commands/leaveserver.js";
import { banCommand } from "./commands/ban.js";
import { unbanCommand } from "./commands/unban.js";
import { kickCommand } from "./commands/kick.js";
import { muteCommand } from "./commands/mute.js";
import { unmuteCommand } from "./commands/unmute.js";
import { warnCommand } from "./commands/warn.js";
import { warningsCommand } from "./commands/warnings.js";
import { clearWarningsCommand } from "./commands/clearwarnings.js";
import { purgeCommand } from "./commands/purge.js";
import { slowmodeCommand } from "./commands/slowmode.js";
import { lockCommand } from "./commands/lock.js";
import { unlockCommand } from "./commands/unlock.js";
import { serverInfoCommand } from "./commands/serverinfo.js";
import { botInfoCommand } from "./commands/botinfo.js";
import { blackjackCommand } from "./commands/blackjack.js";
import { requestSecurityCommand } from "./commands/requestsecurity.js";
import { lockdownCommand } from "./commands/lockdown.js";
import { unlockdownCommand } from "./commands/unlockdown.js";
import { securitySetupCommand } from "./commands/securitysetup.js";
import { securityStatusCommand } from "./commands/securitystatus.js";
import { coinflipCommand } from "./commands/coinflip.js";
import { diceCommand } from "./commands/dice.js";
import { eightballCommand } from "./commands/eightball.js";
import { rpsCommand } from "./commands/rps.js";
import { jokeCommand } from "./commands/joke.js";
import { dadjokeCommand } from "./commands/dadjoke.js";
import { quoteCommand } from "./commands/quote.js";
import { factCommand } from "./commands/fact.js";
import { riddleCommand } from "./commands/riddle.js";
import { pollCommand } from "./commands/poll.js";
import { chooseCommand } from "./commands/choose.js";
import { emojifyCommand } from "./commands/emojify.js";
import { reverseCommand } from "./commands/reverse.js";
import { uwuCommand } from "./commands/uwu.js";
import { mockCommand } from "./commands/mock.js";
import { iqCommand } from "./commands/iq.js";
import { hugCommand } from "./commands/hug.js";
import { slapCommand } from "./commands/slap.js";
import { patCommand } from "./commands/pat.js";
import { shipCommand } from "./commands/ship.js";
import { rateCommand } from "./commands/rate.js";
import { wyrCommand } from "./commands/wyr.js";
import { todCommand } from "./commands/tod.js";
import { triviaCommand } from "./commands/trivia.js";
import { slotsCommand } from "./commands/slots.js";
import { guessCommand } from "./commands/guess.js";
import { complimentCommand } from "./commands/compliment.js";
import { roastCommand } from "./commands/roast.js";
import { avatarCommand } from "./commands/avatar.js";
import { tempbanCommand } from "./commands/tempban.js";
import { softbanCommand } from "./commands/softban.js";
import { massbanCommand } from "./commands/massban.js";
import { hideCommand } from "./commands/hide.js";
import { unhideCommand } from "./commands/unhide.js";
import { nickCommand } from "./commands/nick.js";
import { roleCommand } from "./commands/role.js";
import { roleinfoCommand } from "./commands/roleinfo.js";
import { addemojiCommand } from "./commands/addemoji.js";
import { delemojiCommand } from "./commands/delemoji.js";
import { vcmuteCommand } from "./commands/vcmute.js";
import { vcdeafenCommand } from "./commands/vcdeafen.js";
import { vckickCommand } from "./commands/vckick.js";
import { developersCommand } from "./commands/developers.js";

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error("DISCORD_TOKEN is required");

interface Command {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands = new Collection<string, Command>();
const commandList: Command[] = [
  globalBlacklistCommand,
  addDeveloperCommand,
  addSeniorDeveloperCommand,
  addHeadDeveloperCommand,
  retireDeveloperCommand,
  removeDeveloperCommand,
  removeSeniorDeveloperCommand,
  removeHeadDeveloperCommand,
  addSecurityCommand,
  removeSecurityCommand,
  manageServersCommand,
  inviteLinkCommand,
  leaveServerCommand,
  banCommand,
  unbanCommand,
  kickCommand,
  muteCommand,
  unmuteCommand,
  warnCommand,
  warningsCommand,
  clearWarningsCommand,
  purgeCommand,
  slowmodeCommand,
  lockCommand,
  unlockCommand,
  serverInfoCommand,
  botInfoCommand,
  blackjackCommand,
  requestSecurityCommand,
  lockdownCommand,
  unlockdownCommand,
  securitySetupCommand,
  securityStatusCommand,
  coinflipCommand,
  diceCommand,
  eightballCommand,
  rpsCommand,
  jokeCommand,
  dadjokeCommand,
  quoteCommand,
  factCommand,
  riddleCommand,
  pollCommand,
  chooseCommand,
  emojifyCommand,
  reverseCommand,
  uwuCommand,
  mockCommand,
  iqCommand,
  hugCommand,
  slapCommand,
  patCommand,
  shipCommand,
  rateCommand,
  wyrCommand,
  todCommand,
  triviaCommand,
  slotsCommand,
  guessCommand,
  complimentCommand,
  roastCommand,
  avatarCommand,
  tempbanCommand,
  softbanCommand,
  massbanCommand,
  hideCommand,
  unhideCommand,
  nickCommand,
  roleCommand,
  roleinfoCommand,
  addemojiCommand,
  delemojiCommand,
  vcmuteCommand,
  vcdeafenCommand,
  vckickCommand,
  developersCommand,
];

for (const command of commandList) {
  commands.set(command.data.name, command);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
});
client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  console.log(`📡 Serving ${c.guilds.cache.size} guild(s)`);

  // Register slash commands on startup
  await deployCommands();

  // Start security systems
  setupSecurity(client);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content.trim().toLowerCase() !== "!me") return;

  await message.reply("FINE YOUR A FUCKING BITCH MAID");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing /${interaction.commandName}:`, error);
    const reply = {
      content: "❌ There was an error executing this command.",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(console.error);
    } else {
      await interaction.reply(reply).catch(console.error);
    }
  }
});

client.login(token);
