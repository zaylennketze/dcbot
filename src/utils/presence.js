const { ActivityType } = require('discord.js');

const updatePresence = async (client) => {
  if (!client.user) return;

  const globalBio = client.storage?.getSetting('global', 'botActivityText');
  const defaultText = `Your Server ^^ | ${client.guilds.cache.size} servers`;
  const activityText = globalBio || defaultText;
  return client.user.setActivity(activityText, {
    type: ActivityType.Watching
  });
};

module.exports = {
  updatePresence
};
