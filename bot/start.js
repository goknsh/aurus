const start = () => {
	require("dotenv").config();
	const fs = require("fs");
	const Discord = require("discord.js");
	const sqlite3 = require("sqlite3").verbose();
	const prefix = "!";

	// create new discord client
	const client = new Discord.Client();
	client.commands = new Discord.Collection();

	const commandFiles = fs.readdirSync("./bot/commands").filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.name, command);
	}

	const cooldowns = new Discord.Collection();

	// triggers after bot has logged in
	client.once("ready", () => {
		console.log("Bot is ready to go.");
		client.user.setActivity("for your messages", { type: "WATCHING" }).catch(error => {
			console.error(error);
		});
	});

	// listen for messages
	client.on("message", message => {
		if (!message.content.startsWith(prefix) || message.author.bot) return;

		const args = message.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();

		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));


		if (!command) return;

		if (command.serverOnly && message.channel.type !== "text") {
			return message.reply("That command is invalid inside DMs; try another.");
		}

		if (command.args && !args.length) {
			let reply = `That command requires arguments, ${message.author}.`;

			if (command.usage) {
				reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
			}

			return message.channel.send(reply);
		}

		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply(`${message.author}, please wait ${timeLeft.toFixed(1)}s before using the \`${command.name}\` command.`);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply("There was an error trying to execute that command. We've recorded the error and will fix it soon.");
		}

	});

	client.on("guildCreate", guild => {
		let db = new sqlite3.Database("./bot/database.sqlite", err => {
			if (err) {
				return console.error(err);
			}
		});
		db.run(`INSERT INTO guilds(id, prefix) VALUES(?, ?)`, [guild.id, "!"], err => {
			if (err) {
				return console.error(`Error while adding guild to database:\n\tMessage: ${err.message}\n\tData:\n\t\tid: ${guild.id}\n\t\tprefix: !\n`);
			}
		});
		db.close();
	});

	client.on("guildDelete", guild => {
		let db = new sqlite3.Database("./bot/database.sqlite", err => {
			if (err) {
				return console.error(err);
			}
		});
		db.run(`DELETE FROM guilds WHERE id = ?`, [guild.id], err => {
			if (err) {
				return console.error(`Error while deleting guild from database:\n\tMessage: ${err.message}\n\tData:\n\t\tid: ${guild.id}\n`);
			}
		});
		db.close();
	});

	// login to discord with token
	client.login(process.env.TOKEN);
};

module.exports = start;
