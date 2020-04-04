const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");
const { voiceCollector } = require("./../../events/ready");

module.exports = class VoiceSetup extends Command {
  constructor(client) {
    super(client, {
      name: "voicesetup",
      aliases: ["vs"],
      group: "voice",
      memberName: "setup",
      description:
        "Setup to allow members to create temporary voice channels and let them control it.",
      details: oneLine`
				Only members who can manage channels and roles, deafen and move members may use this command.
			`,
      examples: [".vs"],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_CHANNELS"],
      userPermissions: ["ADMINISTRATOR"]
    });
  }

  async run(msg, args) {
    msg.guild.channels
      .create("Voice on Demand", {
        type: "category",
        reason:
          "To allow members to create temporary voice channels and let them control it"
      })
      .then(categoryChannel => {
        msg.guild.channels
          .create("Join to Create", {
            type: "voice",
            parent: categoryChannel,
            reason:
              "To allow members to create temporary voice channels and let them control it"
          })
          .then(async voiceChannel => {
            await this.client.provider.set(msg.guild, "voice", {
              origin: voiceChannel,
              children: []
            });
            voiceCollector.push({ origin: voiceChannel, children: [] });
            await msg.reply(
              `Voice channel and category created. When a user joins the Join to Create channel, a voice channel will be created for them. Feel free to change the name of the channel or category and move it anywhere you please.`
            );
          });
      });
  }
};
