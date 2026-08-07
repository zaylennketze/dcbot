const {
  AutoModerationActionType,
  AutoModerationRuleEventType,
  AutoModerationRuleTriggerType,
  AutoModerationRuleKeywordPresetType
} = require('discord.js');
const config = require('../config');
const { updatePresence } = require('../utils/presence');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    try {
      await updatePresence(client);
    } catch (error) {
      console.warn('Failed to update presence after guild join:', error.message);
    }

    if (!config.moderation.createDefaultAutoModRule) return;

    try {
      const existing = await guild.autoModerationRules.fetch({ cache: false }).catch(() => null);
      const defaultRuleName = 'Default AutoMod - Profanity Block';
      if (existing?.some((rule) => rule.name === defaultRuleName)) return;

      await guild.autoModerationRules.create({
        name: defaultRuleName,
        eventType: AutoModerationRuleEventType.MessageSend,
        triggerType: AutoModerationRuleTriggerType.KeywordPreset,
        triggerMetadata: {
          presets: [AutoModerationRuleKeywordPresetType.Profanity]
        },
        actions: [
          {
            type: AutoModerationActionType.BlockMessage
          }
        ],
        enabled: true
      });

      console.log(`Created default AutoMod rule for guild: ${guild.id}`);
    } catch (error) {
      console.warn(`Could not create default AutoMod rule for guild ${guild.id}:`, error.message);
    }
  }
};
