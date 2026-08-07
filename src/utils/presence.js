const { ActivityType } = require('discord.js');

const updatePresence = async (client) => {
  if (!client.user) return;

  const defaultText = `Your Server 👀 | ${client.guilds.cache.size} servers`;
  const activities = [];

  const globalBio = client.storage?.getSetting('global', 'botActivityText');
  if (globalBio) {
    activities.push({
      name: globalBio,
      type: ActivityType.Playing
    });
  }

  activities.push({
    type: ActivityType.Custom,
    name: 'Custom Status',
    state: defaultText
  });

  return client.user.setPresence({
    activities,
    status: 'do_not_disturb'
  });
};

module.exports = {
  updatePresence
};