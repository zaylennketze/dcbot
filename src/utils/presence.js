const { ActivityType } = require('discord.js');

const updatePresence = async (client) => {
  if (!client.user) return;

  const activityText = `SERVER | ${client.guilds.cache.size} servers`;
  return client.user.setActivity(activityText, {
    type: ActivityType.Watching
  });
};

module.exports = {
  updatePresence
};
