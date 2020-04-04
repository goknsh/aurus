const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class ClearMessagesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "clear",
      group: "moderation",
      memberName: "clear",
      description: "Clear messages with ease.",
      details: oneLine`
        Delete messages with ease. The only argument you need to supply is the number of messages you would like to delete within a limit of 1000.
        Only members who can manage messages may use this command.
			`,
      examples: [".clear 1000", ".clear 5"],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          key: "numberOfMessages",
          label: "numberOfMessages",
          prompt:
            "Number of messages you would like to delete within a limit of 1000.",
          error:
            "Number invalid. Remember, the number must be less than 1001. Try again.",
          type: "integer",
          validate: val => parseInt(val) > 0 && parseInt(val) < 1001,
          parse: val => parseInt(val)
        }
      ]
    });
  }

  async run(msg, args) {
    await msg.reply(
      `Deletion process begun. We'll let you know when we're done.`
    );
    let numberDeleted = 0;
    if (args.numberOfMessages > 100) {
      do {
        await msg.channel
          .bulkDelete(100)
          .then(messages => {
            numberDeleted += messages.size;
          })
          .catch(error => {
            return msg.reply(
              `Something went wrong when trying to delete messages. Try again later.`
            );
          });
        args.numberOfMessages -= 100;
      } while (args.numberOfMessages > 100);
      await msg.channel
        .bulkDelete(args.numberOfMessages)
        .then(messages => {
          numberDeleted += messages.size;
          return msg.reply(`${numberDeleted} messages were deleted.`);
        })
        .catch(error => {
          return msg.reply(
            `Something went wrong when trying to delete messages. Try again later.`
          );
        });
    } else {
      await msg.channel
        .bulkDelete(args.numberOfMessages)
        .then(messages => {
          numberDeleted += messages.size;
          return msg.reply(`${numberDeleted} messages were deleted.`);
        })
        .catch(error => {
          return msg.reply(
            `Something went wrong when trying to delete messages. Try again later.`
          );
        });
    }
  }
};
