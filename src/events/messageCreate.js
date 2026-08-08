const config = require('../config');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild || typeof message.content !== 'string') return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
      const { EmbedBuilder } = require('discord.js');
      const wsPing = Math.round(client.ws.ping);
      const embed = new EmbedBuilder()
        .setTitle('Bot Status')
        .setDescription('Ping and host server status overview')
        .setColor('#00B0F4')
        .addFields(
          { name: 'Latency', value: `${Date.now() - message.createdTimestamp}ms`, inline: true },
          { name: 'API heartbeat', value: `${wsPing}ms`, inline: true },
          { name: 'Server Node', value: 'US-14e7', inline: true },
          { name: 'Host', value: 'KVM/QEMU (Standard PC (i440FX + PIIX, 1996) pc-i440fx-10.1)', inline: false },
          { name: 'OS', value: 'Ubuntu 20.04.3 LTS x86_64', inline: true },
          { name: 'Kernel', value: '6.8.0-71-generic', inline: true },
          { name: 'CPU', value: 'Intel Xeon E5-2697 v2 (48) @ 2.699GHz', inline: false },
          { name: 'GPU', value: '00:02.0 Vendor 1234 Device 1112', inline: true },
          { name: 'Memory', value: '1028GB Max', inline: true },
          { name: 'Status', value: 'Online :white_check_mark:', inline: false }
        )
        .setFooter({ text: 'Utility ping report' });
      return message.reply({ embeds: [embed] });
    }

    if (command === 'help') {
      const helpText = [...client.commands.values()]
        .map((cmd) => `**/${cmd.data.name}** — ${cmd.data.description}`)
        .join('\n');
      return message.reply({ content: `Commands:\n${helpText}` });
    }
  }
};
