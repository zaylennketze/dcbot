# dcbot

A modular Discord bot scaffold with moderation, utility, economy, music, ticketing, and persistence support.

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your bot token in `.env`. Other configuration values are optional, so the bot can join and work in any server without preset channel or guild IDs.

3. Add the bot to your server using the invite link:
   <https://discord.com/api/oauth2/authorize?client_id=1535337566692180088&permissions=8&scope=bot+applications.commands>

4. Install dependencies:
   ```bash
   npm install
   ```

5. Register slash commands:
   ```bash
   npm run deploy
   ```

   Commands are registered globally, so the bot can be used in any server it joins.

5. Start the bot:
   ```bash
   npm start
   ```

6. Get the invite link for your bot:
   ```bash
   npm run invite
   ```

## Keep it running forever

This project now uses `pm2` for the default `npm start` command, so the bot can keep running after the terminal closes and will automatically restart on crashes.

If you are using Docker, continue using Docker Compose with restart support.

For the best persistence outside Docker, use:
```bash
npm start
```

To stop the bot:
```bash
npm stop
```

Persistent run options

- PM2 (recommended):
   1. Ensure `pm2` is installed globally: `npm install -g pm2`
   2. Start the bot with PM2: `npm run pm2-start`
   3. Save the PM2 process list so it restarts on reboot: `npm run pm2-save`
   4. (Optional) Setup PM2 to start on boot: `npm run pm2-setup` and follow the printed instructions.

- Systemd (server environments):
   1. Copy `dist/systemd/dcbot.service` to `/etc/systemd/system/dcbot.service` and edit `User` and `WorkingDirectory` to match your system.
   2. Reload systemd: `sudo systemctl daemon-reload`
   3. Enable and start the service: `sudo systemctl enable --now dcbot.service`

- Simple detached runner (no external tools):
   1. Make the helper executable: `chmod +x bin/run-detached.sh`
   2. Run it: `./bin/run-detached.sh`
   3. The supervisor will restart the bot on crashes. PID is written to `.bot.pid`.

## Docker

1. Create a `.env` file or set environment variables for the bot:
   ```env
   BOT_TOKEN=your-bot-token
   OWNER_IDS=your-user-id
   PREFIX=!
   MUTE_ROLE=Muted
   WELCOME_CHANNEL_ID=
   LOG_CHANNEL_ID=
   AUTOMOD_LOG_CHANNEL_ID=
   CREATE_AUTOMOD_DEFAULT_RULE=false
   TICKET_CATEGORY_ID=
   ```

   Leave channel IDs blank to let the bot operate without requiring server-specific setup.
   Set `CREATE_AUTOMOD_DEFAULT_RULE=true` if you want the bot to automatically create a default AutoMod rule when it joins new servers.


2. Build and start with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

3. Check logs:
   ```bash
   docker compose logs -f
   ```

## Features

- Slash command framework with auto reconnect and anti-crash handlers
- Moderation: kick, ban, mute, unmute, warn, purge
- Utility: ping, serverinfo, userinfo, avatar, help, announce, poll
- Economy: balance, daily, pay, gamble, leaderboard
- Music: play, skip, stop, queue, auto-reconnect
- Ticketing: open and close support tickets
- AutoMod rule management via `/automod create`, `/automod delete`, and `/automod list`
- AutoMod action logging to the configured log channel
- Welcome and goodbye messages
- File-based persistence for economy, warnings, and tickets
- Robust event logging and permission checks

## MORE FEATURES COMING SOON! THIS BOT IS IN BETA, PLEASE REPORT ANY BUGS YOU FIND!