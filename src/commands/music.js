const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Music control commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('Play a song or playlist')
        .addStringOption((option) => option.setName('query').setDescription('Song name or URL').setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName('skip').setDescription('Skip the current song'))
    .addSubcommand((subcommand) => subcommand.setName('stop').setDescription('Stop playback and clear the queue'))
    .addSubcommand((subcommand) => subcommand.setName('queue').setDescription('Show the current queue')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: 'You must be in a voice channel to use music commands.', ephemeral: true });
    }
    const queue = interaction.client.distube.getQueue(interaction);

    switch (subcommand) {
      case 'play': {
        const query = interaction.options.getString('query');
        await interaction.reply({ content: `🔎 Searching for: ${query}` });
        await interaction.client.distube.play(voiceChannel, query, {
          member: interaction.member,
          textChannel: interaction.channel,
          interaction
        });
        return null;
      }
      case 'skip': {
        if (!queue) return interaction.reply({ content: 'There is no queue to skip.', ephemeral: true });
        queue.skip();
        return interaction.reply({ content: '⏭️ Skipped the current song.' });
      }
      case 'stop': {
        if (!queue) return interaction.reply({ content: 'There is no queue to stop.', ephemeral: true });
        queue.stop();
        return interaction.reply({ content: '⏹️ Stopped playback and cleared the queue.' });
      }
      case 'queue': {
        if (!queue) return interaction.reply({ content: 'No songs are currently queued.', ephemeral: true });
        const description = queue.songs.map((song, index) => `${index + 1}. ${song.name} (${song.formattedDuration})`).slice(0, 10).join('\n');
        return interaction.reply({ content: `🎶 Current queue:\n${description}` });
      }
      default:
        return interaction.reply({ content: 'Unknown music command.', ephemeral: true });
    }
  }
};
