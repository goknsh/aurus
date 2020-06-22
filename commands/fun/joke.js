const { oneLine } = require("common-tags");
const { MessageAttachment } = require("discord.js");
const { Command } = require("discord.js-commando");
const joke = require("one-liner-joke").getRandomJoke;

module.exports = class JokeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "joke",
      aliases: ["randomjoke"],
      group: "fun",
      memberName: "joke",
      description: "Get a random joke.",
      details: oneLine`
      	Nothing, just type the command.
				Only members who can send messages may use this command.
			`,
      examples: [".joke"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES"],
      args: []
    });
  }

  async run(msg, args) {
    await msg.reply(
      `${joke({ exclude_tags: ["dirty", "racist", "sex", "death"] }).body}`
    );
  }
};
