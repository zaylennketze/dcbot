const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const SOURCE_GUILD_ID = '1536892362192724008';
const SOURCE_CHANNEL_ID = '1536892364105449565';

const getAnnouncementChannels = (guild) => {
  return guild.channels.cache.filter((channel) => {
    if (!channel.isTextBased()) return false;
    const perms = guild.members.me?.permissionsIn(channel);
    if (!perms?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) return false;
    return true;
  });
};

const createAnnouncementEmbed = (message) => {
  const embed = new EmbedBuilder()
    .setTitle(`Announcement from ${message.guild.name}`)
    .setDescription(message.content || 'No text content.')
    .setColor('Blue')
    .setTimestamp(message.createdTimestamp)
    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: `Source: #${message.channel.name}` });

  if (message.attachments.size) {
    const image = message.attachments.find((att) => att.contentType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/.test(att.url));
    if (image) embed.setImage(image.url);
  }

  return embed;
};

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || typeof message.content !== 'string') return;

    if (!message.guild) {
      console.log(`[DM] ${message.author.tag} (${message.author.id}): ${message.content}`);
      return;
    }

    if (message.guild.id !== SOURCE_GUILD_ID || message.channel.id !== SOURCE_CHANNEL_ID) return;

    const embed = createAnnouncementEmbed(message);
    const attachments = message.attachments.size ? [...message.attachments.values()] : [];

    for (const guild of client.guilds.cache.values()) {
      if (guild.id === SOURCE_GUILD_ID) continue;

      const channels = getAnnouncementChannels(guild);
      if (!channels.size) continue;

      const channel = channels.first();
      try {
        await channel.send({ embeds: [embed], files: attachments });
        console.log(`[RELAY] Source announcement ${message.id} relayed to ${guild.name} (${guild.id}) channel ${channel.name} (${channel.id})`);
      } catch (error) {
        console.warn(`Failed to relay announcement to ${guild.id}/${channel.id}:`, error.message);
      }
    }
  }
};
