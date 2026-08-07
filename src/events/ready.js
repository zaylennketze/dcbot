const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { updatePresence } = require('../utils/presence');

const getLogChannel = (guild, client) => {
  const channelId = client.storage.getSetting(guild.id, 'botLogChannelId');
  if (!channelId) return null;
  return guild.channels.cache.get(channelId) || null;
};

const sendStartupEmbed = async (guild, client) => {
  const logChannel = getLogChannel(guild, client);
  if (!logChannel || !logChannel.isTextBased()) return;

  const botMember = guild.members.me;
  if (!botMember) return;

  const perms = logChannel.permissionsFor(botMember);
  if (!perms?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) return;

  const embed = new EmbedBuilder()
    .setTitle('Bot Started')
    .setDescription('The bot has started and is now online.')
    .setColor('#00B0F4')
    .setFooter({ text: `Watching ${client.guilds.cache.size} servers | /help` });

  await logChannel.send({ embeds: [embed] });
};

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    try {
      await updatePresence(client);
    } catch (error) {
      console.warn('Failed to set activity:', error);
    }

    for (const guild of client.guilds.cache.values()) {
      try {
        await sendStartupEmbed(guild, client);
      } catch (error) {
        console.warn(`Failed to send startup message in guild ${guild.id}:`, error.message);
      }
    }
  }
};