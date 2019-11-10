require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const Sequelize = require("sequelize");
const logger = require("./../logger");

// create new discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();

// our default prefix is a!
const prefix = "a!";

// connect to database
const database = new Sequelize("database", process.env.DB_USER, process.env.DB_PASSWORD, {
	host: "localhost",
	dialect: "sqlite",
	logging: (message) => logger.db.info(message),
	storage: "bot/database.sqlite",
});

// define database structure
const Guilds = database.define("guilds", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		primaryKey: true,
	},
	prefix: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: prefix,
	},
}, {
	timestamps: false,
});

const Reputations = database.define("reputation", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		primaryKey: true,
	},
	upvotes: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	downvotes: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	createdAt: {
		type: Sequelize.TIME,

	},
	updatedAt: {
		type: Sequelize.TIME,
	},

});

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
	// TODO: Add custom prefix support
	// // if command is not sent via dm, check for custom prefix
	// if (message.channel.type !== "dm") {
	// 	Guilds.findOne({ where: { id: message.guild.id } }).then((results) => {
	// 		prefix = results.prefix;
	// 	});
	// }

	// check if incoming message has required prefix
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// get args
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	// get command inputted and find in command list
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));


	// command does not exist
	if (!command) return;

	// check if command is limited to servers only
	if (command.serverOnly && message.channel.type !== "text") {
		return message.reply("That command is invalid inside DMs; try another.");
	}

	// check if all required args are present
	if (command.args && !args.length) {
		let reply = `That command requires arguments, ${message.author}.`;

		if (command.argsUsage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.argsUsage}\``;
		}

		return message.channel.send(reply);
	}

	// check if there is a cooldown on the command
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	// cooldown time calculator
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

	// check if command is sent via dm if not check for permissions
	if (message.channel.type !== "dm") {
		if (!message.member.hasPermission(command.permissions || [])) {
			return message.reply("You do not have sufficient permissions to execute that command.");
		}
	}

	// everything is ok, try executing command
	try {
		command.execute(message, args);
	} catch (error) {
		logger.bot.error(error);
		return message.reply("There was an error trying to execute that command. We've recorded the error and will fix it soon.");
	}

});

// if bot is added to new server, add server id to database
client.on("guildCreate", guild => {
	Guilds.create({
		id: guild.id,
		prefix: prefix,
	}).catch((error) => {
		return logger.db.error(error);
	});
});

// if bot is removed from server, remove server id from database
client.on("guildDelete", guild => {
	Guilds.destroy({
		where: {
			id: guild.id,
		},
	}).catch((error) => {
		return logger.db.error(error);
	});
});

// login to discord with token
client.login(process.env.TOKEN);

module.exports = {
	database,
	Guilds,
	Reputations,
};
