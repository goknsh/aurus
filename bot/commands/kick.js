const logger = require("./../../logger");

module.exports = {
	name: "kick",
	description: "Kicks people out",
	args: true,
	usage: "<username> <username2> <username3>...",
	cooldown: 3,
	permissions: ["KICK_MEMBERS"],
	serverOnly: true,
	execute(message, args) {
		message.mentions.users.every((user) => {
			// check all mentioned users
			if (user) {
				// get the member from the user
				const member = message.guild.member(user);
				// check if member is in the guild
				if (member) {
					// check if the member is trying to kick himself
					if (message.author.id === user.id) {
						message.reply("you can't kick yourself");
					}
					// check if user is trying to kick the bot
					else if (user.id === message.guild.me.id) {
						message.reply("you can't kick the bot");
					}
					else {
						member.kick(`Command initiated by <@${message.author.id}>`).then(() => {
							// user is kicked
							message.reply(`successfully kicked <@${user.id}>`);
						}).catch(error => {
							// an error occurred log the error
							message.reply(`I was unable to kick <@${user.id}> because of insufficient permissions`);
							logger.bot.error(error);
						});
					}
				}
				else {
					// the mentioned user isn't in this guild
					message.reply("that user isn't in this guild!");
				}
			}
			else {
				// no user was mentioned
				message.reply("you didn't mention a user to kick!");
			}
			return true;
		});
	},
};
