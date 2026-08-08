const fs = require('fs');
const path = require('path');

class Storage {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.data = { economy: [], warnings: [], tickets: [], settings: {} };

    if (fs.existsSync(filePath)) {
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        this.data = Object.assign(this.data, JSON.parse(fileData));
      } catch (error) {
        console.warn('Failed to parse storage file; using fresh storage.', error);
      }
    }

    this.save();
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  find(table, guildId, userId) {
    if (!this.data[table]) this.data[table] = [];
    return this.data[table].find((row) => row.guildId === guildId && row.userId === userId);
  }

  getSetting(guildId, key) {
    return this.data.settings?.[guildId]?.[key] ?? null;
  }

  setSetting(guildId, key, value) {
    if (!this.data.settings[guildId]) {
      this.data.settings[guildId] = {};
    }
    this.data.settings[guildId][key] = value;
    this.save();
    return this.data.settings[guildId];
  }

  upsert(table, guildId, userId, values) {
    const existing = this.find(table, guildId, userId);
    if (existing) {
      Object.assign(existing, values);
    } else {
      this.data[table].push(Object.assign({ guildId, userId }, values));
    }
    this.save();
    return this.find(table, guildId, userId);
  }

  delete(table, guildId, userId) {
    const initialLength = this.data[table].length;
    this.data[table] = this.data[table].filter((row) => !(row.guildId === guildId && row.userId === userId));
    if (this.data[table].length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  getAll(table, guildId) {
    return this.data[table].filter((row) => row.guildId === guildId);
  }

  getAllByGuild(table, guildId) {
    return this.getAll(table, guildId);
  }
}

module.exports = Storage;
