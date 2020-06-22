const { oneLine } = require("common-tags");
const { MessageAttachment } = require("discord.js");
const { Command } = require("discord.js-commando");
const randomPuppy = require("random-puppy");

module.exports = class MemeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "meme",
      aliases: ["randommeme"],
      group: "fun",
      memberName: "meme",
      description:
        "Get a random meme from either /r/dankmeme, /r/meme, /r/memes, /r/spicy_memes, or /r/me_irl.",
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
    const subReddits = ["dankmeme", "meme", "memes", "spicy_memes", "me_irl"];
    const random = subReddits[Math.floor(Math.random() * subReddits.length)];
    const attachment = new MessageAttachment(await randomPuppy(random));
    await msg.channel.send(attachment);
    msg.channel.stopTyping();
  }
};
