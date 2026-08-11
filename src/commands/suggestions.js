const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'suggestions',
  description: 'Suggestion system commands',
  subcommands: [
    {
      name: 'suggest',
      description: 'Make a suggestion',
      execute: async (interaction) => {
        const suggestion = interaction.options.getString('suggestion');
        
        if (suggestion.length > 1024) {
          return interaction.reply({ content: '❌ Suggestion must be 1024 characters or less.', ephemeral: true });
        }

        const suggestionsChannel = interaction.guild.channels.cache.find(ch => ch.name === 'suggestions');
        if (!suggestionsChannel) {
          return interaction.reply({ content: '❌ No suggestions channel found.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
          .setTitle('💡 New Suggestion')
          .setDescription(suggestion)
          .setFooter({ text: `ID: ${interaction.id}` });

        const upvoteBtn = new ButtonBuilder()
          .setCustomId('suggest_upvote')
          .setLabel('👍 Upvote')
          .setStyle(ButtonStyle.Primary);

        const downvoteBtn = new ButtonBuilder()
          .setCustomId('suggest_downvote')
          .setLabel('👎 Downvote')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(upvoteBtn, downvoteBtn);

        const msg = await suggestionsChannel.send({ embeds: [embed], components: [row] });

        interaction.reply({ content: '✅ Suggestion submitted!', ephemeral: true });
      }
    },
    {
      name: 'approve',
      description: 'Approve a suggestion (admin only)',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const suggestionId = interaction.options.getString('suggestionid');
        const reason = interaction.options.getString('reason');

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Suggestion Approved')
          .addFields(
            { name: 'ID', value: suggestionId },
            { name: 'Reason', value: reason || 'No reason provided' }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'deny',
      description: 'Deny a suggestion (admin only)',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const suggestionId = interaction.options.getString('suggestionid');
        const reason = interaction.options.getString('reason');

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Suggestion Denied')
          .addFields(
            { name: 'ID', value: suggestionId },
            { name: 'Reason', value: reason || 'No reason provided' }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'view',
      description: 'View a suggestion',
      execute: async (interaction) => {
        const suggestionId = interaction.options.getString('suggestionid');
        
        // Fetch from database
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('💡 Suggestion Details')
          .addFields(
            { name: 'Status', value: 'Pending' },
            { name: 'Upvotes', value: '5', inline: true },
            { name: 'Downvotes', value: '1', inline: true }
          );

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
