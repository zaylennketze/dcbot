const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createEmbedPages = (commandList) => {
  const pages = [];
  let fields = [];
  let currentChars = 0;

  const flushPage = () => {
    if (!fields.length) return;
    pages.push(fields);
    fields = [];
    currentChars = 0;
  };

  for (const item of commandList) {
    const lineLength = item.length + 1;
    if (fields.length >= 24 || currentChars + lineLength > 3800) {
      flushPage();
    }
    fields.push({ name: '\u200b', value: item });
    currentChars += lineLength;
  }

  flushPage();
  return pages.map((page, index) => {
    const embed = new EmbedBuilder()
      .setTitle('Bot Command Help')
      .setDescription('Use slash commands with `/` to run commands.')
      .setColor('Blue')
      .setTimestamp();

    if (pages.length > 1) {
      embed.setFooter({ text: `Page ${index + 1} of ${pages.length}` });
    }

    embed.addFields(page);
    return embed;
  });
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

    const embeds = createEmbedPages(commandList);
    if (!embeds.length) {
      return interaction.reply({ content: 'No commands available.', ephemeral: true });
    }

    await interaction.reply({ embeds: [embeds[0]] });

    for (let i = 1; i < embeds.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await interaction.followUp({ embeds: [embeds[i]] });
    }
  }
};
