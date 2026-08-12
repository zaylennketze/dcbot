const fs = require('fs');
const path = require('path');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config');

const inferOptionTypesFromFunction = (fn) => {
  const text = fn?.toString() || '';
  const optionTypes = new Map();
  const patterns = [
    { type: 'string', regex: /\.options\.getString\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'integer', regex: /\.options\.getInteger\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'number', regex: /\.options\.getNumber\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'boolean', regex: /\.options\.getBoolean\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'user', regex: /\.options\.getUser\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'member', regex: /\.options\.getMember\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'role', regex: /\.options\.getRole\(\s*['"`](.+?)['"`]\s*\)/g },
    { type: 'channel', regex: /\.options\.getChannel\(\s*['"`](.+?)['"`]\s*\)/g }
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(text))) {
      if (!optionTypes.has(match[1])) optionTypes.set(match[1], pattern.type);
    }
  }

  return optionTypes;
};

const addOptionToBuilder = (builder, name, type) => {
  const description = `Option: ${name}`;
  switch (type) {
    case 'integer':
      return builder.addIntegerOption((option) => option.setName(name).setDescription(description));
    case 'number':
      return builder.addNumberOption((option) => option.setName(name).setDescription(description));
    case 'boolean':
      return builder.addBooleanOption((option) => option.setName(name).setDescription(description));
    case 'user':
    case 'member':
      return builder.addUserOption((option) => option.setName(name).setDescription(description));
    case 'role':
      return builder.addRoleOption((option) => option.setName(name).setDescription(description));
    case 'channel':
      return builder.addChannelOption((option) => option.setName(name).setDescription(description));
    default:
      return builder.addStringOption((option) => option.setName(name).setDescription(description));
  }
};

const buildCommandData = (command) => {
  if (command?.data?.toJSON) return command.data;
  if (!command?.name) return null;

  const builder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description || 'No description available.');

  if (Array.isArray(command.subcommands)) {
    for (const subcommand of command.subcommands) {
      builder.addSubcommand((sub) => {
        sub.setName(subcommand.name).setDescription(subcommand.description || 'No description.');
        const optionTypes = inferOptionTypesFromFunction(subcommand.execute);
        for (const [optionName, optionType] of optionTypes) {
          addOptionToBuilder(sub, optionName, optionType);
        }
        return sub;
      });
    }
  } else if (typeof command.execute === 'function') {
    const optionTypes = inferOptionTypesFromFunction(command.execute);
    for (const [optionName, optionType] of optionTypes) {
      addOptionToBuilder(builder, optionName, optionType);
    }
  }

  return builder;
};

const loadCommandData = () => {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  const commandData = [];

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    const data = buildCommandData(command);
    if (data?.toJSON) {
      commandData.push(data.toJSON());
    }
  }

  return commandData;
};

const deployCommands = async () => {
  const commands = loadCommandData();
  const rest = new REST({ version: '10' }).setToken(config.token);

  console.log(`Started refreshing ${commands.length} application (/) commands.`);
  const app = await rest.get(Routes.oauth2CurrentApplication());
  const appId = app?.id || app?.application_id;
  if (!appId) throw new Error('Unable to resolve application ID from Bot token.');

  await rest.put(Routes.applicationCommands(appId), { body: commands });
  console.log('Successfully reloaded global application commands.');
};

if (require.main === module) {
  deployCommands().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { deployCommands };
