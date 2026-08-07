const config = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.moderation.welcomeChannelId);
    if (!channel) return;

    channel.send({
      content: `Goodbye, ${member.user.tag}. We hope to see you again.`
    });
  }
};
