const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'crypto',
  description: 'Cryptocurrency commands',
  subcommands: [
    {
      name: 'price',
      description: 'Get cryptocurrency price',
      execute: async (interaction) => {
        const crypto = interaction.options.getString('crypto').toUpperCase(); // 'BTC', 'ETH', etc

        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto.toLowerCase()}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`);
          const data = await response.json();

          if (!data[crypto.toLowerCase()]) {
            return interaction.reply('❌ Cryptocurrency not found.');
          }

          const price = data[crypto.toLowerCase()].usd;
          const marketcap = data[crypto.toLowerCase()].usd_market_cap;
          const volume = data[crypto.toLowerCase()].usd_24h_vol;

          const embed = new EmbedBuilder()
            .setColor('#f7931a')
            .setTitle(`₿ ${crypto} Price`)
            .addFields(
              { name: 'Price', value: `$${price.toLocaleString()}`, inline: true },
              { name: 'Market Cap', value: `$${marketcap ? (marketcap / 1e9).toFixed(2) + 'B' : 'N/A'}`, inline: true },
              { name: '24h Volume', value: `$${volume ? (volume / 1e9).toFixed(2) + 'B' : 'N/A'}`, inline: true }
            );

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch crypto price.');
        }
      }
    },
    {
      name: 'topcoins',
      description: 'Get top cryptocurrencies by market cap',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1');
          const data = await response.json();

          let description = '';
          data.forEach((coin, idx) => {
            description += `**${idx + 1}.** ${coin.name} (${coin.symbol.toUpperCase()})\n$${coin.current_price.toLocaleString()}\n`;
          });

          const embed = new EmbedBuilder()
            .setColor('#f7931a')
            .setTitle('🏆 Top 10 Cryptocurrencies')
            .setDescription(description);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch crypto data.');
        }
      }
    }
  ]
};
