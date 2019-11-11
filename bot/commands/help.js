module.exports = {
	name: "help",
	description: "List all of my commands or info about a specific command.",
	aliases: ["commands"],
	argsUsage: "[command name]",
	cooldown: 1,
	execute(message, args) {
		const { prefix } = require("./../start");
		const data = [];
		const { commands } = message.client;

		// if no args are present, list all commands
		if (!args.length) {
			data.push("Here's a list of all my commands:");
			data.push(commands.map(command => command.name).join(", "));
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

			// send list of commands to invoker's dm
			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === "dm") return;
					message.reply("I've sent you a DM with all my commands!");
				})
				.catch(error => {
					message.reply("It seems like I can't DM you! Do you have DMs disabled?");
				});
		}

		// args are present, check if command exists
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		// command not found in list
		if (!command) {
			return message.reply("That's not a valid command!");
		}

		// everything checks out, send specific command help
		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(", ")}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.argsUsage) data.push(`**Usage:** \`${prefix}${command.name} ${command.argsUsage}\``);

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
		data.push(`**Required Permissions:** \`${command.permissions || "DEFAULT"}\``);
		data.push(`**Limited to Servers Only:** ${(command.serverOnly) ? "Yes" : "No"}`);

		return message.channel.send(data, { split: true });
	},
};
