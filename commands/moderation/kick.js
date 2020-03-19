const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class KickUserCommand extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      aliases: ["kickuser", "kickmember"],
      group: "moderation",
      memberName: "kick",
      description: "Kick a single or multiple members.",
      details: oneLine`
				Kick as many members as you like by mentioning them.
				Only members who can kick members may use this command.
			`,
      examples: [".kick [users]", ".kick @User", ".kick @User 1 @User 2"],
      guarded: true,
      guildOnly: true,
      clientPermissions: ["KICK_MEMBERS"],
      userPermissions: ["KICK_MEMBERS"],
      args: [
        {
          key: "members",
          label: "members",
          prompt: "Mention all the users you would like to kick",
          error:
            "User was not found. Remember, you need to mention the user. Try again.",
          infinite: true,
          type: "member"
        }
      ]
    });
  }

  async run(msg, args) {
    let beforeMessage = `\n`;
    for (let member of args.members) {
      if (member.kickable) {
        if (msg.author.id === member.id) {
          beforeMessage += `You cannot kick yourself.\n`;
        } else if (member.id === msg.guild.me.id) {
          beforeMessage += `You cannot kick the bot.\n`;
        } else {
          await member
            .kick(`Command initiated by <@${msg.author.id}>`)
            .then(user => {
              beforeMessage += `Successfully kicked <@${user.id}>\n`;
            })
            .catch(error => {
              beforeMessage += `An error occurred when trying to kick <@${user.id}. Try kicking them manually.\n`;
            });
        }
      } else {
        beforeMessage += `Insufficient permission to kick <@${member.id}>\n`;
      }
    }
    return msg.reply(`${beforeMessage}\nKick command completed.`);
  }
};
