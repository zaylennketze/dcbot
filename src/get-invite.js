const { REST, Routes } = require('discord.js');
const config = require('./config');

if (!config.token || config.token.includes('YOUR_BOT_TOKEN')) {
  console.error('Bot token is not configured. Set BOT_TOKEN in .env or src/config.json first.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    const app = await rest.get(Routes.oauth2CurrentApplication());
    const clientId = app?.id || app?.application_id;
    if (!clientId) {
      throw new Error('Unable to resolve application ID from bot token.');
    }

    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
    console.log('Invite the bot to your server with this link:');
    console.log(inviteUrl);
  } catch (error) {
    console.error('Failed to generate invite URL:', error?.message || error);
    process.exit(1);
  }
})();
