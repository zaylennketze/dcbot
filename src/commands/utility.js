const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Utility, fun, and reminder commands')
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
        .setDescription('Send an announcement to announcement-style channels')
        .addStringOption((option) => option.setName('message').setDescription('Announcement message').setRequired(true))
        .addChannelOption((option) => option.setName('channel').setDescription('Optional channel to announce in'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('poll')
        .setDescription('Create a quick poll')
        .addStringOption((option) => option.setName('question').setDescription('Poll question').setRequired(true))
        .addStringOption((option) => option.setName('options').setDescription('Comma-separated options, max 5').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remindme')
        .setDescription('Schedule a reminder')
        .addStringOption((option) => option.setName('message').setDescription('Reminder text').setRequired(true))
        .addStringOption((option) => option.setName('when').setDescription('When to remind you, e.g. 10m or 2h').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('coinflip')
        .setDescription('Flip a coin')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('roll')
        .setDescription('Roll a die')
        .addIntegerOption((option) => option.setName('sides').setDescription('Number of sides').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption((option) => option.setName('question').setDescription('Question to ask').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'ping': {
        const wsPing = Math.round(interaction.client.ws.ping);
        const embed = new EmbedBuilder()
          .setTitle('Bot Status')
          .setDescription('Ping and host server status overview')
          .setColor('#00B0F4')
          .addFields(
            { name: 'Latency', value: `${wsPing}ms`, inline: true },
            { name: 'API heartbeat', value: `${wsPing}ms`, inline: true },
            { name: 'Status', value: 'Online ✅', inline: false }
          );

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
        const announcementKeywords = ['news', 'announce', 'announcement', 'announcements', 'updates', 'broadcast', 'bulletin', 'bulletins'];

        const sendToChannel = async (targetChannel) => {
          if (!targetChannel?.isTextBased()) return false;
          await targetChannel.send({ content: `📢 Announcement:\n${message}` });
          return true;
        };

        if (channel) {
          if (!channel.isTextBased()) return interaction.reply({ content: 'Please provide a text-based channel.', ephemeral: true });
          await sendToChannel(channel);
          return interaction.reply({ content: `Announcement sent to ${channel}.`, ephemeral: true });
        }

        const announcementChannels = interaction.guild.channels.cache.filter((targetChannel) => {
          if (!targetChannel.isTextBased()) return false;
          const name = targetChannel.name?.toLowerCase() || '';
          return announcementKeywords.some((keyword) => name.includes(keyword));
        });

        if (!announcementChannels.size) {
          return interaction.reply({ content: 'No announcement-style channel found in this server. Please specify a channel or create one with a name like news or announcements.', ephemeral: true });
        }

        const sentChannels = [];
        for (const targetChannel of announcementChannels.values()) {
          try {
            await sendToChannel(targetChannel);
            sentChannels.push(`<#${targetChannel.id}>`);
          } catch {}
        }

        if (!sentChannels.length) return interaction.reply({ content: 'I found announcement-style channels, but could not send to any of them. Check my channel permissions.', ephemeral: true });

        return interaction.reply({ content: `Announcement sent to ${sentChannels.join(', ')}.`, ephemeral: true });
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
      case 'remindme': {
        const message = interaction.options.getString('message');
        const when = interaction.options.getString('when');
        const durationMs = ms(when);
        if (!durationMs || durationMs < 1000) return interaction.reply({ content: 'Please provide a valid duration such as 10m or 2h.', ephemeral: true });
        const reminder = { guildId: interaction.guild.id, userId: interaction.user.id, message, when: Date.now() + durationMs };
        interaction.client.storage.upsert('reminders', interaction.guild.id, interaction.user.id, reminder);
        return interaction.reply({ content: `⏰ Reminder set for ${when}.` });
      }
      case 'coinflip': {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        return interaction.reply({ content: `🪙 ${result}!` });
      }
      case 'roll': {
        const sides = interaction.options.getInteger('sides') || 6;
        const value = Math.floor(Math.random() * sides) + 1;
        return interaction.reply({ content: `🎲 Rolled a ${sides}-sided die: ${value}` });
      }
      case '8ball': {
        const responses = ['Yes', 'No', 'Definitely', 'Ask again later', 'Outlook seems good', 'Cannot predict now'];
        const answer = responses[Math.floor(Math.random() * responses.length)];
        return interaction.reply({ content: `🎱 ${answer}` });
      }
      default:
        return interaction.reply({ content: 'Unknown utility command.', ephemeral: true });
    }
  }
};
