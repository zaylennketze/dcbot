const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { updatePresence } = require('../utils/presence');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbio')
    .setDescription('Set the bot activity/bio text (owner only)')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('The bot activity text to display')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ownerId = '1069782674882961449';
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: 'Only the bot owner (zaylenn) can change the bio.', ephemeral: true });
    }

    const bioText = interaction.options.getString('text');
    interaction.client.storage.setSetting('global', 'botActivityText', bioText);
    await updatePresence(interaction.client).catch((error) => {
      console.warn('Failed to update presence after setbio:', error);
    });

    const embed = new EmbedBuilder()
      .setTitle('Bot Bio Updated')
      .setDescription(`The bot activity text has been updated to:\n${bioText}`)
      .setColor('#00B0F4');

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
