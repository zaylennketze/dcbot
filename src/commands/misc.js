const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'misc',
  description: 'Miscellaneous commands',
  subcommands: [
    {
      name: 'randomcolor',
      description: 'Generate a random color',
      execute: async (interaction) => {
        const color = Math.floor(Math.random() * 16777215).toString(16);
        const hex = '#' + color.padStart(6, '0').toUpperCase();

        const embed = new EmbedBuilder()
          .setColor(parseInt(color, 16))
          .setTitle('🎨 Random Color')
          .setDescription(`**Hex:** ${hex}\n**RGB:** ${parseInt(color.substring(0, 2), 16)}, ${parseInt(color.substring(2, 4), 16)}, ${parseInt(color.substring(4, 6), 16)}`)
          .setThumbnail(`https://via.placeholder.com/150/${color}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'qrcode',
      description: 'Generate QR code for text',
      execute: async (interaction) => {
        const text = interaction.options.getString('text');
        const size = Math.min(text.length * 10, 300);

        const embed = new EmbedBuilder()
          .setColor('#000000')
          .setTitle('📱 QR Code')
          .setDescription(text)
          .setImage(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'urlshortener',
      description: 'Shorten a URL',
      execute: async (interaction) => {
        const url = interaction.options.getString('url');

        try {
          const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
          const shortUrl = await response.text();

          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔗 Shortened URL')
            .addFields(
              { name: 'Original', value: url, inline: false },
              { name: 'Short', value: shortUrl, inline: false }
            );

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to shorten URL.');
        }
      }
    },
    {
      name: 'ascii',
      description: 'Convert text to ASCII art',
      execute: async (interaction) => {
        const text = interaction.options.getString('text');

        if (text.length > 10) {
          return interaction.reply('❌ Text must be 10 characters or less.');
        }

        // Simple ASCII conversion
        const asciiText = text.toUpperCase().split('').map(c => c.charCodeAt(0)).join(' ');

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🔤 ASCII Conversion')
          .setDescription(`\`\`\`\n${asciiText}\n\`\`\``);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'morse',
      description: 'Convert text to Morse code',
      execute: async (interaction) => {
        const text = interaction.options.getString('text').toUpperCase();
        
        const morseMap = {
          'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
          'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
          'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
          'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
          'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
          '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
          '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', ' ': ' / '
        };

        let morse = text.split('').map(c => morseMap[c] || c).join(' ');

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📡 Morse Code')
          .setDescription(`\`\`\`\n${morse}\n\`\`\``);

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
