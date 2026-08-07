const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const storage = member.client.storage;
    const storedChannelId = storage?.getSetting(member.guild.id, 'departureChannelId');
    const channelId = storedChannelId || config.moderation.departureChannelId || config.moderation.welcomeChannelId;
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle('Member Left')
      .setDescription(`Goodbye, ${member.user.tag}. We hope to see you again.`)
      .setColor('#FF0000')
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  }
};
