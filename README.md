
# Clamor-Chatbot Discord Relay for BDS eXtended

A simple chat relay plugin for a [BDSX](https://github.com/bdsx/bdsx)-enabled [Bedrock Dedicated Server](https://minecraft.fandom.com/wiki/Bedrock_Dedicated_Server).

Custom join/leave and startup/shutdown messages are configurable, along with custom server message prefix.

Code used from [TheShadowEevee/BDSX-Chatter-Plugin](https://github.com/TheShadowEevee/BDSX-Discord-Chatter-Plugin) and [7dev7urandom/bdsx-discord-chat](https://github.com/7dev7urandom/bdsx-discord-chat).

## Installation

Download the latest [Release](https://github.com/bmar116/Clamor-Chatbot/releases) and extract into the `bdsx/plugins` directory.

## Setup

- Install the plugin
- Create a new Discord Bot (<https://www.howtogeek.com/364225/how-to-make-your-own-discord-bot/>)
	- IMPORTANT: Copy and keep your bot token before closing the Discord App Developers webpage. This will be used later in the plugin config file.
	- Make sure to generate an OAuth2 URL to invite your bot to your server, and make sure it has Send Messages permission.
- Start the server
- On first run, a default configuration file will be create in the `bdsx/plugin-configs/clamor-chatbot` directory, and the bot will be disabled.
- Stop the server and open the `config.json` file in your editor of choice.
	- Paste your bot token into the `token` variable.
	- Enable Developer Mode on Discord (Settings > App Settings > Advanced).
	- Right-click the channel you want your bot to inhabit and click Copy ID. Paste the ID in the `channel` variable in the config file. Make sure your bot has permissions in the channel.
	- Set `botEnable` to `true` in the config file.
- Start the server and your bot should be functioning.

## Configuration

| Token | Type | Description | Default |
| ---- | ---- | ---- |
| botEnable | boolean | Enables bot on startup | `false` |
| token | string | Your bot token | `null` |
| channel | string | Channel ID for chat messages | `null` |
| discordActivityType | string | Discord activity type; Case-insensitive | `playing` |
|   |   | From possible list of: PLAYING, STREAMING, LISTENING, WATCHING, or COMPETING |   |
| discordActivityName | string | Name of Discord activity application | `Minecraft` |
| enableChatRelay | boolean | Enables game <---> discord chat relay | `true` |
| postDiscordToConsole | boolean | Posts Discord messages to console | `true` |
| toGameChatPrefix | object | Prefix to use when sending messages to game. Supports Minecraft [formatting codes](https://minecraft.fandom.com/wiki/Formatting_codes)  |   |
| - start | string |   | `"<"` |
| - serverName | string |   | `"§b[Discord]§r"` |
| - end | string |   | `">"` |
| toDiscordChatPrefix | object | Prefix surrounding username when relaying messages from game ---> discord. Supports [Discord formatting](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-) |   |
| - start | string |   | `"***<"` |
| - end | string |   | `">***:"` |
| enableStartStopMessages | boolean | Enables server start/stop messages | `true` |
| discordStartMessage | string | Message to send to Discord when server starts | `"***Server has started!***"` |
| discordStopMessage | string | Message to send to Discord when server stops | `"***Server has stopped!***"` |
| enableJoinMessages | boolean | Enables player join/leave messages | `true` |
| discordJoinMessage | object | Message to surround username when player joins. Supports Discord formatting |   |
| - start | string |   | `"***<"` |
| - end | string |   | `"> has joined the server!***"` |
| discordLeftMessage | object | Message to surround username when player leaves. Supports Discord formatting |   |
| - start | string |   | `"***<"` |
| - end | string |   | `"> has left the server!***"` |
| enableDiscordList | boolean | Enables Discord !list command. See note below. | `false` |

## Note about discord.js

The version of BDSX that this plugin was developed on uses a modified version of ChakraCore for Node ([bdsx/node-chakracore](https://github.com/bdsx/node-chakracore)). This version is built on top of v1.2.0.0-pre of NodeJS and does not support discord.js v.12.0.0 or higher.

Version 12 of discord.js introduces Intents which are neccessary to read messages in the latest versions of the Discord API. As such, Discord-to-Minecraft chat relay and Discord commands have been permanently disabled until BDSX updates to a newer version of Node.