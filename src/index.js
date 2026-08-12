const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client, Collection, GatewayIntentBits, Partials, PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DisTube } = require('distube');
const config = require('./config');
const Storage = require('./storage');

const clientIntents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildVoiceStates
];
if (config.useMessageContentIntent) clientIntents.push(GatewayIntentBits.MessageContent);
if (config.useGuildMembersIntent) clientIntents.push(GatewayIntentBits.GuildMembers);

const pidFile = path.join(__dirname, '..', '.bot.pid');
const writePidFile = () => fs.writeFileSync(pidFile, process.pid.toString(), 'utf8');
const removePidFile = () => {
  try {
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
  } catch {
    // ignore cleanup errors
  }
};

const client = new Client({
  intents: clientIntents,
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.Reaction]
});

const args = process.argv.slice(2);
const isTerminalSay = args[0] === '--say';
const terminalSayMessage = isTerminalSay ? args.slice(1).join(' ').trim() : '';
const sendAndExitMode = isTerminalSay && terminalSayMessage.length > 0;
if (isTerminalSay && !terminalSayMessage) {
  console.error('Usage: node src/index.js --say "Your message here"');
  process.exit(1);
}
client.skipStartupEmbed = sendAndExitMode;

const getAnnouncementChannels = (guild) => {
  const announcementKeywords = ['news', 'announce', 'announcement', 'announcements', 'updates', 'broadcast', 'bulletin', 'bulletins'];
  return guild.channels.cache.filter((channel) => {
    if (!channel.isTextBased()) return false;
    const perms = guild.members.me?.permissionsIn(channel);
    if (!perms?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) return false;
    const name = channel.name?.toLowerCase() || '';
    return announcementKeywords.some((keyword) => name.includes(keyword));
  });
};

const sendTerminalBroadcast = async (message) => {
  const broadcastMessage = `**BROADCAST (SERVERWIDE)**: ${message}`;
  for (const guild of client.guilds.cache.values()) {
    const announcementChannels = getAnnouncementChannels(guild);
    if (!announcementChannels.size) {
      console.warn(`No announcement-style channel found in guild ${guild.id}`);
      continue;
    }

    for (const channel of announcementChannels.values()) {
      try {
        await channel.send({ content: broadcastMessage });
      } catch (error) {
        console.warn(`Failed to send terminal message in guild ${guild.id} channel ${channel.id}:`, error.message);
      }
    }
  }
};

const setupTerminalInput = () => {
  if (!process.stdin.isTTY) return;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'terminal> '
  });

  rl.prompt();
  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      rl.prompt();
      return;
    }
    await sendTerminalBroadcast(trimmed);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Terminal input closed.');
  });
};

process.on('exit', removePidFile);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

const inferOptionTypesFromFunction = (fn) => {
  const text = fn?.toString() || '';
  const optionTypes = new Map();
  const patterns = [
    { type: 'string', regex: /\.options\.getString\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'integer', regex: /\.options\.getInteger\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'number', regex: /\.options\.getNumber\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'boolean', regex: /\.options\.getBoolean\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'user', regex: /\.options\.getUser\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'member', regex: /\.options\.getMember\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'role', regex: /\.options\.getRole\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'channel', regex: /\.options\.getChannel\(\s*['"`](.+?)['"`]\s*\)/g }
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(text))) {
      if (!optionTypes.has(match[1])) optionTypes.set(match[1], pattern.type);
    }
  }

  return optionTypes;
};

const addOptionToBuilder = (builder, name, type) => {
  const description = `Option: ${name}`;
  switch (type) {
    case 'integer':
      return builder.addIntegerOption((option) => option.setName(name).setDescription(description));
    case 'number':
      return builder.addNumberOption((option) => option.setName(name).setDescription(description));
    case 'boolean':
      return builder.addBooleanOption((option) => option.setName(name).setDescription(description));
    case 'user':
    case 'member':
      return builder.addUserOption((option) => option.setName(name).setDescription(description));
    case 'role':
      return builder.addRoleOption((option) => option.setName(name).setDescription(description));
    case 'channel':
      return builder.addChannelOption((option) => option.setName(name).setDescription(description));
    default:
      return builder.addStringOption((option) => option.setName(name).setDescription(description));
  }
};

const buildCommandData = (command) => {
  if (command?.data?.toJSON) return command.data;
  if (!command?.name) return null;

  const builder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description || 'No description available.');

  if (Array.isArray(command.subcommands)) {
    for (const subcommand of command.subcommands) {
      builder.addSubcommand((sub) => {
        sub.setName(subcommand.name).setDescription(subcommand.description || 'No description.');
        const optionTypes = inferOptionTypesFromFunction(subcommand.execute);
        for (const [optionName, optionType] of optionTypes) {
          addOptionToBuilder(sub, optionName, optionType);
        }
        return sub;
      });
    }
  } else if (typeof command.execute === 'function') {
    const optionTypes = inferOptionTypesFromFunction(command.execute);
    for (const [optionName, optionType] of optionTypes) {
      addOptionToBuilder(builder, optionName, optionType);
    }
  }

  return builder;
};

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  const commandData = buildCommandData(command);
  if (commandData?.name) {
    command.data = commandData;
    client.commands.set(commandData.name, command);
  }
}

const storagePath = path.join(__dirname, '..', 'data', 'storage.json');
fs.mkdirSync(path.dirname(storagePath), { recursive: true });
client.storage = new Storage(storagePath);

if (!config.token || config.token.includes('YOUR_BOT_TOKEN')) {
  console.error('Bot token is not configured. Set BOT_TOKEN in .env first.');
  process.exit(1);
}

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  savePreviousSongs: true,
  nsfw: false,
  emitAddSongWhenCreatingQueue: true,
  emitAddListWhenCreatingQueue: true,
  joinNewVoiceChannel: true
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.distube
  .on('playSong', (queue, song) => {
    queue.textChannel.send(`▶️ Now playing: **${song.name}** (${song.formattedDuration})`);
  })
  .on('addSong', (queue, song) => {
    queue.textChannel.send(`✅ Added to queue: **${song.name}** (${song.formattedDuration})`);
  })
  .on('error', (channel, error) => {
    if (channel) channel.send(`⚠️ Music error: ${error.message}`);
    console.error(error);
  });

const getLogChannel = (guild) => {
  const channelId = client.storage.getSetting(guild.id, 'botLogChannelId');
  if (!channelId) return null;
  return guild.channels.cache.get(channelId) || null;
};

const sendLogEmbed = async (guild, embed) => {
  const logChannel = getLogChannel(guild);
  if (!logChannel || !logChannel.isTextBased()) return;

  const botMember = guild.members.me;
  if (!botMember) return;

  const perms = logChannel.permissionsFor(botMember);
  if (!perms?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) return;

  await logChannel.send({ embeds: [embed] });
};

const sendShutdownEmbed = async () => {
  const shutdownEmbed = new EmbedBuilder()
    .setTitle('Bot Shut Down')
    .setDescription('The bot has shut down.')
    .setColor('#FF0000')
    .setFooter({ text: 'Bot stopped gracefully.' });

  for (const guild of client.guilds.cache.values()) {
    try {
      await sendLogEmbed(guild, shutdownEmbed);
    } catch (error) {
      console.warn(`Failed to send shutdown message in guild ${guild.id}:`, error.message);
    }
  }
};

const sendErrorShutdownEmbed = async (reason) => {
  const errorEmbed = new EmbedBuilder()
    .setTitle('Bot Error Shutdown')
    .setDescription('❌ Unexpected Error: The bot is shutting down. Please check console for details.')
    .setColor('#FF0000');

  const errorText = reason instanceof Error ? reason.stack || reason.message : String(reason);
  if (errorText) {
    errorEmbed.addFields({ name: 'Error', value: `${errorText}`.slice(0, 1024) });
  }

  for (const guild of client.guilds.cache.values()) {
    try {
      await sendLogEmbed(guild, errorEmbed);
    } catch (error) {
      console.warn(`Failed to send error shutdown message in guild ${guild.id}:`, error.message);
    }
  }
};

process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  await sendErrorShutdownEmbed(reason).catch((error) => {
    console.warn('Failed to send error shutdown embed:', error);
  });
  await client.destroy();
  removePidFile();
  process.exit(1);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await sendErrorShutdownEmbed(error).catch((sendError) => {
    console.warn('Failed to send error shutdown embed:', sendError);
  });
  await client.destroy();
  removePidFile();
  process.exit(1);
});

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully.`);
  await sendShutdownEmbed().catch((error) => {
    console.warn('Failed to send shutdown messages:', error);
  });
  await client.destroy();
  removePidFile();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

client.login(config.token)
  .then(() => {
    if (!sendAndExitMode) {
      writePidFile();
      client.once('ready', setupTerminalInput);
    }
    if (sendAndExitMode) {
      client.once('ready', async () => {
        await sendTerminalBroadcast(terminalSayMessage).catch((error) => {
          console.error('Failed to send terminal broadcast:', error);
        });
        await client.destroy();
        process.exit(0);
      });
    }
  })
  .catch((error) => {
    console.error('Failed to login:', error);
    removePidFile();
    process.exit(1);
  });
