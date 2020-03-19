const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");
const { purgeMessageCollector } = require("./../../events/ready");

module.exports = class AddJoinableRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "purge",
      group: "moderation",
      memberName: "purge",
      description:
        "Purge messages with ease. Currently only auto and stop option exists. More options coming soon.",
      details: oneLine`
      	Currently only auto, all and stop option exists.
      	Auto will automatically purge incoming messages after the set amount of time.
      	It will not touch message that have been sent before the purge command.
      	Stop will stop auto purge.
        Only members who can manage messages may use this command.
			`,
      examples: [".purge auto 600", ".purge stop"],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          key: "type",
          label: "type",
          prompt: "Type of purge you would like to setup",
          error: "Purge type not found. Try again.",
          type: "string",
          validate: val =>
            val.toLowerCase() === "auto" || val.toLowerCase() === "stop",
          parse: val => val.toLowerCase()
        },
        {
          key: "time",
          label: "time",
          prompt:
            "How long in seconds would like for me to wait before I purge the message?",
          error: "Invalid time supplied. Try again.",
          type: "integer",
          default: 60,
          parse: val => parseInt(val)
        }
      ]
    });
  }

  async run(msg, args) {
    if (args.type === "auto") {
      let purgeChannelList = await this.client.provider.get(
        msg.guild,
        "purgeChannelList"
      );
      if (purgeChannelList == null) purgeChannelList = [];
      // Check for duplicate channels in list
      purgeChannelList = purgeChannelList.filter(list => {
        return list.channel !== msg.channel.id;
      });
      // Add channels to array
      purgeChannelList.push({
        channel: msg.channel.id,
        guild: msg.guild.id,
        time: args.time
      });
      // Add updated list to database
      await this.client.provider.set(
        msg.guild,
        "purgeChannelList",
        purgeChannelList
      );
      if (await purgeMessageCollector[msg.channel.id]) {
        await purgeMessageCollector[msg.channel.id].stop(
          `Purge time changed by <@${msg.author.id}>`
        );
        purgeMessageCollector[purgeChannelList.channel] = await msg.channel
          .createMessageCollector(m => true)
          .on("collect", m => {
            setTimeout(() => {
              m.delete();
            }, args.time * 1000);
          });
      } else {
        purgeMessageCollector[purgeChannelList.channel] = await msg.channel
          .createMessageCollector(m => true)
          .on("collect", m => {
            setTimeout(() => {
              m.delete();
            }, args.time * 1000);
          });
      }
      return msg.reply(
        `Done. I'll purge messages that arrive in this channel ${args.time} seconds after they are sent.`
      );
    } else if (args.type === "stop") {
      let purgeChannelList = await this.client.provider.get(
        msg.guild,
        "purgeChannelList"
      );
      if (purgeChannelList == null) purgeChannelList = [];
      // Check for duplicate channels in list
      let newPurgeChannelList = purgeChannelList.filter(list => {
        return list.channel !== msg.channel.id;
      });
      if (newPurgeChannelList.length !== purgeChannelList.length) {
        // End messageCollector for the channel
        await purgeMessageCollector[msg.channel.id].stop(
          `Purge stop command sent by <@${msg.author.id}>`
        );
        // Remove purge channel from database
        await this.client.provider.set(
          msg.guild,
          "purgeChannelList",
          newPurgeChannelList
        );
        return msg.reply(
          `Done. Messages in this channel will no longer be purged, except for the stop command above.`
        );
      } else {
        return msg.reply(
          `Cannot stop the purge because there wasn't a purge setup in this channel.`
        );
      }
    }
  }
};
