const { EmbedBuilder, version } = require('discord.js');

module.exports = {
  name: 'info',
  description: 'Information commands',
  subcommands: [
    {
      name: 'userinfo',
      description: 'Get user information',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setAuthor({ name: user.username, iconURL: user.avatarURL() })
          .setTitle('👤 User Information')
          .addFields(
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Username', value: user.username, inline: true },
            { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
            { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'N/A', inline: true },
            { name: 'Roles', value: member ? member.roles.cache.size : 'N/A', inline: true }
          )
          .setThumbnail(user.avatarURL({ dynamic: true, size: 512 }));

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'membercount',
      description: 'Get server member count',
      execute: async (interaction) => {
        const guild = interaction.guild;
        const total = guild.memberCount;
        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('👥 Member Count')
          .addFields(
            { name: 'Total Members', value: `${total}`, inline: true },
            { name: 'Humans', value: `${humans}`, inline: true },
            { name: 'Bots', value: `${bots}`, inline: true }
          );

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'botinfo',
      description: 'Get bot information',
      execute: async (interaction) => {
        const bot = interaction.client.user;
        const uptime = interaction.client.uptime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🤖 Bot Information')
          .addFields(
            { name: 'Bot Name', value: bot.username, inline: true },
            { name: 'Bot ID', value: bot.id, inline: true },
            { name: 'Discord.js Version', value: version, inline: true },
            { name: 'Uptime', value: `${hours}h ${minutes}m`, inline: true },
            { name: 'Ping', value: `${interaction.client.ws.ping}ms`, inline: true }
          )
          .setThumbnail(bot.avatarURL());

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'ping',
      description: 'Check bot ping',
      execute: async (interaction) => {
        const ping = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🏓 Pong!')
          .setDescription(`**Latency:** ${ping}ms`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'avatar',
      description: 'Get user avatar',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`${user.username}'s Avatar`)
          .setImage(user.avatarURL({ dynamic: true, size: 1024 }));

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'banner',
      description: 'Get user banner',
      execute: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const userData = await user.fetch();
        const banner = userData.bannerURL({ dynamic: true, size: 1024 });

        if (!banner) {
          return interaction.reply('❌ This user does not have a banner.');
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`${user.username}'s Banner`)
          .setImage(banner);

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
