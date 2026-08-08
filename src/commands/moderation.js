const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const config = require('../config');

const getMuteRole = async (guild) => {
  const muteRoleName = config.moderation.muteRole;
  let muteRole = guild.roles.cache.find((role) => role.name === muteRoleName);
  if (!muteRole) {
    muteRole = await guild.roles.create({ name: muteRoleName, permissions: [] });
    for (const channel of guild.channels.cache.values()) {
      if (!channel.isTextBased() && !channel.isVoiceBased()) continue;
      await channel.permissionOverwrites.edit(muteRole, { SendMessages: false, AddReactions: false, Speak: false, SendVoiceMessages: false }).catch(() => {});
    }
  }
  return muteRole;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('Comprehensive moderation actions')
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
        .setName('softban')
        .setDescription('Ban and immediately unban a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to softban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for softbanning'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unban')
        .setDescription('Unban a user')
        .addUserOption((option) => option.setName('target').setDescription('User to unban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for unbanning'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('mute')
        .setDescription('Mute a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to mute').setRequired(true))
        .addStringOption((option) => option.setName('duration').setDescription('Duration such as 10m or 1h'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unmute')
        .setDescription('Unmute a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to unmute').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('timeout')
        .setDescription('Timeout a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to timeout').setRequired(true))
        .addStringOption((option) => option.setName('duration').setDescription('Duration such as 10m or 1h').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for timeout'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('removetimeout')
        .setDescription('Remove a timeout from a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to remove timeout from').setRequired(true))
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
        .setName('warnings')
        .setDescription('Show a member warning history')
        .addUserOption((option) => option.setName('target').setDescription('Member to inspect'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('clearwarnings')
        .setDescription('Clear warning history for a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to clear warnings for').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('purge')
        .setDescription('Delete recent messages in a channel')
        .addIntegerOption((option) => option.setName('amount').setDescription('Number of messages to delete').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('slowmode')
        .setDescription('Set the slowmode for the current channel')
        .addIntegerOption((option) => option.setName('seconds').setDescription('Slowmode delay in seconds').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('nick')
        .setDescription('Change a member nickname')
        .addUserOption((option) => option.setName('target').setDescription('Member to rename').setRequired(true))
        .addStringOption((option) => option.setName('nickname').setDescription('New nickname').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('addrole')
        .setDescription('Add a role to a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to update').setRequired(true))
        .addRoleOption((option) => option.setName('role').setDescription('Role to add').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('removerole')
        .setDescription('Remove a role from a member')
        .addUserOption((option) => option.setName('target').setDescription('Member to update').setRequired(true))
        .addRoleOption((option) => option.setName('role').setDescription('Role to remove').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const reason = interaction.options.getString('reason') || 'No reason provided.';
    const member = interaction.options.getMember('target');
    const targetUser = interaction.options.getUser('target');
    const targetMember = interaction.options.getMember('target');

    const requiresModerationPermission = (permission) => interaction.member.permissions.has(permission);

    switch (subcommand) {
      case 'kick':
        if (!requiresModerationPermission(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: 'You need Kick Members permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        await targetMember.kick(reason);
        return interaction.reply({ content: `✅ Kicked ${targetMember.user.tag}. Reason: ${reason}` });
      case 'ban':
        if (!requiresModerationPermission(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'You need Ban Members permission.', ephemeral: true });
        if (!targetUser) return interaction.reply({ content: 'User not found.', ephemeral: true });
        await interaction.guild.bans.create(targetUser.id, { reason });
        return interaction.reply({ content: `✅ Banned ${targetUser.tag}. Reason: ${reason}` });
      case 'softban':
        if (!requiresModerationPermission(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'You need Ban Members permission.', ephemeral: true });
        if (!targetUser) return interaction.reply({ content: 'User not found.', ephemeral: true });
        await interaction.guild.bans.create(targetUser.id, { reason });
        await interaction.guild.bans.remove(targetUser.id, reason);
        return interaction.reply({ content: `✅ Softbanned ${targetUser.tag}.` });
      case 'unban':
        if (!requiresModerationPermission(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'You need Ban Members permission.', ephemeral: true });
        if (!targetUser) return interaction.reply({ content: 'User not found.', ephemeral: true });
        await interaction.guild.bans.remove(targetUser.id, reason);
        return interaction.reply({ content: `✅ Unbanned ${targetUser.tag}.` });
      case 'mute': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'You need Moderate Members permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const duration = interaction.options.getString('duration');
        const muteRole = await getMuteRole(interaction.guild);
        await targetMember.roles.add(muteRole);
        if (duration) {
          const durationMs = ms(duration);
          if (!durationMs || durationMs < 1000) return interaction.reply({ content: 'Please provide a valid duration such as 10m or 1h.', ephemeral: true });
          setTimeout(async () => {
            try {
              await targetMember.roles.remove(muteRole).catch(() => {});
            } catch {}
          }, durationMs);
        }
        return interaction.reply({ content: `✅ Muted ${targetMember.user.tag}${duration ? ` for ${duration}` : ''}.` });
      }
      case 'unmute': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'You need Moderate Members permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const muteRole = interaction.guild.roles.cache.find((role) => role.name === config.moderation.muteRole);
        if (muteRole) await targetMember.roles.remove(muteRole).catch(() => {});
        return interaction.reply({ content: `✅ Unmuted ${targetMember.user.tag}.` });
      }
      case 'timeout': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'You need Moderate Members permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const duration = interaction.options.getString('duration');
        const durationMs = ms(duration);
        if (!durationMs || durationMs < 1000) return interaction.reply({ content: 'Please provide a valid duration such as 10m or 1h.', ephemeral: true });
        await targetMember.timeout(durationMs, reason);
        return interaction.reply({ content: `✅ Timed out ${targetMember.user.tag} for ${duration}.` });
      }
      case 'removetimeout': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'You need Moderate Members permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        await targetMember.timeout(null, 'Timeout removed');
        return interaction.reply({ content: `✅ Removed the timeout from ${targetMember.user.tag}.` });
      }
      case 'warn': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'You need Moderate Members permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const row = interaction.client.storage.find('warnings', interaction.guild.id, targetMember.id) || { count: 0, notes: '' };
        const count = row.count + 1;
        const notes = row.notes ? `${row.notes}\n${reason}` : reason;
        interaction.client.storage.upsert('warnings', interaction.guild.id, targetMember.id, { count, notes, history: [...(row.history || []), { reason, moderator: interaction.user.id, timestamp: Date.now() }] });
        return interaction.reply({ content: `⚠️ Warned ${targetMember.user.tag}. This user now has ${count} warning(s).` });
      }
      case 'warnings': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'You need Moderate Members permission.', ephemeral: true });
        const target = targetMember || interaction.member;
        const row = interaction.client.storage.find('warnings', interaction.guild.id, target.id);
        if (!row) return interaction.reply({ content: `${target.user.tag} has no warnings.`, ephemeral: true });
        const embed = new EmbedBuilder()
          .setTitle(`${target.user.tag} warnings`)
          .setDescription(row.notes || 'No notes recorded.')
          .addFields({ name: 'Total warnings', value: `${row.count || 0}`, inline: true })
          .setColor('#FFD166');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      case 'clearwarnings': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'You need Moderate Members permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        interaction.client.storage.delete('warnings', interaction.guild.id, targetMember.id);
        return interaction.reply({ content: `🧼 Cleared warnings for ${targetMember.user.tag}.` });
      }
      case 'purge': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: 'You need Manage Messages permission.', ephemeral: true });
        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
        const messages = await interaction.channel.bulkDelete(amount, true);
        return interaction.reply({ content: `🧹 Deleted ${messages.size} messages.`, ephemeral: true });
      }
      case 'slowmode': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'You need Manage Channels permission.', ephemeral: true });
        const seconds = interaction.options.getInteger('seconds');
        if (seconds < 0 || seconds > 21600) return interaction.reply({ content: 'Slowmode must be between 0 and 21600 seconds.', ephemeral: true });
        await interaction.channel.setRateLimitPerUser(seconds, 'Slowmode set by moderation command');
        return interaction.reply({ content: `⏱️ Set slowmode to ${seconds} seconds.`, ephemeral: true });
      }
      case 'nick': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply({ content: 'You need Manage Nicknames permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        await targetMember.setNickname(interaction.options.getString('nickname'));
        return interaction.reply({ content: `📝 Updated ${targetMember.user.tag}'s nickname.` });
      }
      case 'addrole': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({ content: 'You need Manage Roles permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const role = interaction.options.getRole('role');
        await targetMember.roles.add(role);
        return interaction.reply({ content: `✅ Added ${role.name} to ${targetMember.user.tag}.` });
      }
      case 'removerole': {
        if (!requiresModerationPermission(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({ content: 'You need Manage Roles permission.', ephemeral: true });
        if (!targetMember) return interaction.reply({ content: 'Member not found.', ephemeral: true });
        const role = interaction.options.getRole('role');
        await targetMember.roles.remove(role);
        return interaction.reply({ content: `✅ Removed ${role.name} from ${targetMember.user.tag}.` });
      }
      default:
        return interaction.reply({ content: 'Unknown moderation command.', ephemeral: true });
    }
  }
};
