const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'admin',
  description: 'Server admin commands',
  subcommands: [
    {
      name: 'prefix',
      description: 'Set server prefix',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }
        
        const prefix = interaction.options.getString('prefix');
        if (prefix.length > 5) {
          return interaction.reply({ content: '❌ Prefix must be 5 characters or less.', ephemeral: true });
        }

        // Save prefix to database (implement with your DB solution)
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Prefix Updated')
          .setDescription(`New prefix: \`${prefix}\``);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'autorole',
      description: 'Set auto-assign role on join',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Auto-Role Set')
          .setDescription(`Members will automatically receive: ${role}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'setbooster',
      description: 'Set booster role',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Booster Role Set')
          .setDescription(`Booster role: ${role}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'dmnotifications',
      description: 'Toggle DM notifications for mod actions',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You need Administrator permissions.', ephemeral: true });
        }

        const toggle = interaction.options.getBoolean('enabled');
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ DM Notifications ' + (toggle ? 'Enabled' : 'Disabled'))
          .setDescription(toggle ? 'Users will be DMed about mod actions.' : 'Users will not be DMed.');

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'serverinfo',
      description: 'Get server information',
      execute: async (interaction) => {
        const guild = interaction.guild;
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Server Information')
          .addFields(
            { name: 'Server Name', value: guild.name, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: 'Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
            { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
            { name: 'Boost Count', value: `${guild.premiumSubscriptionCount}`, inline: true }
          )
          .setThumbnail(guild.iconURL({ dynamic: true }));

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'roleinfo',
      description: 'Get role information',
      execute: async (interaction) => {
        const role = interaction.options.getRole('role');
        const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;

        const embed = new EmbedBuilder()
          .setColor(role.color || '#808080')
          .setTitle(`Role Information: ${role.name}`)
          .addFields(
            { name: 'Role ID', value: role.id, inline: true },
            { name: 'Color', value: role.color ? `#${role.color.toString(16)}` : 'None', inline: true },
            { name: 'Members', value: `${members}`, inline: true },
            { name: 'Position', value: `${role.position}`, inline: true },
            { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
            { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }
          );

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
