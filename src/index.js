const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
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

const client = new Client({
  intents: clientIntents,
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.Reaction]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command?.data?.name) {
    client.commands.set(command.data.name, command);
  }
}

const storagePath = path.join(__dirname, '..', 'data', 'storage.json');
fs.mkdirSync(path.dirname(storagePath), { recursive: true });
client.storage = new Storage(storagePath);

if (!config.token || config.token.includes('YOUR_BOT_TOKEN')) {
  console.error('Bot token is not configured. Copy src/config.example.json to src/config.json and fill in your token.');
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

const sendShutdownMessage = async () => {
  const shutdownMessage = '❌ Unexpected Error: The bot is shutting down. Please check console for details.';
  for (const guild of client.guilds.cache.values()) {
    try {
      const botMember = guild.members.me;
      if (!botMember) continue;

      const targetChannel = guild.channels.cache
        .filter((channel) => channel.isTextBased())
        .find((channel) => {
          const perms = channel.permissionsFor(botMember);
          return perms?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]);
        });

      if (targetChannel) {
        await targetChannel.send(shutdownMessage);
      }
    } catch (error) {
      console.warn(`Failed to send shutdown message in guild ${guild.id}:`, error.message);
    }
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully.`);
  await sendShutdownMessage().catch((error) => {
    console.warn('Failed to send shutdown messages:', error);
  });
  await client.destroy();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

client.login(config.token).catch((error) => {
  console.error('Failed to login:', error);
  process.exit(1);
});
