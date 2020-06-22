const { oneLine } = require("common-tags");
const { MessageAttachment } = require("discord.js");
const { Command } = require("discord.js-commando");
const request = require("request");

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: "bird",
      aliases: ["birds", "birdimage"],
      group: "fun",
      memberName: "bird",
      description: "Get a random bird image.",
      details: oneLine`
      	Nothing, just type the command.
				Only members who can send messages may use this command.
			`,
      examples: [".bird"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
      args: []
    });
  }

  async run(msg, args) {
    msg.channel.startTyping();
    request(`https://some-random-api.ml/img/birb`, async (error, body) => {
      if (!error) {
        const attachment = new MessageAttachment(JSON.parse(body.body).link);
        await msg.channel.send(attachment);
      } else {
        await msg.reply(
          `Something is wrong with the API we use to fetch bird images. Try again later.`
        );
      }
    });
    msg.channel.stopTyping();
  }
};
