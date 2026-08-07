const { EmbedBuilder, AutoModerationActionType } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'autoModerationActionExecution',
  async execute(execution, client) {
    const channelId = config.moderation.automodLogChannelId || config.moderation.logChannelId;
    const logChannel = channelId ? await client.channels.fetch(channelId).catch(() => null) : null;
    const user = await client.users.fetch(execution.userId).catch(() => null);

    const actionName = Object.entries(AutoModerationActionType).find(([, value]) => value === execution.action.type)?.[0] || `${execution.action.type}`;
    const embed = new EmbedBuilder()
      .setTitle('AutoMod Action Executed')
      .addFields(
        { name: 'Rule ID', value: execution.ruleId, inline: true },
        { name: 'Action', value: actionName, inline: true },
        { name: 'User', value: user ? `${user.tag}` : execution.userId, inline: true },
        { name: 'Channel', value: execution.channel?.toString() || 'Unknown', inline: true },
        { name: 'Trigger Type', value: `${execution.ruleTriggerType}`, inline: true },
        { name: 'Message', value: execution.messageId ? `https://discord.com/channels/${execution.guild.id}/${execution.channelId}/${execution.messageId}` : 'None', inline: false }
      )
      .setTimestamp();

    if (execution.content) {
      embed.addFields({ name: 'Content', value: execution.content.length > 1024 ? `${execution.content.slice(0, 1021)}...` : execution.content });
    }

    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({ embeds: [embed] }).catch(() => console.log('Unable to send AutoMod log message.'));
    } else {
      console.log('AutoMod action executed:', {
        ruleId: execution.ruleId,
        action: actionName,
        userId: execution.userId,
        channelId: execution.channelId,
        messageId: execution.messageId,
        triggerType: execution.ruleTriggerType
      });
    }
  }
};
