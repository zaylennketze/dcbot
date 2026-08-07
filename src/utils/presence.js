const { ActivityType } = require('discord.js');

const updatePresence = async (client) => {
  if (!client.user) return;

  const defaultText = `Your Server 👀 | ${client.guilds.cache.size} servers`;
  const activities = [
    {
      name: defaultText,
      type: ActivityType.Watching
    }
  ];

  const globalBio = client.storage?.getSetting('global', 'botActivityText');
  if (globalBio) {
    activities.unshift({
      name: globalBio,
      type: ActivityType.Custom
    });
  }

  return client.user.setPresence({
    activities,
    status: 'dnd'
  });
};

module.exports = {
  updatePresence
};
