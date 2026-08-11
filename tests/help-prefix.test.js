const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const deleteModuleCache = (modulePath) => {
  delete require.cache[require.resolve(modulePath)];
};

test('default command prefix is a comma', () => {
  delete process.env.PREFIX;
  deleteModuleCache('../src/config');
  const config = require('../src/config');
  assert.equal(config.prefix, ',');
});

test('help command reply is visible to everyone', async () => {
  delete process.env.PREFIX;
  deleteModuleCache('../src/config');
  const config = require('../src/config');
  deleteModuleCache('../src/commands/help');
  const helpCommand = require('../src/commands/help');

  const interaction = {
    reply: async (payload) => payload,
    options: {}
  };

  const client = {
    commands: new Map([
      ['help', helpCommand],
      ['ping', { data: { name: 'ping', description: 'Ping the bot.' } }]
    ])
  };

  const payload = await helpCommand.execute(interaction, client);

  assert.equal(config.prefix, ',');
  assert.equal(payload.ephemeral, undefined);
  assert.ok(Array.isArray(payload.embeds));
});
