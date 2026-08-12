const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'antispam',
  description: 'Anti-spam and anti-raid protection',
  subcommands: [
    {
      name: 'setmaxmessages',
      description: 'Set max messages per time period',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');
        const timeframe = interaction.options.getInteger('timeframe'); // in seconds

        if (amount < 1 || amount > 100) {
          return interaction.reply('❌ Amount must be between 1 and 100.');
        }

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Spam Protection Set')
          .setDescription(`Users cannot send more than ${amount} messages every ${timeframe} seconds.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'setfilter',
      description: 'Set content filter',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const filterType = interaction.options.getString('type'); // 'profanity', 'mentions', 'links'
        const enabled = interaction.options.getBoolean('enabled');

        const embed = new EmbedBuilder()
          .setColor(enabled ? '#00ff00' : '#ff0000')
          .setTitle(`${enabled ? '✅' : '❌'} Filter ${enabled ? 'Enabled' : 'Disabled'}`)
          .setDescription(`${filterType} filter has been ${enabled ? 'enabled' : 'disabled'}.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'setinvitefilter',
      description: 'Toggle Discord invite link filtering',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const enabled = interaction.options.getBoolean('enabled');
        const autoDelete = interaction.options.getBoolean('autodelete') || true;

        // Save to database
        const embed = new EmbedBuilder()
          .setColor(enabled ? '#00ff00' : '#ff0000')
          .setTitle(`${enabled ? '✅' : '❌'} Invite Filter ${enabled ? 'Enabled' : 'Disabled'}`)
          .addFields(
            { name: 'Status', value: enabled ? 'Enabled' : 'Disabled' },
            { name: 'Auto Delete', value: autoDelete ? 'Yes' : 'No' }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'antiraid',
      description: 'Configure anti-raid protection',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const enabled = interaction.options.getBoolean('enabled');
        const threshold = interaction.options.getInteger('memberthreshold') || 5;
        const timewindow = interaction.options.getInteger('timewindow') || 30;

        const embed = new EmbedBuilder()
          .setColor(enabled ? '#00ff00' : '#ff0000')
          .setTitle(`${enabled ? '✅' : '❌'} Anti-Raid ${enabled ? 'Enabled' : 'Disabled'}`)
          .addFields(
            { name: 'Status', value: enabled ? 'Enabled' : 'Disabled' },
            { name: 'Threshold', value: `${threshold} members`, inline: true },
            { name: 'Time Window', value: `${timewindow} seconds`, inline: true },
            { name: 'Action', value: 'Raid detected members will be kicked' }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'whitelist',
      description: 'Add user/role to spam filter whitelist',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const target = user || role;

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Whitelisted')
          .setDescription(`${target} has been added to the spam filter whitelist.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'unwarnexcessive',
      description: 'Clear warnings for spam filter',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        // Clear from database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Spam Warnings Cleared')
          .setDescription('All spam filter warnings have been reset.');

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
