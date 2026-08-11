const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roleplay',
  description: 'Roleplay and interaction commands',
  subcommands: [
    {
      name: 'hug',
      description: 'Hug someone',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user');

        if (user.id === interaction.user.id) {
          return interaction.reply('❌ You cannot hug yourself!');
        }

        // Fetch a hug gif (example)
        const gifs = [
          'https://media.tenor.com/images/hug1.gif',
          'https://media.tenor.com/images/hug2.gif'
        ];

        const embed = new EmbedBuilder()
          .setColor('#ff69b4')
          .setDescription(`${interaction.user} hugs ${user} 🤗`)
          .setImage(gifs[Math.floor(Math.random() * gifs.length)]);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'kiss',
      description: 'Kiss someone',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user');

        if (user.id === interaction.user.id) {
          return interaction.reply('❌ You cannot kiss yourself!');
        }

        const embed = new EmbedBuilder()
          .setColor('#ff1493')
          .setDescription(`${interaction.user} kisses ${user} 💋`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'punch',
      description: 'Punch someone',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user');

        if (user.id === interaction.user.id) {
          return interaction.reply('❌ You cannot punch yourself!');
        }

        const embed = new EmbedBuilder()
          .setColor('#ff4500')
          .setDescription(`${interaction.user} punches ${user} 👊`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'slap',
      description: 'Slap someone',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user');

        if (user.id === interaction.user.id) {
          return interaction.reply('❌ You cannot slap yourself!');
        }

        const embed = new EmbedBuilder()
          .setColor('#ff8c00')
          .setDescription(`${interaction.user} slaps ${user} 👋`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'bite',
      description: 'Bite someone',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user');

        if (user.id === interaction.user.id) {
          return interaction.reply('❌ You cannot bite yourself!');
        }

        const embed = new EmbedBuilder()
          .setColor('#a52a2a')
          .setDescription(`${interaction.user} bites ${user} 😬`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'pat',
      description: 'Pat someone',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user');

        const embed = new EmbedBuilder()
          .setColor('#87ceeb')
          .setDescription(`${interaction.user} pats ${user} 🤚`);

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
