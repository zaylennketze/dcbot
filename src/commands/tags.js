const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'tags',
  description: 'Create and manage tags/snippets',
  subcommands: [
    {
      name: 'create',
      description: 'Create a tag',
      execute: async (interaction) => {
        const name = interaction.options.getString('name');
        const content = interaction.options.getString('content');

        if (name.length > 20) {
          return interaction.reply('❌ Tag name must be 20 characters or less.');
        }

        if (content.length > 2000) {
          return interaction.reply('❌ Content must be 2000 characters or less.');
        }

        // Save to database
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Tag Created')
          .setDescription(`Tag \`${name}\` has been created.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'delete',
      description: 'Delete a tag',
      execute: async (interaction) => {
        const name = interaction.options.getString('name');

        // Delete from database
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✅ Tag Deleted')
          .setDescription(`Tag \`${name}\` has been deleted.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'get',
      description: 'Get a tag',
      execute: async (interaction) => {
        const name = interaction.options.getString('name');

        // Fetch from database
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`Tag: ${name}`)
          .setDescription('Tag content here');

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'list',
      description: 'List all tags',
      execute: async (interaction) => {
        // Fetch from database
        const tags = ['tag1', 'tag2', 'tag3'];

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📝 Server Tags')
          .setDescription(tags.join('\n') || 'No tags found.');

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
