module.exports = {
	name: "beep",
	aliases: ["beep2"],
	description: "Beep!",
	args: true,
	usage: "<test>",
	cooldown: 5,
	serverOnly: true,
	execute(message, args) {
		if (args[0] === "test") {
			return message.channel.send("Yep, it is working!");
		}

		message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};
