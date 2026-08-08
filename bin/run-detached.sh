#!/usr/bin/env bash
# Run the supervisor in background using nohup and save PID to .bot.pid
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"
nohup node start-supervisor.js >/dev/null 2>&1 &
echo $! > .bot.pid
echo "Started dcbot (supervisor) with PID $(cat .bot.pid)"
