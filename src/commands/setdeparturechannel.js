const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setdeparturechannel')
    .setDescription('Set the channel for member departure messages')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel where departure messages should be sent')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: 'You need the Manage Server permission to set the departure channel.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    if (!channel.isTextBased()) {
      return interaction.reply({ content: 'Please select a text-based channel.', ephemeral: true });
    }

    interaction.client.storage.setSetting(interaction.guild.id, 'departureChannelId', channel.id);

    const confirmEmbed = new EmbedBuilder()
      .setTitle('Departure Channel Set')
      .setDescription(`Departure messages will now be sent to ${channel}.`)
      .setColor('#FF0000');

    return interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  }
};
