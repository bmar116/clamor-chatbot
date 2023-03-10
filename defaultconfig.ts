export const defaultConfig = {
	"botEnable": false,
	"token": "your bot token",
	"channel": "chat channel id",
	"discordActivityType": "playing",
	"discordActivityName": "Minecraft",
	"enableChatRelay": true,
	"postDiscordToConsole": true,
	"toGameChatPrefix": {
		"start": "<",
		"serverName": "§b[Discord]§r",
		"end": ">"
	},
	"toDiscordChatPrefix": {
		"start": "***<",
		"end": ">***:"
	},
	"enableStartStopMessages": true,
	"discordStartMessage": "***Server has started!***",
	"discordStopMessage": "***Server has stopped!***",
	"enableJoinMessages": true,
	"discordJoinMessage": {
		"start": "***<",
		"end": "> has joined the server!***"
	},
	"discordLeftMessage": {
		"start": "***<",
		"end": "> has left the server!***"
	},
	"enableDiscordList": false,
	"enableMemoryWatchdog": true
}