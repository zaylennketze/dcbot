const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Storage = require('../src/storage');

test('storage creates and deletes table rows for new tables', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dcbot-storage-'));
  const filePath = path.join(tempDir, 'storage.json');
  const storage = new Storage(filePath);

  const created = storage.upsert('reminders', 'guild-1', 'user-1', { message: 'hello', when: 123 });
  assert.equal(created.message, 'hello');
  assert.ok(Array.isArray(storage.data.reminders));

  const deleted = storage.delete('reminders', 'guild-1', 'user-1');
  assert.equal(deleted, true);
  assert.equal(storage.find('reminders', 'guild-1', 'user-1'), undefined);
});
