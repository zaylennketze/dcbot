const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'settings',
  description: 'Bot settings for the server',
  subcommands: [
    {
      name: 'view',
      description: 'View all settings',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        // Fetch from database
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('⚙️ Server Settings')
          .addFields(
            { name: 'Prefix', value: '!', inline: true },
            { name: 'Language', value: 'English', inline: true },
            { name: 'Welcome Channel', value: 'general', inline: true },
            { name: 'Logs Channel', value: 'logs', inline: true },
            { name: 'Auto-Moderation', value: 'Enabled', inline: true },
            { name: 'DM Notifications', value: 'Enabled', inline: true }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'language',
      description: 'Change bot language',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const language = interaction.options.getString('language');
        
        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Language Updated')
          .setDescription(`Language has been set to **${language}**.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'timezone',
      description: 'Set server timezone',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const timezone = interaction.options.getString('timezone');

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Timezone Updated')
          .setDescription(`Timezone has been set to **${timezone}**.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'reset',
      description: 'Reset all settings to default',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        // Reset in database
        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle('⚠️ Settings Reset')
          .setDescription('All settings have been reset to default.');

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
