const config = require('../config.json');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
      return message.reply(`🏓 Pong! Latency is ${Date.now() - message.createdTimestamp}ms. API heartbeat ${Math.round(client.ws.ping)}ms.`);
    }

    if (command === 'help') {
      const helpText = [...client.commands.values()]
        .map((cmd) => `**/${cmd.data.name}** — ${cmd.data.description}`)
        .join('\n');
      return message.reply({ content: `Commands:\n${helpText}` });
    }
  }
};
