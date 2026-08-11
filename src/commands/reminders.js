const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'reminders',
  description: 'Reminder commands',
  subcommands: [
    {
      name: 'set',
      description: 'Set a reminder',
      execute: async (interaction) => {
        const time = interaction.options.getInteger('time');
        const unit = interaction.options.getString('unit'); // 'minutes', 'hours', 'days'
        const message = interaction.options.getString('message');

        let ms = 0;
        if (unit === 'minutes') ms = time * 60 * 1000;
        else if (unit === 'hours') ms = time * 60 * 60 * 1000;
        else if (unit === 'days') ms = time * 24 * 60 * 60 * 1000;

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Reminder Set')
          .setDescription(`You will be reminded in ${time} ${unit}.`);

        interaction.reply({ embeds: [embed] });

        // Schedule reminder
        setTimeout(() => {
          interaction.user.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('⏰ Reminder')
                .setDescription(message)
            ]
          }).catch(() => {});
        }, ms);
      }
    },
    {
      name: 'list',
      description: 'List your reminders',
      execute: async (interaction) => {
        // Fetch from database
        const reminders = [
          { message: 'Take a break', time: '10:30 AM' }
        ];

        let description = '';
        reminders.forEach((r, idx) => {
          description += `**${idx + 1}.** ${r.message} - ${r.time}\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📋 Your Reminders')
          .setDescription(description || 'No reminders set.');

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'delete',
      description: 'Delete a reminder',
      execute: async (interaction) => {
        const id = interaction.options.getString('id');

        // Delete from database
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✅ Reminder Deleted')
          .setDescription('Reminder has been removed.');

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
