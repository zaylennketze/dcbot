const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'src', 'index.js');
const supervisorPidFile = path.join(__dirname, '.bot-supervisor.pid');
const botPidFile = path.join(__dirname, '.bot.pid');
const nodeArgs = process.argv.slice(2);
const restartDelayMs = 5000;
let childProcess = null;
let stopping = false;

const writePidFile = (filePath, pid) => {
  fs.writeFileSync(filePath, String(pid), 'utf8');
};

const removePidFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore cleanup errors
  }
};

const startBot = () => {
  childProcess = spawn(process.execPath, [script, ...nodeArgs], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    env: { ...process.env, SUPERVISOR_CHILD: '1' }
  });
  childProcess.unref();
  writePidFile(botPidFile, childProcess.pid);

  childProcess.on('exit', (code, signal) => {
    childProcess = null;

    if (stopping) {
      removePidFile(botPidFile);
      removePidFile(supervisorPidFile);
      process.exit(code === null ? 0 : code);
      return;
    }

    if (code === 0) {
      removePidFile(botPidFile);
      removePidFile(supervisorPidFile);
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
  if (childProcess && childProcess.exitCode === null) {
    try {
      process.kill(childProcess.pid, 'SIGTERM');
    } catch {
      // ignore if already exited
    }
  }
  removePidFile(botPidFile);
  removePidFile(supervisorPidFile);
  process.exit(0);
};

if (!process.env.SUPERVISOR_CHILD) {
  const detachedSupervisor = spawn(process.execPath, [__filename], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    env: { ...process.env, SUPERVISOR_CHILD: '1' }
  });
  detachedSupervisor.unref();
  writePidFile(supervisorPidFile, detachedSupervisor.pid);
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGHUP', () => shutdown('SIGHUP'));

writePidFile(supervisorPidFile, process.pid);
startBot();
