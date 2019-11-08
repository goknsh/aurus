const start = () => {
	require("dotenv").config();
	const fs = require("fs");
	const Discord = require("discord.js");
	const Sequelize = require("sequelize");
	const logger = require("./../logger")

	// create new discord client
	const client = new Discord.Client();
	client.commands = new Discord.Collection();

	// connect to database
	const sequelize = new Sequelize("database", process.env.DB_USER, process.env.DB_PASSWORD, {
		host: "localhost",
		dialect: "sqlite",
		logging: (message) => logger.db.info(message),
		storage: "bot/database.sqlite",
	});

	// define database structure
	const database = sequelize.define("guilds", {
		id: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false,
			primaryKey: true,
		},
		prefix: {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: "!",
		},
	}, {
		timestamps: false,
	});

	const prefix = "!";


	// fetch all command files
	const commandFiles = fs.readdirSync("./bot/commands").filter(file => file.endsWith(".js"));

	// set all commands
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.name, command);
	}

	// prepare for cooldowns
	const cooldowns = new Discord.Collection();

	// triggers after bot has logged in
	client.once("ready", () => {
		logger.bot.info("Bot is ready to go.");
		database.sync().then(() => {
			logger.db.info("Database structure synced");
			client.user.setActivity("for your messages", { type: "WATCHING" }).catch(error => {
				logger.bot.error(error);
			});
		}).catch((error) => {
			logger.db.error(error);
		});
	});

	// listen for messages
	client.on("message", message => {
		// check if incoming message has required prefix
		if (!message.content.startsWith(prefix) || message.author.bot) return;

		const args = message.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();

		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));


		if (!command) return;

		if (command.serverOnly && message.channel.type !== "text") {
			return message.reply("That command is invalid inside DMs; try another.");
		}

		if (message.channel.type !== "dm") {
			if (!message.member.hasPermission(command.permissions)) {
				return message.reply("You do not have sufficient permissions to execute that command.");
			}
		}

		if (command.args && !args.length) {
			let reply = `That command requires arguments, ${message.author}.`;

			if (command.argsUsage) {
				reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.argsUsage}\``;
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
				return message.reply(`Please wait ${timeLeft.toFixed(1)}s before using the \`${command.name}\` command.`);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(message, args);
		} catch (error) {
			logger.bot.error(error);
			message.reply("There was an error trying to execute that command. We've recorded the error and will fix it soon.");
		}

	});

	client.on("guildCreate", guild => {
		database.create({
			id: guild.id,
			prefix: "!",
		}).catch((error) => {
			return logger.db.error(error);
		});
	});

	client.on("guildDelete", guild => {
		database.destroy({
			where: {
				id: guild.id,
			},
		}).catch((error) => {
			return logger.db.error(error);
		});
	});

	// login to discord with token
	client.login(process.env.TOKEN);
};

module.exports = {
	start
};
