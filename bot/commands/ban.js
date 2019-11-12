const logger = require("./../../logger");

module.exports = {
	name: "ban",
	description: "Bans people",
	args: true,
	usage: "<username> <username2> <username3>",
	cooldown: 3,
	permissions: ["BAN_MEMBERS"],
	serverOnly: true,
	execute(message, args) {
		message.mentions.users.every((user) => {
			// check all mentioned users
			if (user) {
				// get the member from the user
				const member = message.guild.member(user);
				// check if member is in the guild
				if (member) {
					// check if the member is trying to ban himself
					if (message.author.id === user.id) {
						message.reply("you can't ban yourself");
					}
					// check if user is trying to ban the bot
					else if (user.id === message.guild.me.id) {
						message.reply("you can't ban the bot");
					}
					else {
						member.ban({
							days: Number(args[args.length - 1]) || 7,
							reason: `Command initiated by <@${message.author.id}>`,
						}).then(() => {
							// user is banned
							message.reply(`successfully banned <@${user.id}>`);
						}).catch(error => {
							// an error occurred log the error
							message.reply(`I was unable to ban <@${user.id}> because of insufficient permissions`);
							logger.bot.error(error);
						});
					}
				}
				else {
					// The mentioned user isn't in this guild
					message.reply("that user isn't in this guild!");
				}
			}
			else {
				// no user was mentioned
				message.reply("you didn't mention a user to ban!");
			}
			return true;
		});
	},
};
