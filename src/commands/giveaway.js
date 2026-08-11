const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'giveaway',
  description: 'Giveaway commands',
  subcommands: [
    {
      name: 'start',
      description: 'Start a giveaway',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getInteger('duration');
        const winners = interaction.options.getInteger('winners') || 1;

        const endTime = Date.now() + (duration * 60 * 1000);
        const channel = interaction.channel;

        const embed = new EmbedBuilder()
          .setColor('#ffd700')
          .setTitle('🎉 GIVEAWAY 🎉')
          .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}`)
          .addFields(
            { name: 'Duration', value: `${duration} minutes`, inline: true },
            { name: 'Ends', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
          )
          .setFooter({ text: 'Click the button below to enter!' });

        const button = new ButtonBuilder()
          .setCustomId('giveaway_enter')
          .setLabel('🎁 Enter Giveaway')
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        const giveawayMessage = await channel.send({ embeds: [embed], components: [row] });

        // Store giveaway data (implement with your database)
        // {
        //   messageId: giveawayMessage.id,
        //   channelId: channel.id,
        //   prize: prize,
        //   winners: winners,
        //   endTime: endTime,
        //   participants: []
        // }

        interaction.reply({ content: `✅ Giveaway started! Prize: **${prize}** for **${winners}** winner(s)`, ephemeral: true });

        // End giveaway after duration
        setTimeout(async () => {
          await this.endGiveaway(giveawayMessage, prize, winners);
        }, duration * 60 * 1000);
      }
    },
    {
      name: 'end',
      description: 'End a giveaway early',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const messageId = interaction.options.getString('messageid');
        
        try {
          const message = await interaction.channel.messages.fetch(messageId);
          // Retrieve giveaway data and end it
          interaction.reply('✅ Giveaway ended.');
        } catch (error) {
          interaction.reply('❌ Could not find that giveaway message.');
        }
      }
    },
    {
      name: 'reroll',
      description: 'Reroll giveaway winners',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const messageId = interaction.options.getString('messageid');

        try {
          const message = await interaction.channel.messages.fetch(messageId);
          // Retrieve previous participants and pick new winners
          interaction.reply('✅ Giveaway rerolled.');
        } catch (error) {
          interaction.reply('❌ Could not find that giveaway message.');
        }
      }
    }
  ],

  async endGiveaway(message, prize, winnersCount) {
    try {
      // Retrieve participants from database
      const participants = []; // placeholder
      
      if (participants.length === 0) {
        return message.reply('❌ No one entered the giveaway!');
      }

      const winners = [];
      for (let i = 0; i < Math.min(winnersCount, participants.length); i++) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        winners.push(participants.splice(randomIndex, 1)[0]);
      }

      const winnerMentions = winners.map(w => `<@${w}>`).join(', ');

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🎉 GIVEAWAY ENDED 🎉')
        .addFields(
          { name: 'Prize', value: prize },
          { name: 'Winner(s)', value: winnerMentions },
          { name: 'Total Entries', value: participants.length.toString() }
        );

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error ending giveaway:', error);
    }
  }
};
