const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const chunkFields = (items) => {
  const fields = [];
  let currentValue = '';

  for (const item of items) {
    if (currentValue.length + item.length + 1 > 1024) {
      fields.push({ name: '\u200b', value: currentValue || 'No commands available.' });
      currentValue = `${item}\n`;
      continue;
    }
    currentValue += `${item}\n`;
  }

  if (currentValue) fields.push({ name: '\u200b', value: currentValue });
  return fields;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available bot commands'),

  async execute(interaction, client) {
    const commandList = [...client.commands.values()].map((command) => {
      const name = command.data?.name || command.name || 'unknown';
      const description = command.data?.description || command.description || 'No description available.';
      const subcommands = Array.isArray(command.subcommands)
        ? command.subcommands.map((sub) => `• /${name} ${sub.name} — ${sub.description}`).join('\n')
        : (command.data?.options || [])
            .filter((option) => option.type === 1)
            .map((subcommand) => `• /${name} ${subcommand.name} — ${subcommand.description}`)
            .join('\n');

      return `**/${name}** — ${description}${subcommands ? `\n${subcommands}` : ''}`;
    });

    const fields = chunkFields(commandList);
    const embed = new EmbedBuilder()
      .setTitle('Bot Command Help')
      .setDescription('Use slash commands with `/` to run commands.')
      .setColor('Blue')
      .setTimestamp();

    for (const field of fields) {
      embed.addFields(field);
    }

    return interaction.reply({ embeds: [embed] });
  }
};
