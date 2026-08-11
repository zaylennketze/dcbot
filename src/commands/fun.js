const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'fun',
  description: 'Fun commands',
  subcommands: [
    {
      name: 'meme',
      description: 'Get a random meme',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://meme-api.com/gimme');
          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#ff00ff')
            .setTitle(data.title)
            .setImage(data.url)
            .setFooter({ text: `👍 ${data.ups} | 💬 ${data.comments}` });

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch meme.');
        }
      }
    },
    {
      name: 'joke',
      description: 'Get a random joke',
      execute: async (interaction) => {
        try {
          const response = await fetch('https://official-joke-api.appspot.com/random_joke');
          const data = await response.json();

          const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle(data.setup)
            .setDescription(data.punchline);

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          interaction.reply('❌ Failed to fetch joke.');
        }
      }
    },
    {
      name: 'coinflip',
      description: 'Flip a coin',
      execute: async (interaction) => {
        const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle('Coin Flip')
          .setDescription(result);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'dice',
      description: 'Roll a dice',
      execute: async (interaction) => {
        const sides = interaction.options.getInteger('sides') || 6;
        if (sides < 2 || sides > 100) {
          return interaction.reply('❌ Dice sides must be between 2 and 100.');
        }

        const result = Math.floor(Math.random() * sides) + 1;
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle(`🎲 Dice Roll (1-${sides})`)
          .setDescription(`**Result: ${result}**`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'rps',
      description: 'Play rock-paper-scissors',
      execute: async (interaction) => {
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        const userChoice = interaction.options.getString('choice').toLowerCase();

        if (!choices.includes(userChoice)) {
          return interaction.reply('❌ Invalid choice. Use rock, paper, or scissors.');
        }

        let result = '';
        if (userChoice === botChoice) {
          result = "It's a tie! 🤝";
        } else if (
          (userChoice === 'rock' && botChoice === 'scissors') ||
          (userChoice === 'paper' && botChoice === 'rock') ||
          (userChoice === 'scissors' && botChoice === 'paper')
        ) {
          result = 'You won! 🎉';
        } else {
          result = 'I won! 🤖';
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Rock-Paper-Scissors')
          .addFields(
            { name: 'Your Choice', value: userChoice.charAt(0).toUpperCase() + userChoice.slice(1), inline: true },
            { name: 'My Choice', value: botChoice.charAt(0).toUpperCase() + botChoice.slice(1), inline: true },
            { name: 'Result', value: result, inline: false }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'eightball',
      description: 'Ask the magic 8 ball a question',
      execute: async (interaction) => {
        const responses = [
          'Yes, definitely! ✅',
          'No, absolutely not. ❌',
          'Ask again later. 🔮',
          'Maybe... 🤔',
          'Don\'t count on it. ⛔',
          'Outlook good! 👍',
          'Very doubtful. 👎',
          'Signs point to yes! ✨',
          'Cannot predict now. 🌙',
          'My sources say no. 🗣️'
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        const embed = new EmbedBuilder()
          .setColor('#800080')
          .setTitle('🔮 Magic 8 Ball')
          .setDescription(response);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'love',
      description: 'Calculate love percentage',
      execute: async (interaction) => {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2');
        
        const combined = user1.id + user2.id;
        const percentage = Math.floor((combined.charCodeAt(0) * combined.charCodeAt(1)) % 101);

        const embed = new EmbedBuilder()
          .setColor('#ff69b4')
          .setTitle('💕 Love Calculator')
          .addFields(
            { name: 'User 1', value: user1.username, inline: true },
            { name: 'User 2', value: user2.username, inline: true },
            { name: 'Love %', value: `${'💗'.repeat(Math.ceil(percentage / 20))} ${percentage}%`, inline: false }
          );

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
