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
  }
};
