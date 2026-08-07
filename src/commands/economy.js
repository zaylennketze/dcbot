const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Economy system commands')
    .addSubcommand((subcommand) => subcommand.setName('balance').setDescription('Check your balance'))
    .addSubcommand((subcommand) => subcommand.setName('daily').setDescription('Claim daily rewards'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('pay')
        .setDescription('Pay another member')
        .addUserOption((option) => option.setName('target').setDescription('Recipient').setRequired(true))
        .addIntegerOption((option) => option.setName('amount').setDescription('Amount to pay').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('gamble')
        .setDescription('Gamble coins for a chance to win')
        .addIntegerOption((option) => option.setName('amount').setDescription('Amount to gamble').setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName('leaderboard').setDescription('Show top balances')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const defaultBalance = require('../config.json').economy.startingBalance;

    const userRow = interaction.client.storage.find('economy', guildId, userId) || { balance: defaultBalance, lastDaily: 0 };
    const saveBalance = (newBalance, lastDaily = userRow.lastDaily) => {
      return interaction.client.storage.upsert('economy', guildId, userId, { balance: newBalance, lastDaily });
    };

    switch (subcommand) {
      case 'balance':
        return interaction.reply({ content: `💰 Your balance: ${userRow.balance} coins.` });
      case 'daily': {
        const now = Date.now();
        const last = userRow.lastDaily || 0;
        if (now - last < 24 * 60 * 60 * 1000) {
          const due = 24 * 60 * 60 * 1000 - (now - last);
          return interaction.reply({ content: `⏳ You can claim again in ${ms(due, { long: true })}.`, ephemeral: true });
        }
        const amount = require('../config.json').economy.dailyAmount;
        saveBalance(userRow.balance + amount, now);
        return interaction.reply({ content: `🎉 Daily claimed! You received ${amount} coins. New balance: ${userRow.balance + amount}.` });
      }
      case 'pay': {
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        if (target.id === userId) return interaction.reply({ content: 'You cannot pay yourself.', ephemeral: true });
        if (amount <= 0 || amount > userRow.balance) return interaction.reply({ content: 'Invalid amount.', ephemeral: true });

        const targetRow = interaction.client.storage.find('economy', guildId, target.id) || { balance: defaultBalance, lastDaily: 0 };
        interaction.client.storage.upsert('economy', guildId, target.id, { balance: targetRow.balance + amount, lastDaily: targetRow.lastDaily });
        saveBalance(userRow.balance - amount);
        return interaction.reply({ content: `✅ Paid ${target.tag} ${amount} coins. Your new balance: ${userRow.balance - amount}.` });
      }
      case 'gamble': {
        const amount = interaction.options.getInteger('amount');
        if (amount <= 0 || amount > userRow.balance) return interaction.reply({ content: 'Invalid amount.', ephemeral: true });
        const chance = Math.random();
        const multiplier = chance < 0.5 ? 0 : chance < 0.75 ? 1 : chance < 0.95 ? 2 : 3;
        const profit = amount * multiplier;
        const result = profit === 0 ? -amount : profit;
        saveBalance(userRow.balance + result);
        const message = profit === 0 ? `❌ You lost ${amount} coins.` : `🎉 You won ${profit} coins!`;
        return interaction.reply({ content: `${message} New balance: ${userRow.balance + result}.` });
      }
      case 'leaderboard': {
        const rows = interaction.client.storage.getAll('economy', guildId)
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 10);
        const description = rows.map((row, index) => `${index + 1}. <@${row.userId}> — ${row.balance} coins`).join('\n') || 'No economy data yet.';
        return interaction.reply({ content: `🏆 Economy leaderboard:\n${description}` });
      }
      default:
        return interaction.reply({ content: 'Unknown economy command.', ephemeral: true });
    }
  }
};
