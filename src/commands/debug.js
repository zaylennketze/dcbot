const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'debug',
  description: 'Debug and diagnostic commands',
  subcommands: [
    {
      name: 'permissions',
      description: 'Check user permissions',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const perms = member.permissions.toArray();

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`📋 Permissions for ${user.username}`)
          .setDescription(perms.length > 0 ? perms.join('\n') : 'No permissions');

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'uptyme',
      description: 'Get bot uptime',
      execute: async (interaction) => {
        const uptime = interaction.client.uptime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor((uptime % 86400000) / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('⏱️ Bot Uptime')
          .setDescription(`${days}d ${hours}h ${minutes}m ${seconds}s`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'stats',
      description: 'Get bot statistics',
      execute: async (interaction) => {
        const client = interaction.client;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📊 Bot Statistics')
          .addFields(
            { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${client.users.cache.size}`, inline: true },
            { name: 'Channels', value: `${client.channels.cache.size}`, inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
            { name: 'Uptime', value: `${(client.uptime / 3600000).toFixed(2)} hours`, inline: true }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'checkrole',
      description: 'Check role properties',
      execute: async (interaction) => {
        const role = interaction.options.getRole('role');

        const embed = new EmbedBuilder()
          .setColor(role.color || '#808080')
          .setTitle(`Role: ${role.name}`)
          .addFields(
            { name: 'Role ID', value: role.id, inline: true },
            { name: 'Position', value: `${role.position}`, inline: true },
            { name: 'Color', value: role.color ? `#${role.color.toString(16)}` : 'None', inline: true },
            { name: 'Members', value: `${role.members.size}`, inline: true },
            { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
            { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
            { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false }
          );

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
