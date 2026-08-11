const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'polls',
  description: 'Poll and voting commands',
  subcommands: [
    {
      name: 'create',
      description: 'Create a poll',
      execute: async (interaction) => {
        const question = interaction.options.getString('question');
        const option1 = interaction.options.getString('option1');
        const option2 = interaction.options.getString('option2');
        const option3 = interaction.options.getString('option3');
        const option4 = interaction.options.getString('option4');

        const options = [option1, option2, option3, option4].filter(o => o);

        if (options.length < 2) {
          return interaction.reply('❌ You need at least 2 options.');
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📊 Poll')
          .setDescription(question)
          .addFields(
            options.map((opt, idx) => ({ name: `Option ${idx + 1}`, value: opt, inline: true }))
          )
          .setFooter({ text: 'React to vote' });

        const buttons = [
          new ButtonBuilder().setCustomId('poll_1').setLabel(option1 ? '1️⃣' : null).setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('poll_2').setLabel(option2 ? '2️⃣' : null).setStyle(ButtonStyle.Primary),
        ];

        if (option3) buttons.push(new ButtonBuilder().setCustomId('poll_3').setLabel('3️⃣').setStyle(ButtonStyle.Primary));
        if (option4) buttons.push(new ButtonBuilder().setCustomId('poll_4').setLabel('4️⃣').setStyle(ButtonStyle.Primary));

        const row = new ActionRowBuilder().addComponents(buttons.filter(b => b.data.label));

        await interaction.reply({ embeds: [embed], components: [row] });
      }
    },
    {
      name: 'yesno',
      description: 'Create a yes/no poll',
      execute: async (interaction) => {
        const question = interaction.options.getString('question');

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('🗳️ Yes/No Poll')
          .setDescription(question);

        const yesBtn = new ButtonBuilder()
          .setCustomId('yesno_yes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Success);

        const noBtn = new ButtonBuilder()
          .setCustomId('yesno_no')
          .setLabel('No')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(yesBtn, noBtn);

        interaction.reply({ embeds: [embed], components: [row] });
      }
    }
  ]
};
