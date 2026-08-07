const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system commands')
    .addSubcommand((subcommand) => subcommand.setName('open').setDescription('Open a support ticket'))
    .addSubcommand((subcommand) => subcommand.setName('close').setDescription('Close your ticket')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    if (subcommand === 'open') {
      const existing = interaction.client.storage.find('tickets', guildId, userId);
      if (existing && existing.open) {
        return interaction.reply({ content: `You already have an open ticket: <#${existing.channelId}>`, ephemeral: true });
      }

      const category = interaction.guild.channels.cache.get(config.ticket.categoryId);
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: 0,
        parent: category || null,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['ViewChannel']
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
          }
        ]
      });

      interaction.client.storage.upsert('tickets', guildId, userId, { channelId: channel.id, open: 1 });
      await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
      await channel.send(`Hello ${interaction.user}, support will be with you soon.`);
      return null;
    }

    if (subcommand === 'close') {
      const ticket = interaction.client.storage.find('tickets', guildId, userId);
      if (!ticket || ticket.channelId !== interaction.channel.id || !ticket.open) {
        return interaction.reply({ content: 'This command must be used in your open ticket channel.', ephemeral: true });
      }
      interaction.client.storage.upsert('tickets', guildId, userId, { channelId: ticket.channelId, open: 0 });
      await interaction.channel.delete();
      return null;
    }

    return interaction.reply({ content: 'Unknown ticket command.', ephemeral: true });
  }
};
