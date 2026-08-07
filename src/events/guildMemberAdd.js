const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.moderation.welcomeChannelId);
    if (!channel) return;

    channel.send({
      content: `Welcome to the server, ${member}! Please read the rules and enjoy your stay.`
    });
  }
};
