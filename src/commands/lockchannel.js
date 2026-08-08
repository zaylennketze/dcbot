const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockchannel')
    .setDescription('Lock or unlock the current channel')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('lock')
        .setDescription('Lock the current text channel')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unlock')
        .setDescription('Unlock the current text channel')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'You need the Manage Channels permission to use this command.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.channel;

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({ content: 'This command must be used in a text channel.', ephemeral: true });
    }

    if (subcommand === 'lock') {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false
      });
      return interaction.reply({ content: '🔒 Channel locked successfully.', ephemeral: true });
    }

    if (subcommand === 'unlock') {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: true,
        AddReactions: true
      });
      return interaction.reply({ content: '🔓 Channel unlocked successfully.', ephemeral: true });
    }

    return interaction.reply({ content: 'Unknown lockchannel subcommand.', ephemeral: true });
  }
};
