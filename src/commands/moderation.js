const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('Moderation actions: kick, ban, mute, unmute, warn, purge')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption((option) => option.setName('target').setDescription('Member to kick').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for kicking'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption((option) => option.setName('target').setDescription('Member to ban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for banning'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('mute')
        .setDescription('Mute a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to mute').setRequired(true))
        .addIntegerOption((option) => option.setName('duration').setDescription('Minutes to mute (optional)'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unmute')
        .setDescription('Unmute a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to unmute').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('warn')
        .setDescription('Warn a member and store a note')
        .addUserOption((option) => option.setName('target').setDescription('Member to warn').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Warning note').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('purge')
        .setDescription('Delete recent messages in a channel')
        .addIntegerOption((option) => option.setName('amount').setDescription('Number of messages to delete').setRequired(true))
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'You do not have permissions to use moderation commands.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    switch (subcommand) {
      case 'kick':
        if (!target) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        await target.kick(reason);
        return interaction.reply({ content: `✅ Kicked ${target.user.tag}. Reason: ${reason}` });
      case 'ban':
        if (!target) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        await interaction.guild.bans.create(target.id, { reason });
        return interaction.reply({ content: `✅ Banned ${target.user.tag}. Reason: ${reason}` });
      case 'mute': {
        if (!target) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const muteRoleName = require('../config').moderation.muteRole;
        let muteRole = interaction.guild.roles.cache.find((role) => role.name === muteRoleName);
        if (!muteRole) {
          muteRole = await interaction.guild.roles.create({ name: muteRoleName, permissions: [] });
          await interaction.guild.channels.cache.forEach(async (channel) => {
            await channel.permissionOverwrites.edit(muteRole, { SendMessages: false, AddReactions: false, Speak: false });
          });
        }
        await target.roles.add(muteRole);
        return interaction.reply({ content: `✅ Muted ${target.user.tag}.` });
      }
      case 'unmute': {
        if (!target) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const muteRoleName = require('../config').moderation.muteRole;
        const muteRole = interaction.guild.roles.cache.find((role) => role.name === muteRoleName);
        if (muteRole) await target.roles.remove(muteRole);
        return interaction.reply({ content: `✅ Unmuted ${target.user.tag}.` });
      }
      case 'warn': {
        if (!target) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const row = interaction.client.storage.find('warnings', interaction.guild.id, target.id) || { count: 0, notes: '' };
        const count = row.count + 1;
        const notes = row.notes ? `${row.notes}\n${reason}` : reason;
        interaction.client.storage.upsert('warnings', interaction.guild.id, target.id, { count, notes });
        return interaction.reply({ content: `⚠️ Warned ${target.user.tag}. This user now has ${count} warning(s).` });
      }
      case 'purge': {
        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) {
          return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
        }
        const messages = await interaction.channel.bulkDelete(amount, true);
        return interaction.reply({ content: `🧹 Deleted ${messages.size} messages.`, ephemeral: true });
      }
      default:
        return interaction.reply({ content: 'Unknown moderation command.', ephemeral: true });
    }
  }
};
