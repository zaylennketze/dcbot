const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available bot commands'),

  async execute(interaction, client) {
    const commandList = [...client.commands.values()]
      .map((command) => {
        const description = command.data.description || 'No description available.';
        const subcommands = command.data.options
          .filter((option) => option.type === 1)
          .map((subcommand) => `• ${subcommand.name} — ${subcommand.description}`)
          .join('\n');

        return `**/${command.data.name}** — ${description}${subcommands ? `\n${subcommands}` : ''}`;
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('Bot Command Help')
      .setDescription('Use these slash commands to interact with the bot. Moderation, utility, economy, music, tickets, and automod are all included.')
      .addFields({ name: 'Commands', value: commandList || 'No commands available.' })
      .setColor('Blue')
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
