const { PermissionsBitField } = require('discord.js');
const { updatePresence } = require('../utils/presence');

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

    const startupMessage = '✅ I am online and running! Use /help for help!';
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
          await targetChannel.send(startupMessage);
        }
      } catch (error) {
        console.warn(`Failed to send startup message in guild ${guild.id}:`, error.message);
      }
    }
  }
};