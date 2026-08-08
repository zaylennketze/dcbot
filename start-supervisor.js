const { spawn } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'src', 'index.js');
const nodeArgs = process.argv.slice(2);
const restartDelayMs = 5000;
let childProcess = null;
let stopping = false;

const startBot = () => {
  childProcess = spawn(process.execPath, [script, ...nodeArgs], {
    stdio: 'inherit',
    env: process.env
  });

  childProcess.on('exit', (code, signal) => {
    childProcess = null;

    if (stopping) {
      process.exit(code === null ? 0 : code);
      return;
    }

    if (code === 0) {
      process.exit(0);
      return;
    }

    console.error(`Bot process exited unexpectedly with code=${code} signal=${signal}. Restarting in ${restartDelayMs / 1000}s...`);
    setTimeout(startBot, restartDelayMs);
  });
};

const shutdown = (signal) => {
  if (stopping) return;
  stopping = true;
  console.log(`Received ${signal}; stopping bot and exiting.`);
  if (childProcess) {
    childProcess.kill('SIGTERM');
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGHUP', () => shutdown('SIGHUP'));

startBot();
