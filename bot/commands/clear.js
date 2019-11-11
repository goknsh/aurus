const logger = require("./../../logger");

module.exports = {
	name: "clear",
	description: "Clears messages",
	args: true,
	usage: "<number of messages/all>",
	cooldown: 3,
	permissions: ["MANAGE_MESSAGES"],
	serverOnly: true,
	async execute(message, args) {
		if (Number(args[0]) < 100) {
			message.delete();
			await message.channel.bulkDelete(Number(args[0]));
		}
		else if (args[0] === "all") {
			await message.author.send("We'll let you know once all the messages are deleted");
			let fetched;
			do {
				fetched = await message.channel.messages.fetch({ limit: 100 });
				await message.channel.bulkDelete(fetched);
			}
			while (fetched.size >= 2);
			await message.author.send("All the messages are now deleted");
		}
		else {
			message.reply("invalid argument supplied");
		}
	},
};
