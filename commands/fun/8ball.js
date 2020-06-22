const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class EightBallCommand extends Command {
  constructor(client) {
    super(client, {
      name: "8ball",
      aliases: ["8b"],
      group: "fun",
      memberName: "8ball",
      description: "Ask 8ball a question, and it will answer.",
      details: oneLine`
				Just ask it a question. Any question.
				Only members who can send messages may use this command.
			`,
      examples: [".8ball are you real?"],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES"],
      args: [
        {
          key: "question",
          label: "question",
          prompt: "What question do you want to ask 8ball?",
          error: "Question wasn't asked. Try again.",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    if (args.question.includes("who") || args.question.includes("Who")) {
      if (msg.channel.type === "dm") {
        const chooseFrom = ["You.", "Me."];
        const result =
          chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
        await msg.channel.send(`${result}`);
      } else {
        let randomMember = msg.guild.members.cache.random().user.id;
        await msg.channel.send(`<@${randomMember}>`);
      }
    } else {
      const chooseFrom = [
        "As I see it, yes.",
        "Ask again later.",
        "Better not tell you now.",
        "Cannot predict now.",
        "Concentrate and ask again.",
        "Don’t count on it.",
        "It is certain.",
        "It is decidedly so.",
        "Most likely.",
        "My reply is no.",
        "My sources say no.",
        "Outlook not so good.",
        "Outlook good.",
        "Reply hazy, try again.",
        "Signs point to yes.",
        "Very doubtful.",
        "Without a doubt.",
        "Yes.",
        "Yes – definitely.",
        "You may rely on it."
      ];
      const result = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
      await msg.channel.send(`${result}`);
    }
  }
};
