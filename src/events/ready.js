const { PermissionsBitField } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    try {
      const commands = [...client.commands.keys()].join(', ');
      const activityText = commands.length > 90
        ? `Use ${config.prefix}help for commands`
        : `Commands: ${commands}`;

      await client.user.setActivity(activityText, {
        type: 'Listening'
      });
    } catch (error) {
      console.warn('Failed to set activity:', error);
    }

    const startupMessage = '✅ I am online and running!';
    for (const guild of client.guilds.cache.values()) {
      try {
        const targetChannel = guild.channels.cache
          .filter((channel) => channel.isTextBased())
          .find((channel) => {
            const botMember = guild.members.me;
            if (!botMember) return false;
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
