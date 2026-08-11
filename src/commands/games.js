const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'games',
  description: 'Interactive games',
  subcommands: [
    {
      name: 'hangman',
      description: 'Play hangman',
      execute: async (interaction) => {
        const words = ['DISCORD', 'HANGMAN', 'JAVASCRIPT', 'PYTHON', 'DEVELOPER'];
        const word = words[Math.floor(Math.random() * words.length)];
        const guessed = new Set();
        const maxWrong = 6;
        let wrong = 0;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🎮 Hangman')
          .setDescription(`Word: ${word.split('').map(l => guessed.has(l) ? l : '_').join(' ')}\nWrong guesses: ${wrong}/${maxWrong}`);

        interaction.reply({ embeds: [embed], content: 'Use `/hangman guess [letter]` to play!' });
      }
    },
    {
      name: 'trivia',
      description: 'Play trivia',
      execute: async (interaction) => {
        const trivia = [
          { question: 'What is 2 + 2?', answers: ['4', 'four', '04'], correct: 0 },
          { question: 'What is the capital of France?', answers: ['Paris', 'paris', 'PARIS'], correct: 0 }
        ];

        const question = trivia[Math.floor(Math.random() * trivia.length)];

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🎮 Trivia')
          .setDescription(question.question)
          .setFooter({ text: `Answer with: ${question.answers.join(', ')}` });

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'scramble',
      description: 'Unscramble the word',
      execute: async (interaction) => {
        const words = ['DISCORD', 'JAVASCRIPT', 'GAMING'];
        const word = words[Math.floor(Math.random() * words.length)];
        const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🎮 Word Scramble')
          .setDescription(`Unscramble: \`${scrambled}\`\nHint: It has ${word.length} letters`)
          .setFooter({ text: 'Answer in chat or use a command' });

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'twentyquestions',
      description: 'Play 20 questions',
      execute: async (interaction) => {
        const things = ['Cat', 'Pizza', 'Computer', 'Mountain', 'Book'];
        const thing = things[Math.floor(Math.random() * things.length)];

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🎮 20 Questions')
          .setDescription('I am thinking of something...\nAsk me yes/no questions!\nYou have 20 questions.')
          .setFooter({ text: 'Ask your first question!' });

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
