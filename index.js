#!/usr/bin/node
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const fs = require("fs");
const dotenv = require("dotenv").config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName, options } = interaction;

	if (commandName === "detrack") {
		await interaction.deferReply();
		
		const input = options.getString("url");
		const isURL = input.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig);
		
		if (!isURL) {
			await interaction.editReply('That\'s not a valid URL!');
			return;
		}
		
		const reply = input.replace(/(\?.+)$/, "");
		await interaction.editReply(`<${reply}>`);
	}
});

async function registerCommands() {
	const commands = [
		{
			name: "detrack",
			description: "Remove the tracking data from a URL",
			contexts: [0, 1, 2], // for use in DMs
			options: [
				{
					name: "url",
					type: 3,
					description: "URL to remove the tracking bits of",
					required: true,
				},
			],
		}
	];

	const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
	try {
		console.log("Registering global slash commands...");
		await rest.put(
			Routes.applicationCommands(process.env.ID),
			{ body: commands }
		);
		console.log("Global slash commands registered successfully.");
	} catch (error) {
		console.error("Failed to register global slash commands:", error);
	}
}

client.once("clientReady", async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	await registerCommands();
});

client.login(process.env.TOKEN);
