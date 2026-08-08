const fs = require('fs');
const path = require('path');

const pidFiles = ['.bot-supervisor.pid', '.bot.pid'];
let killedAny = false;

for (const file of pidFiles) {
  const pidFile = path.join(__dirname, file);
  if (!fs.existsSync(pidFile)) continue;

  const pid = fs.readFileSync(pidFile, 'utf8').trim();
  if (!pid || !/^[0-9]+$/.test(pid)) {
    fs.unlinkSync(pidFile);
    continue;
  }

  try {
    process.kill(Number(pid), 0);
  } catch (error) {
    if (error.code === 'ESRCH') {
      fs.unlinkSync(pidFile);
      continue;
    }
    if (error.code === 'EPERM') {
      console.error(`PID ${pid} exists but cannot be signaled.`);
      process.exit(1);
    }
    throw error;
  }

  try {
    process.kill(Number(pid), 'SIGTERM');
    console.log(`Sent SIGTERM to PID ${pid} from ${file}`);
    killedAny = true;
  } catch (error) {
    if (error.code === 'ESRCH') {
      fs.unlinkSync(pidFile);
      continue;
    }
    throw error;
  }
}

if (!killedAny) {
  console.log('No running bot or supervisor process found.');
}

process.exit(0);
