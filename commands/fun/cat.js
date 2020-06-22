const { oneLine } = require("common-tags");
const { MessageAttachment } = require("discord.js");
const { Command } = require("discord.js-commando");
const request = require("request");

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: "cat",
      aliases: ["cats", "catimage"],
      group: "fun",
      memberName: "cat",
      description: "Get a random cat image.",
      details: oneLine`
      	Nothing, just type the command.
				Only members who can send messages may use this command.
			`,
      examples: [".cat"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
      args: []
    });
  }

  async run(msg, args) {
    msg.channel.startTyping();
    request(`http://aws.random.cat/meow`, async (error, body) => {
      if (!error) {
        const attachment = new MessageAttachment(JSON.parse(body.body).file);
        await msg.channel.send(attachment);
      } else {
        await msg.reply(
          `Something is wrong with the API we use to fetch cat images. Try again later.`
        );
      }
    });
    msg.channel.stopTyping();
  }
};
