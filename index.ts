/* Clamor Bot Discord Bridge for BDSX
 * This is a plugin for BDSX
 * All code within this project is under the ISC License.
 * Copyright (c) 2023, Brandon M (bmar116) <bmar116@hotmail.com>.
 * Forked from BDSX-Discord-Chatter (https://github.com/TheShadowEevee/BDSX-Discord-Chatter-Plugin).
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


const pluginPrefix = "[clamor-chatbot]";
const { Client } = require('discord.js');
const fs = require('fs');
const configPath = path.join(
	fsutil.projectPath,
	"plugin-configs/clamor-chatbot/config.json"
);


// startup text
console.log(pluginPrefix + " Starting Clamor-Chatbot.");
console.log(pluginPrefix + ` Clamor-Chatbot is version ${version}.`);


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
				console.log(pluginPrefix + ` Error creating default config.json file ${onrejected}`);
			}
		);
	}
	if (!fsutil.isDirectorySync(dcDir)) {
		// if no plugins-folder/clamor-chatbot directory attempt to make one
		fsutil.mkdir(dcDir).then(
			(onfulfilled) => { },
			(onrejected) => {
				console.log(pluginPrefix + ` Error creating default config.json file ${onrejected}`);
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
				console.log("[clamor-chatbot] Created a default config.json file.");
				if (oldConfig.token) console.log("[clamor-chatbot] Your old config was migrated.");
				console.log("[clamor-chatbot] Please set your configuration values in the config.json!");
			},
			(onrejected) => {
				console.log(pluginPrefix + ` Error creating default config.json file ${onrejected}`);
			}
		);
	}
}
// read config
fsutil.readFile(configPath).then((data) => {
	config = JSON.parse(data);
	const { channel, token } = config;
	//proc.send({ event: "ready" });
});
console.log(pluginPrefix + " Config file loaded!");


// setup Discord bot
var bot = new Client({ disableEveryone: true, ws: { intents: ['GUILDS', 'GUILD_MESSAGES'] } });
function loadBot() {
	//if (bot) bot.destroy();
	if (!config.botEnable) {
		console.log(pluginPrefix + " Discord bot has been disabled. Chat messages will not be relayed.");
		return;
	}
	bot.login(config.token).catch((e: string) => {
		if (e.toString().includes("token") || e.toString().includes("login")) {
			console.log(pluginPrefix + " Error: The bot token provided in config.json is invalid.");
			console.log(pluginPrefix + " Please provide a valid bot token to continue.");
			disableBot();
		} else {
			console.log(pluginPrefix + " Uncaught Error! Cannot create bot hook.");
			disableBot();
			throw e;
		}
	});

	bot.on("ready", () => {
		console.info(pluginPrefix + ` Logged in as ${bot.user.tag}!`);
		console.info(pluginPrefix + " Clamor Chatbot plugin has started.");
		
		bot.user.setPresence({
			status: "online";
			game: {
				type: config.discordActivityType.toUpperCase();
				name: config.discordActivityName;
			}
		});
		
		if (!serverStarted && config.enableStartStopMessages) {
			sendToDiscord(config.discordStartMessage);
			serverStarted = true;
		}
	});
	
	
	bot.on("messageCreate", (message) => {
		console.log(message);
	});

	/*
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
	console.log(pluginPrefix + " Discord bot has been disabled. Chat messages will not be relayed.");
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

function sendToDiscord(message: string) {
	if (!config.botEnable) return;
	const chan = bot.channels.get(config.channel);
	try {
		chan.send(message).catch((e: any) => {
			console.log(e);
			if (e.toString().includes("Missing Permissions")) {
				console.log(pluginPrefix + " Error sending Discord message: Missing permissions.");
				console.log(pluginPrefix + " Ensure the bot is in your server AND it has send permissions in the relevant channel!");
			} else {
				console.log(pluginPrefix + " Uncaught Error! Cannot send Discord message.");
				throw e;
			}
		});
	} catch (e) {
		if (e.toString().includes("Unable to get property 'send'")) {
			console.log("\n" + pluginPrefix + " Failed to send Discord message!");
			console.log(pluginPrefix + " Either your bot token is incorrect or the channel ID is invalid.");
			console.log(pluginPrefix + " Please check your config.json to continue.\n");
		} else if (e.toString().includes("ETIMEDOUT")) {
			console.log("\n" + pluginPrefix + " Failed to send Discord message!");
			console.log(pluginPrefix + " The request timed out. The message will not be sent.");
			console.log(pluginPrefix + " Check the server connection and the Discord API status.\n");
		} else {
			console.log("\n" + pluginPrefix + " Uncaught Error! Failed to send Discord message.\n");
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
	
	var postToConsole = config.toGameChatPrefix.start + config.toGameChatPrefix.serverName + " " + user + config.toGameChatPrefix.end + " " + message;
	
	tellAllRaw(postToConsole);
	if (config.postDiscordToConsole) console.log(timestamp + " " + postToConsole);
}

function listCommand() { // Discord "!list" command that sends player list to discord
	const list = bedrockServer.executeCommand("list", CommandResultType.Data);
	return list.data.statusMessage;
}


// Server startup
var serverStarted = false;
events.serverOpen.on(() => {
	loadBot();
	
	// Register command - reload bot
	command.register("clamor", "Reloads Clamor-Chatbot Discord Relay").overload((param, origin, output) => {
		console.log(pluginPrefix + " Reloading Clamor-Chatbot...");
		bot.destroy().then() => loadBot();
		console.log(pluginPrefix + " Clamor-Chatbot reloaded.");
	},{});
	
});

// Server shutdown
events.serverClose.on(() => {
	if (config.enableStartStopMessages) sendToDiscord(config.discordStopMessage); // Send shutdown message
	console.log(pluginPrefix + " Plugin shutting down.");
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

