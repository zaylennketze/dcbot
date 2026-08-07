const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Utility commands: ping, serverinfo, userinfo, avatar, announce, poll')
    .addSubcommand((subcommand) => subcommand.setName('ping').setDescription('Check bot latency'))
    .addSubcommand((subcommand) => subcommand.setName('serverinfo').setDescription('Get server information'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('userinfo')
        .setDescription('Get information about a user')
        .addUserOption((option) => option.setName('target').setDescription('User to query'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('avatar')
        .setDescription('Get a user avatar')
        .addUserOption((option) => option.setName('target').setDescription('User to query'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('announce')
        .setDescription('Send an announcement in a channel')
        .addChannelOption((option) => option.setName('channel').setDescription('Channel to announce in').setRequired(true))
        .addStringOption((option) => option.setName('message').setDescription('Announcement message').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('poll')
        .setDescription('Create a quick poll')
        .addStringOption((option) => option.setName('question').setDescription('Poll question').setRequired(true))
        .addStringOption((option) => option.setName('options').setDescription('Comma-separated options, max 5').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'ping': {
        const wsPing = Math.round(interaction.client.ws.ping);
        const latency = wsPing;
        const embed = new EmbedBuilder()
          .setTitle('Bot Status')
          .setDescription('Ping and server status overview')
          .setColor('#00B0F4')
          .addFields(
            { name: 'Latency', value: `${latency}ms`, inline: true },
            { name: 'API heartbeat', value: `${wsPing}ms`, inline: true },
            { name: 'Server Node', value: 'US-14e7', inline: true },
            { name: 'Host', value: 'KVM/QEMU (Standard PC (i440FX + PIIX, 1996) pc-i440fx-10.1)', inline: false },
            { name: 'OS', value: 'Ubuntu 20.04.3 LTS x86_64', inline: true },
            { name: 'Kernel', value: '6.8.0-71-generic', inline: true },
            { name: 'CPU', value: 'Intel Xeon E5-2697 v2 (48) @ 2.699GHz', inline: false },
            { name: 'GPU', value: '00:02.0 Vendor 1234 Device 1112', inline: true },
            { name: 'Memory', value: '1028GB Max', inline: true },
            { name: 'Status', value: 'Online :white_check_mark:', inline: false }
          )
          .setFooter({ text: 'Utility ping report' });

        return interaction.reply({ embeds: [embed] });
      }
      case 'serverinfo': {
        const guild = interaction.guild;
        const embed = new EmbedBuilder()
          .setTitle(`${guild.name} Info`)
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .addFields(
            { name: 'Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: 'Region', value: `${guild.preferredLocale}`, inline: true }
          )
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      case 'userinfo': {
        const member = interaction.options.getMember('target') || interaction.member;
        const embed = new EmbedBuilder()
          .setTitle(`${member.user.tag}`)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'Joined Server', value: `${member.joinedAt.toDateString()}`, inline: true },
            { name: 'Account Created', value: `${member.user.createdAt.toDateString()}`, inline: true },
            { name: 'Roles', value: `${member.roles.cache.map((role) => role.name).join(', ')}` }
          )
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      case 'avatar': {
        const user = interaction.options.getUser('target') || interaction.user;
        return interaction.reply({ content: user.displayAvatarURL({ dynamic: true, size: 1024 }) });
      }
      case 'announce': {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');
        if (!channel.isTextBased()) {
          return interaction.reply({ content: 'Please provide a text channel.', ephemeral: true });
        }
        await channel.send({ content: `📢 Announcement:
${message}` });
        return interaction.reply({ content: `Announcement sent to ${channel}.`, ephemeral: true });
      }
      case 'poll': {
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options').split(',').map((option) => option.trim()).filter(Boolean).slice(0, 5);
        const pollEmbed = new EmbedBuilder()
          .setTitle('Poll')
          .setDescription(`**${question}**\n\n${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}`)
          .setFooter({ text: 'React with the corresponding emoji to vote.' });

        const message = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        for (let i = 0; i < options.length; i += 1) {
          await message.react(emojis[i]);
        }
        return null;
      }
      default:
        return interaction.reply({ content: 'Unknown utility command.', ephemeral: true });
    }
  }
};
