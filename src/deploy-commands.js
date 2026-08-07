const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command?.data?.toJSON) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const app = await rest.get(Routes.oauth2CurrentApplication());
    const appId = app?.id || app?.application_id;
    if (!appId) throw new Error('Unable to resolve application ID from Bot token.');

    await rest.put(Routes.applicationCommands(appId), {
      body: commands
    });
    console.log('Successfully reloaded global application commands.');
  } catch (error) {
    console.error(error);
  }
})();
