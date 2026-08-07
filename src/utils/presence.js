const { ActivityType } = require('discord.js');

const updatePresence = async (client) => {
  if (!client.user) return;

  const activityText = `Watching ${client.guilds.cache.size} servers | /help`;
  return client.user.setActivity(activityText, {
    type: ActivityType.Watching
  });
};

module.exports = {
  updatePresence
};
