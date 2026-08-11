const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'moderation_advanced',
  description: 'Advanced moderation commands',
  subcommands: [
    {
      name: 'voicemute',
      description: 'Mute user in voice channel',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
          return interaction.reply({ content: '❌ You need Mute Members permission.', ephemeral: true });
        }

        const member = interaction.options.getMember('user');
        
        if (!member.voice.channel) {
          return interaction.reply('❌ User is not in a voice channel.');
        }

        await member.voice.setMute(true);

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✅ User Voice Muted')
          .setDescription(`${member} has been muted in voice.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'voiceunmute',
      description: 'Unmute user in voice channel',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
          return interaction.reply({ content: '❌ You need Mute Members permission.', ephemeral: true });
        }

        const member = interaction.options.getMember('user');
        
        if (!member.voice.channel) {
          return interaction.reply('❌ User is not in a voice channel.');
        }

        await member.voice.setMute(false);

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ User Voice Unmuted')
          .setDescription(`${member} has been unmuted in voice.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'deafen',
      description: 'Deafen user in voice channel',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.DeafenMembers)) {
          return interaction.reply({ content: '❌ You need Deafen Members permission.', ephemeral: true });
        }

        const member = interaction.options.getMember('user');
        
        if (!member.voice.channel) {
          return interaction.reply('❌ User is not in a voice channel.');
        }

        await member.voice.setDeaf(true);

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✅ User Deafened')
          .setDescription(`${member} has been deafened.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'undeafen',
      description: 'Undeafen user in voice channel',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.DeafenMembers)) {
          return interaction.reply({ content: '❌ You need Deafen Members permission.', ephemeral: true });
        }

        const member = interaction.options.getMember('user');
        
        if (!member.voice.channel) {
          return interaction.reply('❌ User is not in a voice channel.');
        }

        await member.voice.setDeaf(false);

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ User Undeafened')
          .setDescription(`${member} has been undeafened.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'voicekick',
      description: 'Kick user from voice channel',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
          return interaction.reply({ content: '❌ You need Move Members permission.', ephemeral: true });
        }

        const member = interaction.options.getMember('user');
        
        if (!member.voice.channel) {
          return interaction.reply('❌ User is not in a voice channel.');
        }

        await member.voice.disconnect();

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✅ User Disconnected')
          .setDescription(`${member} has been disconnected from voice.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'voicemove',
      description: 'Move user to another voice channel',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
          return interaction.reply({ content: '❌ You need Move Members permission.', ephemeral: true });
        }

        const member = interaction.options.getMember('user');
        const channel = interaction.options.getChannel('channel');

        if (!channel.isVoiceBased()) {
          return interaction.reply('❌ Target must be a voice channel.');
        }

        if (!member.voice.channel) {
          return interaction.reply('❌ User is not in a voice channel.');
        }

        await member.voice.setChannel(channel);

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('✅ User Moved')
          .setDescription(`${member} has been moved to ${channel}`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'lockall',
      description: 'Lock all channels in the server',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
          return interaction.reply({ content: '❌ You need Manage Channels permission.', ephemeral: true });
        }

        const channels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());
        let locked = 0;

        for (const channel of channels.values()) {
          try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
              SendMessages: false
            });
            locked++;
          } catch (error) {
            console.error(`Failed to lock ${channel.name}:`, error);
          }
        }

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🔒 Server Locked')
          .setDescription(`${locked} channels have been locked.`);

        interaction.reply({ embeds: [embed] });
      }
    },
    {
      name: 'unlockall',
      description: 'Unlock all channels in the server',
      execute: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
          return interaction.reply({ content: '❌ You need Manage Channels permission.', ephemeral: true });
        }

        const channels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());
        let unlocked = 0;

        for (const channel of channels.values()) {
          try {
            await channel.permissionOverwrites.delete(interaction.guild.roles.everyone);
            unlocked++;
          } catch (error) {
            console.error(`Failed to unlock ${channel.name}:`, error);
          }
        }

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🔓 Server Unlocked')
          .setDescription(`${unlocked} channels have been unlocked.`);

        interaction.reply({ embeds: [embed] });
      }
    }
  ]
};
