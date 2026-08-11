const config = require('../config');
const { EmbedBuilder } = require('discord.js');

const parseArgs = (input) => {
  const regex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`|(\S+)/g;
  const args = [];
  let match;
  while ((match = regex.exec(input))) {
    args.push(match[1] ?? match[2] ?? match[3] ?? match[4]);
  }
  return args;
};

const parseBoolean = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'on'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'off'].includes(normalized)) return false;
  return null;
};

const parseUser = (token, guild) => {
  if (!token || !guild) return null;
  const mention = token.match(/^<@!?(\d+)>$/);
  if (mention) return guild.members.cache.get(mention[1])?.user || null;
  if (/^\d+$/.test(token)) return guild.members.cache.get(token)?.user || null;
  return guild.members.cache.find((member) => {
    const username = member.user.username.toLowerCase();
    const tag = member.user.tag.toLowerCase();
    return username === token.toLowerCase() || tag === token.toLowerCase();
  })?.user || null;
};

const parseMember = (token, guild) => {
  if (!token || !guild) return null;
  const mention = token.match(/^<@!?(\d+)>$/);
  if (mention) return guild.members.cache.get(mention[1]) || null;
  if (/^\d+$/.test(token)) return guild.members.cache.get(token) || null;
  return guild.members.cache.find((member) => {
    const username = member.user.username.toLowerCase();
    const tag = member.user.tag.toLowerCase();
    return username === token.toLowerCase() || tag === token.toLowerCase();
  }) || null;
};

const parseChannel = (token, guild) => {
  if (!token || !guild) return null;
  const mention = token.match(/^<#(\d+)>$/);
  if (mention) return guild.channels.cache.get(mention[1]) || null;
  return guild.channels.cache.find((channel) => channel.name.toLowerCase() === token.toLowerCase()) || null;
};

const parseRole = (token, guild) => {
  if (!token || !guild) return null;
  const mention = token.match(/^<@&(\d+)>$/);
  if (mention) return guild.roles.cache.get(mention[1]) || null;
  return guild.roles.cache.find((role) => role.name.toLowerCase() === token.toLowerCase()) || null;
};

const buildOptions = (args, subcommand, message) => {
  const tokens = [...args];
  const consume = () => tokens.shift() || null;
  const remaining = () => tokens.join(' ');

  return {
    getSubcommand: () => subcommand || null,
    getString: (name) => {
      const lower = String(name || '').toLowerCase();
      if (['message', 'text', 'question', 'query', 'description', 'bio', 'suggestion', 'reason', 'timezone', 'city', 'word', 'role', 'name', 'url', 'option1', 'option2', 'option3', 'option4'].includes(lower)) {
        return remaining() || consume();
      }
      return consume();
    },
    getInteger: () => {
      const raw = consume();
      const parsed = parseInt(raw, 10);
      return Number.isNaN(parsed) ? null : parsed;
    },
    getBoolean: (name) => parseBoolean(consume()),
    getUser: (name) => parseUser(consume(), message?.guild || null),
    getMember: (name) => parseMember(consume(), message?.guild || null),
    getChannel: (name) => parseChannel(consume(), message?.guild || null),
    getRole: (name) => parseRole(consume(), message?.guild || null)
  };
};

const createFakeInteraction = (message, client, command, commandArgs, subcommandName) => ({
  guild: message.guild,
  user: message.author,
  member: message.member,
  client,
  channel: message.channel,
  createdTimestamp: message.createdTimestamp,
  reply: async (response) => {
    if (typeof response === 'string') return message.reply(response);
    return message.reply(response);
  },
  options: buildOptions(commandArgs, subcommandName, message)
});

const formatCommandLines = (client) => {
  return [...client.commands.values()].map((cmd) => {
    const name = cmd.data?.name || cmd.name || 'unknown';
    const description = cmd.data?.description || cmd.description || 'No description available.';
    const subcommandLines = [];

    if (Array.isArray(cmd.subcommands)) {
      for (const sub of cmd.subcommands) {
        subcommandLines.push(`• ${sub.name} — ${sub.description}`);
      }
    } else if (cmd.data?.options) {
      for (const option of cmd.data.options) {
        if (option.type === 1) {
          subcommandLines.push(`• ${option.name} — ${option.description || 'No description.'}`);
        }
      }
    }

    return `**${config.prefix}${name}** — ${description}${subcommandLines.length ? `\n${subcommandLines.join('\n')}` : ''}`;
  });
};

const chunkFields = (lines) => {
  const fields = [];
  let currentValue = '';

  for (const line of lines) {
    if (currentValue.length + line.length + 1 > 1024) {
      fields.push({ name: '\u200b', value: currentValue || 'No commands available.' });
      currentValue = line + '\n';
      continue;
    }
    currentValue += `${line}\n`;
  }

  if (currentValue) {
    fields.push({ name: '\u200b', value: currentValue });
  }

  return fields;
};

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild || typeof message.content !== 'string') return;
    if (!message.content.startsWith(config.prefix)) return;

    const raw = message.content.slice(config.prefix.length).trim();
    const args = parseArgs(raw);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    if (commandName === 'help') {
      const lines = formatCommandLines(client);
      const fields = chunkFields(lines);
      const embeds = [];

      for (let i = 0; i < fields.length; i += 24) {
        embeds.push(
          new EmbedBuilder()
            .setTitle('Bot Command Help')
            .setDescription(`Use the prefix \`${config.prefix}\` to run commands.`)
            .setColor('Blue')
            .addFields(fields.slice(i, i + 24))
        );
      }

      for (const embed of embeds) {
        // eslint-disable-next-line no-await-in-loop
        await message.reply({ embeds: [embed] });
      }
      return;
    }

    const command = client.commands.get(commandName);
    if (!command) return;

    const subcommandName = args[0]?.toLowerCase();
    const fakeInteraction = createFakeInteraction(message, client, command, args, subcommandName);

    if (Array.isArray(command.subcommands) && typeof command.execute !== 'function') {
      const subcommand = command.subcommands.find((sub) => sub.name === subcommandName);
      if (!subcommand) {
        return message.reply({ content: `Unknown subcommand for ${config.prefix}${commandName}. Available: ${command.subcommands.map((sub) => sub.name).join(', ')}` });
      }
      args.shift();
      fakeInteraction.options = buildOptions(args, subcommand.name);
      return subcommand.execute(fakeInteraction, client);
    }

    try {
      return command.execute(fakeInteraction, client);
    } catch (error) {
      console.error(`Error executing prefix command ${commandName}:`, error);
      return message.reply({ content: 'There was an error executing that command.' });
    }
  }
};
