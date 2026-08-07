const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, AutoModerationActionType, AutoModerationRuleTriggerType, AutoModerationRuleKeywordPresetType, AutoModerationRuleEventType } = require('discord.js');

const triggerOptions = [
  { name: 'Keyword', value: AutoModerationRuleTriggerType.Keyword },
  { name: 'Keyword Preset', value: AutoModerationRuleTriggerType.KeywordPreset },
  { name: 'Spam', value: AutoModerationRuleTriggerType.Spam },
  { name: 'Mention Spam', value: AutoModerationRuleTriggerType.MentionSpam }
];

const actionOptions = [
  { name: 'Block Message', value: AutoModerationActionType.BlockMessage },
  { name: 'Send Alert Message', value: AutoModerationActionType.SendAlertMessage },
  { name: 'Timeout', value: AutoModerationActionType.Timeout },
  { name: 'Block Member Interaction', value: AutoModerationActionType.BlockMemberInteraction }
];

const presetOptions = [
  { name: 'Profanity', value: AutoModerationRuleKeywordPresetType.Profanity },
  { name: 'Sexual Content', value: AutoModerationRuleKeywordPresetType.SexualContent },
  { name: 'Slurs', value: AutoModerationRuleKeywordPresetType.Slurs }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Manage Discord AutoMod rules')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Create a new AutoMod rule')
        .addStringOption((option) => option.setName('name').setDescription('Rule name').setRequired(true))
        .addIntegerOption((option) => option.setName('triggertype').setDescription('Trigger type').setRequired(true).addChoices(...triggerOptions))
        .addIntegerOption((option) => option.setName('actiontype').setDescription('Action type').setRequired(true).addChoices(...actionOptions))
        .addStringOption((option) => option.setName('keywords').setDescription('Comma-separated keywords for Keyword rules'))
        .addIntegerOption((option) => option.setName('preset').setDescription('Keyword preset for Keyword Preset rules').addChoices(...presetOptions))
        .addChannelOption((option) => option.setName('alertchannel').setDescription('Channel for alert messages'))
        .addIntegerOption((option) => option.setName('duration').setDescription('Timeout duration in seconds'))
        .addBooleanOption((option) => option.setName('enabled').setDescription('Enable the rule immediately'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Delete an AutoMod rule')
        .addStringOption((option) => option.setName('ruleid').setDescription('AutoMod rule ID').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List AutoMod rules for this guild')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: 'You need the Manage Server permission to use automod commands.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      const name = interaction.options.getString('name');
      const triggerType = interaction.options.getInteger('triggertype');
      const actionType = interaction.options.getInteger('actiontype');
      const keywords = interaction.options.getString('keywords');
      const preset = interaction.options.getInteger('preset');
      const alertChannel = interaction.options.getChannel('alertchannel');
      const duration = interaction.options.getInteger('duration');
      const enabled = interaction.options.getBoolean('enabled') ?? true;

      const triggerMetadata = {};
      if (triggerType === AutoModerationRuleTriggerType.Keyword) {
        if (!keywords) {
          return interaction.reply({ content: 'Keyword rules require a comma-separated keyword list.', ephemeral: true });
        }
        triggerMetadata.keywordFilter = keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean);
      }

      if (triggerType === AutoModerationRuleTriggerType.KeywordPreset) {
        if (!preset) {
          return interaction.reply({ content: 'Keyword Preset rules require a preset selection.', ephemeral: true });
        }
        triggerMetadata.presets = [preset];
      }

      if (triggerType === AutoModerationRuleTriggerType.MentionSpam) {
        triggerMetadata.mentionRaidProtectionEnabled = true;
      }

      const action = { type: actionType };
      if (actionType === AutoModerationActionType.SendAlertMessage) {
        if (!alertChannel || !alertChannel.isTextBased()) {
          return interaction.reply({ content: 'Send Alert Message actions require a text channel.', ephemeral: true });
        }
        action.metadata = { channel: alertChannel };
      }

      if (actionType === AutoModerationActionType.Timeout) {
        action.metadata = { durationSeconds: duration || 60 };
      }

      try {
        const rule = await interaction.guild.autoModerationRules.create({
          name,
          eventType: AutoModerationRuleEventType.MessageSend,
          triggerType,
          triggerMetadata,
          actions: [action],
          enabled
        });

        const embed = new EmbedBuilder()
          .setTitle('AutoMod Rule Created')
          .addFields(
            { name: 'Name', value: rule.name, inline: true },
            { name: 'ID', value: rule.id, inline: true },
            { name: 'Trigger', value: Object.entries(AutoModerationRuleTriggerType).find(([, value]) => value === rule.triggerType)?.[0] || `${rule.triggerType}`, inline: true },
            { name: 'Action', value: Object.entries(AutoModerationActionType).find(([, value]) => value === rule.actions[0].type)?.[0] || `${rule.actions[0].type}`, inline: true },
            { name: 'Enabled', value: `${rule.enabled}`, inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to create automod rule:', error);
        return interaction.reply({ content: `Failed to create automod rule: ${error.message}`, ephemeral: true });
      }
    }

    if (subcommand === 'delete') {
      const ruleId = interaction.options.getString('ruleid');
      try {
        await interaction.guild.autoModerationRules.delete(ruleId);
        return interaction.reply({ content: `✅ Deleted AutoMod rule ${ruleId}.` });
      } catch (error) {
        console.error('Failed to delete automod rule:', error);
        return interaction.reply({ content: `Could not delete AutoMod rule: ${error.message}`, ephemeral: true });
      }
    }

    if (subcommand === 'list') {
      try {
        const rules = await interaction.guild.autoModerationRules.fetch({ cache: false });
        if (!rules.size) {
          return interaction.reply({ content: 'No AutoMod rules are configured for this guild.', ephemeral: true });
        }

        const description = rules.map((rule) => {
          const triggerName = Object.entries(AutoModerationRuleTriggerType).find(([, value]) => value === rule.triggerType)?.[0] || `${rule.triggerType}`;
          const actionName = Object.entries(AutoModerationActionType).find(([, value]) => value === rule.actions[0]?.type)?.[0] || `${rule.actions[0]?.type}`;
          return `• **${rule.name}** (${rule.id}) — ${triggerName} → ${actionName} ${rule.enabled ? '✅' : '❌'}`;
        }).slice(0, 10).join('\n');

        return interaction.reply({ content: `AutoMod rules for this guild:\n${description}`, ephemeral: true });
      } catch (error) {
        console.error('Failed to fetch automod rules:', error);
        return interaction.reply({ content: `Could not fetch AutoMod rules: ${error.message}`, ephemeral: true });
      }
    }

    return interaction.reply({ content: 'Unknown automod subcommand.', ephemeral: true });
  }
};
