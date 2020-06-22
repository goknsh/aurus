const { oneLine } = require("common-tags");
const { MessageAttachment } = require("discord.js");
const { Command } = require("discord.js-commando");
const request = require("request");

module.exports = class DogCommand extends Command {
  constructor(client) {
    super(client, {
      name: "dog",
      aliases: ["doge", "dogs", "dogimage"],
      group: "fun",
      memberName: "dog",
      description: "Get a random dog image.",
      details: oneLine`
      	Nothing, just type the command.
				Only members who can send messages may use this command.
			`,
      examples: [".dog"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
      args: []
    });
  }

  async run(msg, args) {
    msg.channel.startTyping();
    request(`https://dog.ceo/api/breeds/image/random`, async (error, body) => {
      if (!error) {
        const attachment = new MessageAttachment(JSON.parse(body.body).message);
        await msg.channel.send(attachment);
      } else {
        await msg.reply(
          `Something is wrong with the API we use to fetch dog images. Try again later.`
        );
      }
    });
    msg.channel.stopTyping();
  }
};
