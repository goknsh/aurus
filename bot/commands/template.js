const Sequelize = require("sequelize");
const path = require("path");
const logger = require("./../../logger");
const crypto = require("crypto");

const database = new Sequelize("database", process.env.DB_USER, process.env.DB_PASSWORD, {
	dialect: "sqlite",
	logging: (message) => logger.db.info(message),
	storage: "bot/database.sqlite",
});

module.exports = {
	name: "template",
	description: "Command to create templates or use existing templates",
	args: true,
	argsUsage: "<action>",
	cooldown: 0.1,
	permissions: ["ADMINISTRATOR"],
	serverOnly: true,
	execute(message, args) {
		const action = args[0];
		if (action === "create") {
			let emojis = [];
			let channels = {
				category: [],
				news: [],
				store: [],
				text: [],
				voice: []
			};
			let roles = [];
			message.guild.emojis.forEach((emoji) => {
				emojis.push({
					attachment: emoji.url,
					name: emoji.name,
					roles: emoji.roles,
				});

			});
			message.guild.channels.forEach((channel) => {
				channels.push({
					type: channel.type,
					name: channel.name,
					position: channel.position,
					topic: channel.topic,
					nsfw: channel.nsfw,
					bitrate: channel.bitrate,
					userLimit: channel.userLimit,
					parentID: channel.parentID,
					permissionOverwrites: channel.permissionOverwrites.toString(),
					rateLimitPerUser: channel.rateLimitPerUser,
				});
			});
			message.guild.roles.forEach((role) => {
				roles.push({
					id: role.id,
					name: role.name,
					color: role.color,
					hoist: role.hoist,
					position: role.position,
					permissions: role.permissions,
					mentionable: role.mentionable,
				});
			});
			const Templates = database.import(path.join(__dirname, "..", "models", "templates.js"));
			Templates.create({
				id: crypto.randomBytes(3).toString("HEX"),
				guildId: message.guild.id,
				channels: channels,
				emojis: emojis,
				roles: roles,
			}).catch((error) => {
				return logger.db.error(error);
			});
		}
	},
};
