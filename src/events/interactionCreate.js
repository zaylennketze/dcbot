module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const user = interaction.user.tag;
    const guild = interaction.guild?.name || 'DM';
    const guildId = interaction.guild?.id || 'N/A';
    const userId = interaction.user.id;
    console.log(`[COMMAND] ${user} (${userId}) in ${guild} (${guildId}): /${interaction.commandName}`);

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
      }
    }
  }
};
