/*
 * Clamor Chatbot Discord Bridge for BDS eXtended
 * This is a plugin for BDSX.
 * All code within this project is under the ISC License.
 * Copyright (c) 2023, Brandon M (bmar116) <bmar116@hotmail.com>.
 * Code used from TheShadowEevee/BDSX-Discord-Chatter-Plugin (https://github.com/TheShadowEevee/BDSX-Discord-Chatter-Plugin)
 * And 7dev7urandom/bdsx-discord-chat (https://github.com/7dev7urandom/bdsx-discord-chat)
 */
 

// imports and constants
import { fsutil } from "bdsx/fsutil";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { command } from "bdsx/command";
import { CommandResultType } from "bdsx/commandresult";
import { TextPacket } from "bdsx/bds/packets";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import * as path from "path";
import { version } from "./package.json";
import { defaultConfig } from "./defaultconfig";


const { Client } = require('discord.js');
const pluginPrefix = "[clamor-chatbot]";
const fs = require('fs');
const configPath = path.join(
	fsutil.projectPath,
	"plugin-configs/clamor-chatbot/config.json"
);


// utility functions
function plugin_log(text: string) { // logs timestamp + pluginPrefix + text to console
	var date_time = new Date();
	var timestamp = "[" + ("0" + date_time.getHours()).slice(-2) + ":" + ("0" + date_time.getMinutes()).slice(-2) + ":" + ("0" + date_time.getSeconds()).slice(-2) + "]";
	console.log(timestamp + " " + pluginPrefix + " " + text);
}

// message relay functions
// tellAllRaw code credited to 7dev7urandom (https://github.com/7dev7urandom/bdsx-discord-chat/blob/main/index.ts)
function tellAllRaw(text: string) {
	if (!bedrockServer.isLaunched()) return;
	const packet = TextPacket.create();
	packet.type = TextPacket.Types.Raw;
	packet.message = text;
	for(const i of bedrockServer.level.getPlayers()) {
		i.sendPacket(packet);
	}
	packet.dispose();
}


// startup text
plugin_log("Starting Clamor-Chatbot.");
plugin_log(`Clamor-Chatbot is version ${version}.`);


// setup config file
// if no config file found create one
var config: any;
if (!fsutil.isFileSync(configPath)) {
	const oldConfigPath = path.join(fsutil.projectPath, "discordconfig.json"); // default config file
	let oldConfig: any;
	try {
		oldConfig = JSON.parse(fs.readFileSync(oldConfigPath).toString());
	} catch (e) {
		oldConfig = {};
	}
	const pcDir = path.join(fsutil.projectPath, "plugin-configs/");
	const dcDir = path.join(fsutil.projectPath, "plugin-configs/clamor-chatbot");
	if (!fsutil.isDirectorySync(pcDir)) {
		// if no plugin-configs directory attempt to make one
		fsutil.mkdir(pcDir).then(
			(onfulfilled) => { },
			(onrejected) => {
				plugin_log(` Error creating default config.json file ${onrejected}`);
			}
		);
	}
	if (!fsutil.isDirectorySync(dcDir)) {
		// if no plugins-folder/clamor-chatbot directory attempt to make one
		fsutil.mkdir(dcDir).then(
			(onfulfilled) => { },
			(onrejected) => {
				plugin_log(` Error creating default config.json file ${onrejected}`);
			}
		);
	}
	if (!fsutil.isFileSync(configPath)) {
		// if no config then copy default config
		// bot token and channel id must be set before the bot will work!
		fsutil.writeFile(
			configPath,
			JSON.stringify({ ...defaultConfig, ...oldConfig}, null, 2)
		).then(
			(onfulfilled) => {
				plugin_log("Created a default config.json file.");
				if (oldConfig.token) plugin_log("Your old config was migrated.");
				plugin_log("Please set your configuration values in the config.json!");
			},
			(onrejected) => {
				plugin_log(` Error creating default config.json file ${onrejected}`);
			}
		);
	}
}

// read config
fsutil.readFile(configPath).then((data) => {
	config = JSON.parse(data);
	const { channel, token } = config;
});
plugin_log("Config file loaded!");


// setup Discord bot
var bot = new Client({ disableEveryone: true });
function loadBot() {
	if (!config.botEnable) {
		plugin_log("Discord bot has been disabled. Chat messages will not be relayed.");
		return;
	}
	bot.login(config.token).catch((e: string) => {
		if (e.toString().includes("token") || e.toString().includes("login")) {
			plugin_log("Error: The bot token provided in config.json is invalid.");
			plugin_log("Please provide a valid bot token to continue.");
			disableBot();
		} else {
			plugin_log("Uncaught Error! Cannot create bot hook.");
			disableBot();
			throw e;
		}
	});

	bot.once("ready", () => {
		console.info(pluginPrefix + ` Logged in as ${bot.user.tag}!`);
		
		bot.user.setPresence({
			status: "online";
			game: {
				type: config.discordActivityType.toUpperCase();
				name: config.discordActivityName;
			}
		});
	});
	
	/*
	 * Discord chat message reading is disabled until BDSX updates to node >= 12.0.0
	 *
	// if the bot receives the "!list" command, relay output of the bedrock "/list" command
	// otherwise, relay message to game
	bot.on("message", (data: any) => {
		console.log(data);
		if (data.channel.id == config.channel && data.author.bot != true && config.enableChatRelay) {
			if (data.content.split(" ")[0] == "!list" && config.enableDiscordList) {
				sendToDiscord(listCommand());
			} else {
				sendToGame(data.content, data.author.username);
			}
	});*/
}

function disableBot() {
	config.botEnable = false;
	plugin_log("Discord bot has been disabled. Chat messages will not be relayed.");
}


// message relay functions
function sendToDiscord(message: string) {
	if (!config.botEnable) return;
	const chan = bot.channels.get(config.channel);
	try {
		chan.send(message).catch((e: any) => {
			if (e.toString().includes("Missing Permissions")) {
				plugin_log("Error sending Discord message: Missing permissions.");
				plugin_log("Ensure the bot is in your server AND it has send permissions in the relevant channel!");
			} else {
				plugin_log("Uncaught Error! Cannot send Discord message.");
				throw e;
			}
		});
	} catch (e) {
		if (e.toString().includes("Unable to get property 'send'")) {
			plugin_log("Failed to send Discord message!");
			plugin_log("Either your bot token is incorrect or the channel ID is invalid.");
			plugin_log("Please check your config.json to continue.\n");
		} else if (e.toString().includes("ETIMEDOUT")) {
			plugin_log("Failed to send Discord message!");
			plugin_log("The request timed out. The message will not be sent.");
			plugin_log("Check the server connection and the Discord API status.\n");
		} else {
			plugin_log("Uncaught Error! Failed to send Discord message.\n");
			throw e;
		}
	}
}

function sendToGame(message: string, user: string) {
	if (!config.botEnable) return;
	//Timestamp
	var date_time = new Date();
	var timestamp = "[" + ("0" + date_time.getHours()).slice(-2) + ":" + ("0" + date_time.getMinutes()).slice(-2) + ":" + ("0" + date_time.getSeconds()).slice(-2) + "]";
	
	var potential_emotes=true;
	while(potential_emotes == true) {
		let emote = message.match(/.*<a?:(..+?(?=:[0-9]+>)):[0-9]+>.*/i);
		if (emote == null) {
			potential_emotes = false;
		} else {
			message = message.replace(new RegExp(`<a?:${emote[1]}:[0-9]+>`,'gi'), ":" + emote[1] + ":");
		}
	}
	
	var formattedMessage = config.toGameChatPrefix.start + config.toGameChatPrefix.serverName + " " + user + config.toGameChatPrefix.end + " " + message;
	
	tellAllRaw(formattedMessage);
	if (config.postDiscordToConsole) plugin_log(formattedMessage);
}

/*
 * Discord chat message reading is disabled until BDSX updates to node >= 12.0.0
 *
function listCommand() { // Discord "!list" command that sends player list to discord
	const list = bedrockServer.executeCommand("list", CommandResultType.Data);
	return list.data.statusMessage;
}
*/


// Server startup
var serverStarted = false;
events.serverOpen.on(() => {
	loadBot();
	bot.once("ready", () => {
		sendToDiscord(config.discordStartMessage);
		console.info(pluginPrefix + " Clamor Chatbot plugin has started.");
	});
	
	// Register command - reload bot
	command.register("clamor", "Reloads Clamor-Chatbot Discord Relay").overload((param, origin, output) => {
		plugin_log("Reloading Clamor-Chatbot...");
		bot.destroy().then() => loadBot();
		bot.once("ready", () => {
			plugin_log("Clamor-Chatbot reloaded.");
		});
	},{});
	
});

// Server shutdown
events.serverClose.on(() => {
	if (config.enableStartStopMessages) sendToDiscord(config.discordStopMessage); // Send shutdown message
	plugin_log("Plugin shutting down.");
	bot.destroy(); // Destroy bot
});

// Player join
events.playerJoin.on((ev) => {
	if (config.enableJoinMessages) sendToDiscord(config.discordJoinMessage.start + ev.player.getName() + config.discordJoinMessage.end);
});

// Player left
events.playerLeft.on((ev) => {
	if (config.enableJoinMessages) sendToDiscord(config.discordLeftMessage.start + ev.player.getName() + config.discordLeftMessage.end);
});

// Relay chat message to Discord
events.packetBefore(MinecraftPacketIds.Text).on((ev) => {
	if (config.enableChatRelay) sendToDiscord(config.toDiscordChatPrefix.start + ev.name + config.toDiscordChatPrefix.end + " " + ev.message);
});

