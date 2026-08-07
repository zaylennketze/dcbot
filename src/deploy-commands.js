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

    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
        body: commands
      });
      console.log(`Successfully reloaded guild commands for guild ${config.guildId}.`);
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), {
        body: commands
      });
      console.log('Successfully reloaded global application commands.');
    }
  } catch (error) {
    console.error(error);
  }
})();
