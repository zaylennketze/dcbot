const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const loadJson = () => {
  try {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not read src/config.json:', error.message);
  }
  return {};
};

const fileConfig = loadJson();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseArray = (value, fallback) => {
  if (!value) return fallback;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const parseBoolean = (value, fallback) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return fallback;
};

module.exports = {
  token: process.env.BOT_TOKEN || fileConfig.token,
  prefix: process.env.PREFIX || fileConfig.prefix || '!',
  ownerIds: parseArray(process.env.OWNER_IDS, fileConfig.ownerIds || []),
  moderation: {
    muteRole: process.env.MUTE_ROLE || fileConfig.moderation?.muteRole || 'Muted',
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID || fileConfig.moderation?.welcomeChannelId || '',
    logChannelId: process.env.LOG_CHANNEL_ID || fileConfig.moderation?.logChannelId || '',
    automodLogChannelId: process.env.AUTOMOD_LOG_CHANNEL_ID || fileConfig.moderation?.automodLogChannelId || fileConfig.moderation?.logChannelId || '',
    createDefaultAutoModRule: parseBoolean(process.env.CREATE_AUTOMOD_DEFAULT_RULE, fileConfig.moderation?.createDefaultAutoModRule || false)
  },
  economy: {
    startingBalance: parseNumber(process.env.STARTING_BALANCE, fileConfig.economy?.startingBalance || 100),
    dailyAmount: parseNumber(process.env.DAILY_AMOUNT, fileConfig.economy?.dailyAmount || 250),
    gambleMin: parseNumber(process.env.GAMBLE_MIN, fileConfig.economy?.gambleMin || 10),
    gambleMax: parseNumber(process.env.GAMBLE_MAX, fileConfig.economy?.gambleMax || 1000)
  },
  ticket: {
    categoryId: process.env.TICKET_CATEGORY_ID || fileConfig.ticket?.categoryId || '',
    logChannelId: process.env.TICKET_LOG_CHANNEL_ID || fileConfig.ticket?.logChannelId || ''
  },
  useMessageContentIntent: parseBoolean(process.env.USE_MESSAGE_CONTENT_INTENT, fileConfig.useMessageContentIntent || false),
  useGuildMembersIntent: parseBoolean(process.env.USE_GUILD_MEMBERS_INTENT, fileConfig.useGuildMembersIntent || false)
};
