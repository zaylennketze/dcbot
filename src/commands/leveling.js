const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leveling',
  description: 'Leveling system commands',
  subcommands: [
    {
      name: 'rank',
      description: 'Check your rank and XP',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        
        // Implement with your leveling database
        // Example structure:
        const level = 5;
        const xp = 1250;
        const nextLevelXp = 2000;
        const totalXp = 5250;

        const progressBar = this.createProgressBar(xp, nextLevelXp);

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setAuthor({ name: user.username, iconURL: user.avatarURL() })
          .setTitle('📊 Rank Card')
          .addFields(
            { name: 'Level', value: `${level}`, inline: true },
            { name: 'Total XP', value: `${totalXp}`, inline: true },
            { name: 'Progress to Next Level', value: `${xp}/${nextLevelXp} XP\n${progressBar}`, inline: false }
          )
          .setThumbnail(user.avatarURL());

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'leaderboard',
      description: 'View server leaderboard',
      execute: async (interaction) => {
        // Implement with your leveling database
        // This is an example structure
        const topUsers = [
          { username: 'User1', level: 10, xp: 25000 },
          { username: 'User2', level: 8, xp: 18000 },
          { username: 'User3', level: 7, xp: 15000 }
        ];

        let description = '';
        topUsers.forEach((user, index) => {
          description += `**${index + 1}.** ${user.username} - Level ${user.level} (${user.xp} XP)\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle('🏆 Server Leaderboard')
          .setDescription(description || 'No users have leveled up yet.');

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'addxp',
      description: 'Add XP to a user (admin only)',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (amount < 0) {
          return interaction.reply('❌ XP amount cannot be negative.');
        }

        // Add XP to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ XP Added')
          .setDescription(`Added ${amount} XP to ${user}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'resetlevel',
      description: 'Reset a user\'s level (admin only)',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        // Reset level in database
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✅ Level Reset')
          .setDescription(`Reset level for ${user}`);

        interaction.reply({ embeds: [embed] });
      }
    }
  ],

  createProgressBar(current, max, size = 10) {
    const percentage = current / max;
    const filledSize = Math.round(size * percentage);
    return '[' + '█'.repeat(filledSize) + '░'.repeat(size - filledSize) + ']';
  }
};
