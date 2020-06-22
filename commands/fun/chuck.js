const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");
const request = require("request");

module.exports = class ChuckNorrisCommand extends Command {
  constructor(client) {
    super(client, {
      name: "chuck",
      aliases: ["chucknorris", "norris"],
      group: "fun",
      memberName: "chuck",
      description: "Get a random Chuck Norris joke.",
      details: oneLine`
      	Nothing, just type the command.
				Only members who can send messages may use this command.
			`,
      examples: [".chuck"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES"],
      args: []
    });
  }

  async run(msg, args) {
    msg.channel.startTyping();
    request(`https://api.chucknorris.io/jokes/random`, async (error, body) => {
      if (!error) {
        await msg.reply(`${JSON.parse(body.body).value}`);
      } else {
        await msg.reply(
          `Something is wrong with the API we use to fetch dog images. Try again later.`
        );
      }
    });
    msg.channel.stopTyping();
  }
};
