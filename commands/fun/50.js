const { oneLine } = require("common-tags");
const { MessageAttachment } = require("discord.js");
const { Command } = require("discord.js-commando");
const randomPuppy = require("random-puppy");

module.exports = class FiftyFiftyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "50",
      aliases: ["5050", "fifty", "fiftyfifty"],
      group: "fun",
      memberName: "fiftyfifty",
      description: "Get a random image from /r/fiftyfifty.",
      details: oneLine`
      	Nothing, just type the command, but must be in NSFW channel to use the command.
				Only members who can send messages may use this command.
			`,
      examples: [".50"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
      args: []
    });
  }

  async run(msg, args) {
    msg.channel.startTyping();
    if (msg.channel.nsfw || msg.channel.type === "dm") {
      let randomImage = await randomPuppy("fiftyfifty");
      const attachment = new MessageAttachment(
        randomImage,
        `SPOILER_${randomImage.split("/").pop()}`
      );
      await msg.channel.send(attachment);
    } else {
      await msg.reply(`You must be in a NSFW channel to use this command.`);
    }
    msg.channel.stopTyping();
  }
};
