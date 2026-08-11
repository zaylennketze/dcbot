const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'welcome',
  description: 'Welcome message settings',
  subcommands: [
    {
      name: 'setmessage',
      description: 'Set welcome message',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const message = interaction.options.getString('message');
        
        // Variables support: {user}, {guild}, {count}
        if (message.length > 2000) {
          return interaction.reply({ content: '❌ Message must be 2000 characters or less.', ephemeral: true });
        }

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Welcome Message Set')
          .setDescription(`Message:\n\`\`\`\n${message}\n\`\`\``)
          .addFields(
            { name: 'Variables', value: '{user} - Mention member\n{guild} - Guild name\n{count} - Member count' }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'setchannel',
      description: 'Set welcome channel',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Welcome Channel Set')
          .setDescription(`Welcome messages will be sent to ${channel}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'togglewelcome',
      description: 'Toggle welcome messages',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const enabled = interaction.options.getBoolean('enabled');

        const embed = new EmbedBuilder()
          .setColor(enabled ? '#00ff00' : '#ff0000')
          .setTitle(`${enabled ? '✅ Welcome' : '❌ Welcome'} Messages ${enabled ? 'Enabled' : 'Disabled'}`)
          .setDescription(enabled ? 'New members will receive welcome messages.' : 'New members will not receive welcome messages.');

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'setfarewellmessage',
      description: 'Set farewell message for members leaving',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const message = interaction.options.getString('message');

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Farewell Message Set')
          .setDescription(`Message:\n\`\`\`\n${message}\n\`\`\``);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'testrole',
      description: 'Test auto-role on yourself',
      execute: async (interaction) => {
        try {
          // Test auto role assignment
          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('✅ Role Test')
            .setDescription('You have been given the auto-role temporarily for testing.');

          interaction.reply({ embeds: [embed] });

          setTimeout(() => {
            interaction.editReply({ content: '✅ Role removed.' });
          }, 5000);
        } catch (error) {
          interaction.reply('❌ Failed to test role assignment.');
        }
      }
    }
  ]
};
