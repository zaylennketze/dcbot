const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'converter',
  description: 'Unit and format converters',
  subcommands: [
    {
      name: 'temperature',
      description: 'Convert temperature',
      execute: async (interaction) => {
        const value = interaction.options.getNumber('value');
        const from = interaction.options.getString('from'); // 'celsius', 'fahrenheit', 'kelvin'
        const to = interaction.options.getString('to');

        let result = 0;

        if (from === 'celsius' && to === 'fahrenheit') result = (value * 9/5) + 32;
        else if (from === 'fahrenheit' && to === 'celsius') result = (value - 32) * 5/9;
        else if (from === 'celsius' && to === 'kelvin') result = value + 273.15;
        else if (from === 'kelvin' && to === 'celsius') result = value - 273.15;
        else result = value;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🌡️ Temperature Converter')
          .setDescription(`${value}°${from.charAt(0).toUpperCase()} = ${result.toFixed(2)}°${to.charAt(0).toUpperCase()}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'distance',
      description: 'Convert distance',
      execute: async (interaction) => {
        const value = interaction.options.getNumber('value');
        const from = interaction.options.getString('from'); // 'miles', 'kilometers', 'meters'
        const to = interaction.options.getString('to');

        let result = 0;

        if (from === 'miles' && to === 'kilometers') result = value * 1.60934;
        else if (from === 'kilometers' && to === 'miles') result = value / 1.60934;
        else if (from === 'meters' && to === 'kilometers') result = value / 1000;
        else if (from === 'kilometers' && to === 'meters') result = value * 1000;
        else result = value;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📏 Distance Converter')
          .setDescription(`${value}${from.charAt(0)} = ${result.toFixed(2)}${to.charAt(0)}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'weight',
      description: 'Convert weight',
      execute: async (interaction) => {
        const value = interaction.options.getNumber('value');
        const from = interaction.options.getString('from'); // 'pounds', 'kilograms', 'grams'
        const to = interaction.options.getString('to');

        let result = 0;

        if (from === 'pounds' && to === 'kilograms') result = value / 2.20462;
        else if (from === 'kilograms' && to === 'pounds') result = value * 2.20462;
        else if (from === 'grams' && to === 'kilograms') result = value / 1000;
        else if (from === 'kilograms' && to === 'grams') result = value * 1000;
        else result = value;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('⚖️ Weight Converter')
          .setDescription(`${value}${from.charAt(0)} = ${result.toFixed(2)}${to.charAt(0)}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'base64encode',
      description: 'Encode text to base64',
      execute: async (interaction) => {
        const text = interaction.options.getString('text');
        const encoded = Buffer.from(text).toString('base64');

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🔐 Base64 Encoder')
          .addFields(
            { name: 'Original', value: `\`\`\`\n${text}\n\`\`\`` },
            { name: 'Encoded', value: `\`\`\`\n${encoded}\n\`\`\`` }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'base64decode',
      description: 'Decode base64 text',
      execute: async (interaction) => {
        const text = interaction.options.getString('text');
        
        try {
          const decoded = Buffer.from(text, 'base64').toString('utf-8');

          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔓 Base64 Decoder')
            .addFields(
              { name: 'Encoded', value: `\`\`\`\n${text}\n\`\`\`` },
              { name: 'Decoded', value: `\`\`\`\n${decoded}\n\`\`\`` }
            );

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Invalid base64 text.');
        }
      }
    }
  ]
};
