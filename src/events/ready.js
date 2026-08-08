const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { updatePresence } = require('../utils/presence');

const scheduleStoredReminders = (client) => {
  const reminderRows = client.storage?.data?.reminders || [];
  for (const reminder of reminderRows) {
    if (!reminder.when || reminder.when <= Date.now()) continue;
    const delay = reminder.when - Date.now();
    setTimeout(async () => {
      try {
        const guild = client.guilds.cache.get(reminder.guildId);
        if (!guild) return;
        const user = await client.users.fetch(reminder.userId).catch(() => null);
        const channel = guild.systemChannel || guild.channels.cache.find((candidate) => candidate.isTextBased() && candidate.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.SendMessages));
        const message = reminder.message || 'Reminder';
        if (user) {
          await channel?.send(`⏰ Reminder for ${user}: ${message}`).catch(() => {});
        }
      } catch {}
    }, delay);
  }
};

const getLogChannel = (guild, client) => {
  const channelId = client.storage.getSetting(guild.id, 'botLogChannelId');
  if (!channelId) return null;
  return guild.channels.cache.get(channelId) || null;
};

const sendStartupEmbed = async (guild, client) => {
  const logChannel = getLogChannel(guild, client);
  if (!logChannel || !logChannel.isTextBased()) return;

  const botMember = guild.members.me;
  if (!botMember) return;

  const perms = logChannel.permissionsFor(botMember);
  if (!perms?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) return;

  const embed = new EmbedBuilder()
    .setTitle('Bot Started')
    .setDescription('The bot has started and is now online.')
    .setColor('#00B0F4')
    .setFooter({ text: `Watching ${client.guilds.cache.size} servers | /help` });

  await logChannel.send({ embeds: [embed] });
};

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    try {
      await updatePresence(client);
    } catch (error) {
      console.warn('Failed to set activity:', error);
    }

    scheduleStoredReminders(client);

    for (const guild of client.guilds.cache.values()) {
      try {
        await sendStartupEmbed(guild, client);
      } catch (error) {
        console.warn(`Failed to send startup message in guild ${guild.id}:`, error.message);
      }
    }
  }
};