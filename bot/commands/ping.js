module.exports = {
	name: "ping",
	description: "Fun little command that responds with Pong.",
	execute(message, args) {
		message.channel.send("Pong.");
	},
};
