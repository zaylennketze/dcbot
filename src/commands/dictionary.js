const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dictionary',
  description: 'Dictionary and word definition commands',
  subcommands: [
    {
      name: 'define',
      description: 'Get word definition',
      execute: async (interaction) => {
        const word = interaction.options.getString('word');

        try {
          const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
          
          if (!response.ok) {
            return interaction.reply('❌ Word not found in dictionary.');
          }

          const data = await response.json();
          const entry = data[0];

          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(entry.word)
            .addFields(
              { name: 'Pronunciation', value: entry.phonetic || 'N/A', inline: false }
            );

          entry.meanings.slice(0, 3).forEach(meaning => {
            embed.addFields({
              name: `${meaning.partOfSpeech}`,
              value: meaning.definitions.slice(0, 2).map((d, i) => `${i + 1}. ${d.definition}`).join('\n'),
              inline: false
            });
          });

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch definition.');
        }
      }
    },
    {
      name: 'synonym',
      description: 'Get word synonyms',
      execute: async (interaction) => {
        const word = interaction.options.getString('word');

        try {
          const response = await fetch(`https://api.api-ninjas.com/v1/thesaurus?word=${word}`, {
            headers: { 'X-Api-Key': 'YOUR_API_KEY' }
          });

          if (!response.ok) {
            return interaction.reply('❌ Could not find synonyms.');
          }

          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Synonyms for "${word}"`)
            .setDescription(data.synonyms?.slice(0, 10).join(', ') || 'No synonyms found.');

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch synonyms.');
        }
      }
    }
  ]
};
