const fs = require('fs');
const path = require('path');

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

module.exports = {
  token: process.env.BOT_TOKEN || fileConfig.token,
  clientId: process.env.CLIENT_ID || fileConfig.clientId,
  guildId: process.env.GUILD_ID || fileConfig.guildId,
  prefix: process.env.PREFIX || fileConfig.prefix || '!',
  ownerIds: parseArray(process.env.OWNER_IDS, fileConfig.ownerIds || []),
  moderation: {
    muteRole: process.env.MUTE_ROLE || fileConfig.moderation?.muteRole || 'Muted',
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID || fileConfig.moderation?.welcomeChannelId || '',
    logChannelId: process.env.LOG_CHANNEL_ID || fileConfig.moderation?.logChannelId || ''
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
  }
};
