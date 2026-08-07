const { updatePresence } = require('../utils/presence');

module.exports = {
  name: 'guildDelete',
  async execute(guild, client) {
    try {
      await updatePresence(client);
    } catch (error) {
      console.warn('Failed to update presence after guild removal:', error.message);
    }
  }
};
