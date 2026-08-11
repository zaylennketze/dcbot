const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'weather',
  description: 'Weather information',
  subcommands: [
    {
      name: 'current',
      description: 'Get current weather',
      execute: async (interaction) => {
        const city = interaction.options.getString('city');
        const apiKey = process.env.WEATHER_API_KEY || 'YOUR_API_KEY';

        try {
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
          
          if (!response.ok) {
            return interaction.reply('❌ City not found or API key invalid.');
          }

          const data = await response.json();
          const weather = data.weather[0];
          const main = data.main;

          const embed = new EmbedBuilder()
            .setColor('#1e88e5')
            .setTitle(`🌤️ Weather in ${data.name}, ${data.sys.country}`)
            .addFields(
              { name: 'Condition', value: `${weather.main} - ${weather.description}`, inline: false },
              { name: 'Temperature', value: `${main.temp}°C (feels like ${main.feels_like}°C)`, inline: true },
              { name: 'Humidity', value: `${main.humidity}%`, inline: true },
              { name: 'Wind Speed', value: `${data.wind.speed} m/s`, inline: true },
              { name: 'Pressure', value: `${main.pressure} hPa`, inline: true }
            );

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch weather data. Make sure API key is set.');
        }
      }
    },
    {
      name: 'forecast',
      description: 'Get 5-day weather forecast',
      execute: async (interaction) => {
        const city = interaction.options.getString('city');
        const apiKey = process.env.WEATHER_API_KEY || 'YOUR_API_KEY';

        try {
          const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
          
          if (!response.ok) {
            return interaction.reply('❌ City not found.');
          }

          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#1e88e5')
            .setTitle(`📅 5-Day Forecast for ${data.city.name}`)
            .setDescription('Forecast data for upcoming days');

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch forecast data.');
        }
      }
    }
  ]
};
