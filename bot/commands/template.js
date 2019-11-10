module.exports = {
	name: "template",
	description: "Command to create templates or use existing templates",
	args: true,
	argsUsage: "<action>",
	cooldown: 30,
	permissions: ["ADMINISTRATOR"],
	serverOnly: true,
	execute(message, args) {
		message.channel.send("Pong.");
	},
};
