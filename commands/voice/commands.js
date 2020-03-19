const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class VoiceCommand extends Command {
  constructor(client) {
    super(client, {
      name: "voice",
      aliases: ["v"],
      group: "voice",
      memberName: "commands",
      description:
        "Setup temporary voice channels and let your users control them.",
      details: oneLine`
                You must be in a voice channel to use any of these commands.
                Control your channel using these commands after you have your own channel.
                The first argument must the the type of command you want to use in your Voice Channel.
				Only members who can send messages may use this command.
			`,
      examples: [".v [users]", ".v @User", ".v @User 1 @User 2"],
      guarded: true,
      guildOnly: true,
      clientPermissions: [
        "DEAFEN_MEMBERS",
        "MANAGE_CHANNELS",
        "MANAGE_ROLES",
        "MOVE_MEMBERS"
      ],
      userPermissions: ["SEND_MESSAGES"],
      args: [
        {
          key: "type",
          label: "type",
          prompt:
            "What do you want to change regarding the channel you are in?",
          error:
            "User was not found. Remember, you need to mention the user. Try again.",
          type: "string",
          parse: value => {
            return value.toLowerCase();
          },
          validate: value => {
            [
              "allow",
              "claim",
              "disallow",
              "kick",
              "lock",
              "name",
              "permit",
              "reject",
              "unlock"
            ].some(ele => ele === value);
          }
        }
      ]
    });
  }

  async run(msg, args) {
    // Allow: Permit user to join your channel
    // Claim: Claim ownership of a channel
    //
  }
};
