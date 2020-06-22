const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");
const request = require("request");

module.exports = class UrbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "urban",
      aliases: ["urbandict", "urbandictionary"],
      group: "fun",
      memberName: "urbandictionary",
      description: "Get a defenition from urbandictionary.",
      details: oneLine`
      	Nothing, just type the command, followed by a word, but must be in NSFW channel to use the command.
				Only members who can send messages may use this command.
			`,
      examples: [".urban meme"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES"],
      args: [
        {
          key: "term",
          label: "term",
          prompt: "What would you like Urban Dictionary to define?",
          error:
            "You must provide a term for Urban Dictionary to define. Try again.",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    msg.channel.startTyping();
    if (msg.channel.nsfw || msg.channel.type === "dm") {
      request(
        `http://api.urbandictionary.com/v0/define?term=${args.term}`,
        async (error, body) => {
          let result = JSON.parse(body.body).list[0];
          if (!result) {
            await msg.reply(
              `Urban Dictionary does not contain a definition for ${args.term}`
            );
          } else {
            await msg.reply(
              `${result.word} is defined as: ${result.definition
                .replace(/\[/g, "")
                .replace(/]/g, "")}`
            );
          }
        }
      );
    } else {
      await msg.reply(`You must be in a NSFW channel to use this command.`);
    }
    msg.channel.stopTyping();
  }
};
