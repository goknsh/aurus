const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class RockPaperScissorsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rps",
      aliases: ["psr", "srp", "rockpaperscissors"],
      group: "fun",
      memberName: "rockpaperscissors",
      description: "Play rock, paper scissors with the bot.",
      details: oneLine`
				Type the command followed by what you pick.
				Only members who can send messages may use this command.
			`,
      examples: [
        ".rps rock",
        ".rps paper",
        ".rps scissors",
        ".rps r",
        ".rps p",
        ".rps s"
      ],
      guarded: false,
      guildOnly: false,
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["SEND_MESSAGES"],
      args: [
        {
          key: "playerChooses",
          label: "playerChooses",
          prompt: "What would you like to choose?",
          error:
            "You must choose either rock/r, paper/p, or scissors/s. Try again.",
          type: "string",
          validate: val =>
            val.toLowerCase() === "rock" ||
            val.toLowerCase() === "paper" ||
            val.toLowerCase() === "scissors" ||
            val.toLowerCase() === "r" ||
            val.toLowerCase() === "p" ||
            val.toLowerCase() === "s",
          parse: playerChooses => playerChooses.toLowerCase()
        }
      ]
    });
  }

  async run(msg, args) {
    let playerChooses = args.playerChooses;
    let choices = ["rock", "paper", "scissors"];
    let botChooses = choices[Math.floor(Math.random() * choices.length)];
    if (playerChooses === "r") {
      playerChooses = "rock";
    }
    if (playerChooses === "p") {
      playerChooses = "paper";
    }
    if (playerChooses === "s") {
      playerChooses = "scissors";
    }

    if (playerChooses === botChooses) {
      await msg.reply(`It was a tie, I chose ${botChooses} as well.`);
    } else if (
      (playerChooses === "scissors" && botChooses === "rock") ||
      (playerChooses === "rock" && botChooses === "paper") ||
      (playerChooses === "paper" && botChooses === "scissors")
    ) {
      await msg.reply(`I win, I chose ${botChooses}.`);
    } else {
      await msg.reply(`You win, I chose ${botChooses}.`);
    }
  }
};
