const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'search',
  description: 'Search commands',
  subcommands: [
    {
      name: 'google',
      description: 'Search Google',
      execute: async (interaction) => {
        const query = interaction.options.getString('query');
        
        const embed = new EmbedBuilder()
          .setColor('#4285f4')
          .setTitle('🔍 Google Search')
          .setDescription(`[Search results for "${query}"](https://google.com/search?q=${encodeURIComponent(query)})`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'wikipedia',
      description: 'Search Wikipedia',
      execute: async (interaction) => {
        const query = interaction.options.getString('query');

        try {
          const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
          const data = await response.json();

          if (data.type === 'not-found') {
            return interaction.reply('❌ No Wikipedia article found.');
          }

          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(data.title)
            .setDescription(data.extract)
            .setURL(data.content_urls.desktop.page)
            .setThumbnail(data.thumbnail?.source);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to search Wikipedia.');
        }
      }
    },
    {
      name: 'youtube',
      description: 'Search YouTube',
      execute: async (interaction) => {
        const query = interaction.options.getString('query');

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('▶️ YouTube Search')
          .setDescription(`[Search results for "${query}"](https://youtube.com/results?search_query=${encodeURIComponent(query)})`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'urbandictionary',
      description: 'Search Urban Dictionary',
      execute: async (interaction) => {
        const query = interaction.options.getString('query');

        try {
          const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`);
          const data = await response.json();

          if (data.list.length === 0) {
            return interaction.reply('❌ Definition not found.');
          }

          const result = data.list[0];
          const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle(result.word)
            .setDescription(result.definition.substring(0, 1024))
            .addFields(
              { name: 'Example', value: result.example.substring(0, 1024) || 'N/A' },
              { name: 'Rating', value: `👍 ${result.thumbs_up} | 👎 ${result.thumbs_down}` }
            );

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to search Urban Dictionary.');
        }
      }
    }
  ]
};
