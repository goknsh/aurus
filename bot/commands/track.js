const logger = require("./../../logger");
const request = require("request");

module.exports = {
	name: "track",
	description: "Track your stats",
	args: true,
	usage: `See documentation at ${process.env.WEBSITE}/docs/commands/track`,
	cooldown: 3,
	execute(message, args) {
		let platforms = {
			apex: ["origin", "xbl", "psn"],
			csgo: ["steam"],
			"division-2": ["uplay", "xbl", "psn"],
			overwatch: ["battlenet", "xbl", "psn"],
			splitgate: ["steam"],
		};
		if (args[0] === "apex" || args[0] === "csgo" || args[0] === "division-2" || args[0] === "overwatch" || args[0] === "splitgate") {
			if (platforms[args[0]].includes(args[1])) {
				if (args[2]) {
					request({
						url: `https://public-api.tracker.gg/v2/${args[0]}/standard/profile/${args[1]}/${args[2]}`,
						headers: {
							"TRN-Api-Key": process.env.TRN_API_KEY,
						},
					}, (error, response, body) => {
						if (!error && response.statusCode === 200) {
							let msg = `Here's the stats you asked for:\n`;
							let keys = [];
							stats = JSON.parse(body).data.segments[0].stats;
							for (let k in stats) {
								keys.push(stats[k]);
							}
							keys.forEach(key => {
								msg += `${key.displayName}: ${key.displayValue}\n`;
							});
							message.reply(msg);
						}
						else {
							console.log(error, response, body);
							message.reply("Something went wrong when we tried to contact the API, try again later");
						}
					});
				}
				else {
					message.reply("You need to provide a user handle");
				}
			}
			else {
				message.reply("You need to pick a valid platform from origin, xbl, or psn");
			}
		}
	},
};
