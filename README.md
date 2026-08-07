# dcbot

A modular Discord bot scaffold with moderation, utility, economy, music, ticketing, and persistence support.

## Setup

1. Copy the example configuration:
   ```bash
   cp src/config.example.json src/config.json
   ```

2. Fill in your bot token in `src/config.json` or set `BOT_TOKEN` in `.env`. Other configuration values are optional, so the bot can join and work in any server without preset channel or guild IDs.

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

## Keep it running forever

This project includes built-in process recovery handlers. For a truly persistent deployment, use a process manager such as `pm2`, Docker, or a cloud host with auto-restart enabled to keep the bot online.

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
   TICKET_CATEGORY_ID=
   ```

   Leave channel IDs blank to let the bot operate without requiring server-specific setup.


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