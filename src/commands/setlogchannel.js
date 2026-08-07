const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Set the bot logs channel for startup/shutdown embeds')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to receive bot status logs')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: 'You need the Manage Server permission to set the bot logs channel.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    if (!channel.isTextBased()) {
      return interaction.reply({ content: 'Please select a text-based channel.', ephemeral: true });
    }

    interaction.client.storage.setSetting(interaction.guild.id, 'botLogChannelId', channel.id);

    const confirmEmbed = new EmbedBuilder()
      .setTitle('Bot Logs Channel Set')
      .setDescription(`Bot startup and shutdown logs will now be sent to ${channel}.`)
      .setColor('#00B0F4');

    return interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  }
};
