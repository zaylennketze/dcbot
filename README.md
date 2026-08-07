# dcbot

A modular Discord bot scaffold with moderation, utility, economy, music, ticketing, and persistence support.

## Setup

1. Copy the example configuration:
   ```bash
   cp src/config.example.json src/config.json
   ```

2. Fill in your bot token, client ID, and guild ID in `src/config.json`.

3. Install dependencies:
   ```bash
   npm install
   ```

3. Register slash commands:
   ```bash
   npm run deploy
   ```

   - If `GUILD_ID` is set, commands are deployed immediately to that guild.
   - If `GUILD_ID` is not set, commands are registered globally and can be used in any server the bot joins.

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
   CLIENT_ID=your-client-id
   GUILD_ID=your-guild-id # optional for guild-specific command deployment
   OWNER_IDS=your-user-id
   MUTE_ROLE=Muted
   WELCOME_CHANNEL_ID=welcome-channel-id
   LOG_CHANNEL_ID=log-channel-id
   TICKET_CATEGORY_ID=ticket-category-id
   ```

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
- Welcome and goodbye messages
- File-based persistence for economy, warnings, and tickets
- Robust event logging and permission checks

## MORE FEATURES COMING SOON! THIS BOT IS IN BETA, PLEASE REPORT ANY BUGS YOU FIND!