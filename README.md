
# Clamor-Chatbot Discord Relay for BDSX

A simple chat relay plugin for a [BDSX enabled server][https://github.com/bdsx/bdsx].

Custom join/leave and startup/shutdown messages are configurable. Chat messages are relayed game <---> discord.

Based on/forked from [TheShadowEevee/BDSX-Chatter-Plugin][https://github.com/TheShadowEevee/BDSX-Discord-Chatter-Plugin] and [7dev7urandom/bdsx-discord-chat][https://github.com/7dev7urandom/bdsx-discord-chat].

## Installation

Download the latest [Release][https://github.com/bmar116/Clamor-Chatbot/releases] and unzip into the `bdsx/plugins/` folder.

## Setup

- Install the plugin
- Create a new Discord Bot (<https://www.howtogeek.com/364225/how-to-make-your-own-discord-bot/>)
	- IMPORTANT: Copy your bot token before closing the Discord App Developers page. This will be used later for configuration.
	- Make sure to invite your bot to your server and give it Send Messages permission
- Start the server
- First time running the plugin, a default config file will be placed in `bdsx/plugin-configs/clamor-chatbot/` and the bot will be disabled
- Stop the server and open the `bdsx/plugin-configs/clamor-chatbot/config.json` file in your editor of choice
	- Paste your bot token into the `token` variable
	- Open Discord and enable Developer Mode by going into Settings > App Settings > Advanced
	- Right-click the channel you want your bot to work in and click Copy ID
	- Paste the channel ID in  the `channel` variable in the config
	- Make sure `botEnable` is set to `true` to enable the bot
- Start the server and your bot should be functioning