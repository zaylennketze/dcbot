const config = require('../config.json');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    try {
      await client.user.setActivity(`${config.prefix}help | ${client.guilds.cache.size} servers`, {
        type: 'Listening'
      });
    } catch (error) {
      console.warn('Failed to set activity:', error);
    }
  }
};
