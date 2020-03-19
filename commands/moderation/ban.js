const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class BanUserCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      aliases: ["banuser", "banmember"],
      group: "moderation",
      memberName: "ban",
      description: "Ban a single or multiple members.",
      details: oneLine`
				Start by supplying an positive integer as the number of days you would like to ban users for and then ban as many members as you like by mentioning them.
				Only members who can ban members may use this command.
			`,
      examples: [
        ".ban [days] [users]",
        ".ban 7 @User",
        ".ban 7 @User 1 @User 2"
      ],
      guarded: true,
      guildOnly: true,
      clientPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"],
      args: [
        {
          key: "days",
          label: "days",
          prompt: "Number of days to ban the user",
          error: "Invalid number supplied. Try again.",
          type: "integer",
          parse: days => parseInt(days)
        },
        {
          key: "members",
          label: "members",
          prompt: "Mention all the users you would like to ban",
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
      if (member.bannable) {
        if (msg.author.id === member.id) {
          beforeMessage += `You cannot ban yourself.\n`;
        } else if (member.id === msg.guild.me.id) {
          beforeMessage += `You cannot ban the bot.\n`;
        } else {
          await member
            .ban({
              days: args.days,
              reason: `Command initiated by <@${msg.author.id}>`
            })
            .then(user => {
              beforeMessage += `Successfully banned <@${user.id}> for ${args.days} days\n`;
            })
            .catch(error => {
              beforeMessage += `An error occurred when trying to ban <@${user.id}. Try banning them manually.\n`;
            });
        }
      } else {
        beforeMessage += `Insufficient permission to ban <@${member.id}>\n`;
      }
    }
    return msg.reply(`${beforeMessage}\nBan command completed.`);
  }
};
