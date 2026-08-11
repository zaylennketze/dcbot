const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'profile',
  description: 'User profile commands',
  subcommands: [
    {
      name: 'bio',
      description: 'Set or view user bio',
      execute: async (interaction) => {
        const bio = interaction.options.getString('bio');

        if (bio && bio.length > 200) {
          return interaction.reply('❌ Bio must be 200 characters or less.');
        }

        // Save to database if bio is provided
        if (bio) {
          const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Bio Updated')
            .setDescription(`Your bio: ${bio}`);

          interaction.reply({ embeds: [embed] });
        } else {
          // Retrieve bio from database
          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${interaction.user.username}'s Bio`)
            .setDescription('No bio set yet.');

          interaction.reply({ embeds: [embed] });
        }
      }
    },
    {
      name: 'stats',
      description: 'View your profile statistics',
      execute: async (interaction) => {
        const user = interaction.user;

        // Fetch stats from database
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setAuthor({ name: user.username, iconURL: user.avatarURL() })
          .setTitle('📊 Profile Stats')
          .addFields(
            { name: 'Messages', value: '42', inline: true },
            { name: 'Level', value: '5', inline: true },
            { name: 'XP', value: '1250/2000', inline: true },
            { name: 'Warnings', value: '0', inline: true }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'badges',
      description: 'View your badges',
      execute: async (interaction) => {
        // Fetch badges from database
        const badges = ['✅ Active Member', '📱 Early Adopter', '💬 Chatty'];

        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle('🏆 Your Badges')
          .setDescription(badges.join('\n') || 'No badges yet.');

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
