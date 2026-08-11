const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'animals',
  description: 'Animal-related commands',
  subcommands: [
    {
      name: 'dog',
      description: 'Get a random dog image',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://dog.ceo/api/breeds/image/random');
          const data = await response.json();

          if (data.status !== 'success') {
            return interaction.reply('❌ Failed to fetch dog image.');
          }

          const embed = new EmbedBuilder()
            .setColor('#8B4513')
            .setTitle('🐕 Random Dog')
            .setImage(data.message);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch dog image.');
        }
      }
    },
    {
      name: 'cat',
      description: 'Get a random cat image',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://api.thecatapi.com/v1/images/search');
          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#FF6347')
            .setTitle('🐱 Random Cat')
            .setImage(data[0].url);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch cat image.');
        }
      }
    },
    {
      name: 'fox',
      description: 'Get a random fox image',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://randomfox.ca/floof/');
          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('🦊 Random Fox')
            .setImage(data.image);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch fox image.');
        }
      }
    },
    {
      name: 'panda',
      description: 'Get a random panda image',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://some-random-api.com/animal/panda');
          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('🐼 Random Panda')
            .setImage(data.image)
            .setDescription(data.fact);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch panda image.');
        }
      }
    },
    {
      name: 'bird',
      description: 'Get a random bird image',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://some-random-api.com/animal/bird');
          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🐦 Random Bird')
            .setImage(data.image)
            .setDescription(data.fact);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch bird image.');
        }
      }
    }
  ]
};
