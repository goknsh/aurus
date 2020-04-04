const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");
const { voiceCollector } = require("./../../events/ready");

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
        You must be in a voice channel created by joining the Join to Create channel to use any of these commands.
        Control your channel using these commands after you have your own channel.
        The first argument must the the type of command you want to use in your Voice Channel.
        Whenever a sub command allows you to mention users, you may mention as may users as you like.
        Allow: To allow a user or role to join your channel, use \`.v allow @User\` or \`.v a @User 1 @User 2\`; permit and p is alias for allow.
        Bitrate: To change the bitrate (in kbps) of your channel, use \`.v bitrate 60\` or \`.v b 96\`.
        Claim: If the previous owner has left the channel, you may claim it using \`.v claim\` or \`.v c\`.
        Disallow: To disallow a user or role to join your channel, use \`.v disallow @User\` or \`.v d @User 1 @User 2\`.
        Kick: To kick a user from your channel, use \`.v kick @User\` or \`.v k @User 1 @User 2\`; disconnect is an alias for kick.
        Lock: To disallow everyone from joining your channel, use \`.v lock\`, or \`.v l\`.
        Name: To change the name of the channel you are in, use \`.v name New Name\` or \`.v n New Name\`.
        Unlock: To allow everyone to join your channel, use \`.v unlock\` or \`.v u\`.
				Only members who can send messages and connect to the Join to Create channel may use this command.
			`,
      examples: [
        ".v allow @User",
        ".v a @User 1 @User 2",
        ".v permit @User",
        ".v p @User 1 @User 2",
        ".v bitrate 60",
        ".v b 96",
        ".v claim",
        ".v c",
        ".v disallow @User",
        ".v d @User 1 @User 2",
        ".v kick @User",
        ".v k @User 1 @User 2",
        ".v lock",
        ".v l",
        ".v name New Name",
        ".v n New Name",
        ".v unlock",
        ".v u"
      ],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_CHANNELS", "MANAGE_ROLES", "MOVE_MEMBERS"],
      userPermissions: ["SEND_MESSAGES"],
      args: [
        {
          key: "command",
          label: "command",
          prompt: "",
          type: "string",
          default: ""
        }
      ]
    });
  }

  async run(msg, args) {
    if (args.command.length !== 0) {
      if (msg.member.voice.channelID !== undefined) {
        let subCommand = args.command
          .trim()
          .split(" ")[0]
          .toLowerCase();
        let leftover = args.command.trim().split(" ");
        leftover.shift();
        leftover = leftover.join(" ");
        for (let [i, collector] of voiceCollector.entries()) {
          if (collector.children[msg.member.voice.channelID] !== undefined) {
            if (
              collector.children[msg.member.voice.channelID].owner ===
              msg.author.id
            ) {
              // Allow: Permit user to join your channel
              // .v a @ark
              if (
                subCommand === "allow" ||
                subCommand === "a" ||
                subCommand === "permit" ||
                subCommand === "p"
              ) {
                if (msg.mentions.everyone) {
                  await msg.member.voice.channel
                    .createOverwrite(
                      msg.guild.roles.everyone,
                      {
                        CONNECT: true
                      },
                      "User initiated permit command"
                    )
                    .then(async () => {
                      await msg.reply(
                        `everyone is allowed to join your channel`
                      );
                    })
                    .catch(async e => {
                      await msg.reply(
                        `something went wrong while trying to permit everyone to join your channel. Contact an admin on this server.`
                      );
                    });
                } else if (
                  msg.mentions.users.size !== 0 ||
                  msg.mentions.roles.size !== 0
                ) {
                  let beforeMessage = ``;
                  for (let mentionedMember of msg.mentions.users) {
                    await msg.member.voice.channel
                      .createOverwrite(
                        mentionedMember[1].id,
                        { CONNECT: true },
                        "User initiated permit command"
                      )
                      .catch(e => {
                        beforeMessage += `\nSomething went wrong when try to allow <@${mentionedMember[1].id}> to join your channel`;
                      });
                  }
                  for (let mentionedRole of msg.mentions.roles) {
                    await msg.member.voice.channel
                      .createOverwrite(
                        mentionedRole[1].id,
                        { CONNECT: true },
                        "User initiated permit command"
                      )
                      .catch(e => {
                        beforeMessage += `\nSomething went wrong when try to allow the role \`${mentionedRole[1].name}\` to join your channel`;
                      });
                  }
                  if (beforeMessage.length === 0) {
                    await msg.reply(
                      `Done, they should be able to join your channel`
                    );
                  } else {
                    await msg.reply(
                      `${beforeMessage}\nContact an admin on this server.`
                    );
                  }
                } else {
                  await msg.reply(
                    `you need to mention users you want to allow to join your channel`
                  );
                }
              }
              // Bitrate: Set bitrate of a channel
              else if (subCommand === "bitrate" || subCommand === "b") {
                let newBitrate = Number(leftover);
                if (!isNaN(newBitrate) && newBitrate >= 8) {
                  await msg.member.voice.channel
                    .setBitrate(
                      newBitrate * 1000,
                      "User initiated bitrate command"
                    )
                    .then(async channel => {
                      await msg.reply(
                        `channel bitrate set to ${channel.bitrate / 1000}kbps`
                      );
                    })
                    .catch(async e => {
                      if (e.code === 50035) {
                        await msg.reply(
                          `bitrate you set is too high, this high of a bitrate is only supported on boosted servers`
                        );
                      } else {
                        await msg.reply(
                          `something went wrong while trying to set the bitrate on the channel. Contact an admin on this server.`
                        );
                      }
                    });
                } else {
                  await msg.reply(
                    `bitrate not set because a valid number was not entered. The minimum valid bitrate is 8. Correct format: \`.v b 96\``
                  );
                }
              }
              // Claim: Claim ownership of a channel
              // .v c
              else if (subCommand === "claim" || subCommand === "c") {
                await msg.reply(`you already own this channel.`);
              }
              // Disallow: Disallow a user from joining your channel
              // .v d @ark
              else if (subCommand === "disallow" || subCommand === "d") {
                if (msg.mentions.everyone) {
                  await msg.member.voice.channel
                    .createOverwrite(
                      msg.guild.roles.everyone,
                      {
                        CONNECT: false
                      },
                      "User initiated disallow command"
                    )
                    .then(async () => {
                      await msg.reply(
                        `everyone is not allowed to join your channel`
                      );
                    })
                    .catch(async e => {
                      await msg.reply(
                        `something went wrong while trying to disallow everyone from joining your channel. Contact an admin on this server.`
                      );
                    });
                } else if (
                  msg.mentions.users.size !== 0 ||
                  msg.mentions.roles.size !== 0
                ) {
                  let beforeMessage = ``;
                  for (let mentionedMember of msg.mentions.users) {
                    await msg.member.voice.channel
                      .createOverwrite(
                        mentionedMember[1].id,
                        { CONNECT: false },
                        "User initiated disallow command"
                      )
                      .catch(e => {
                        beforeMessage += `\nSomething went wrong when try to disallow <@${mentionedMember[1].id}> from joining your channel`;
                      });
                  }
                  for (let mentionedRole of msg.mentions.roles) {
                    await msg.member.voice.channel
                      .createOverwrite(
                        mentionedRole[1].id,
                        { CONNECT: false },
                        "User initiated disallow command"
                      )
                      .catch(e => {
                        beforeMessage += `\nSomething went wrong when try to disallow the role \`${mentionedRole[1].name}\` from joining76 your channel`;
                      });
                  }
                  if (beforeMessage.length === 0) {
                    await msg.reply(
                      `Done, they should not be able to join your channel`
                    );
                  } else {
                    await msg.reply(
                      `${beforeMessage}\nContact an admin on this server.`
                    );
                  }
                } else {
                  await msg.reply(
                    `you need to mention users you want to disallow from to joining the channel`
                  );
                }
              }
              // Kick: Kick a user out of the channel
              // .v k @ark
              else if (
                subCommand === "disconnect" ||
                subCommand === "kick" ||
                subCommand === "k"
              ) {
                let beforeMessage = ``;
                if (msg.mentions.everyone) {
                  beforeMessage += `\nThe bot will not kick everyone off your channel`;
                }
                if (msg.mentions.roles.size !== 0) {
                  beforeMessage += `\nThe bot will not kick roles off your channel`;
                }
                if (msg.mentions.users.size !== 0) {
                  for (let mentionedMember of msg.mentions.users) {
                    await collector.children[
                      msg.member.voice.channelID
                    ].info.members
                      .get(mentionedMember[1].id)
                      .voice.kick("User initiated kick command")
                      .catch(e => {
                        beforeMessage += `\nSomething went wrong when trying to kick <@${mentionedMember[1].id}> from your channel`;
                      });
                  }
                } else {
                  await msg.reply(
                    `you need to mention users you want to kick from the channel`
                  );
                }
                if (beforeMessage.length === 0) {
                  await msg.reply(`Done, they are kicked from your channel`);
                } else {
                  await msg.reply(
                    `${beforeMessage}\nContact an admin on this server.`
                  );
                }
              }
              // Lock: Disallow everyone from joining your channel
              // .v l
              else if (subCommand === "lock" || subCommand === "l") {
                await msg.member.voice.channel
                  .createOverwrite(
                    msg.guild.roles.everyone,
                    {
                      CONNECT: false
                    },
                    "User initiated lock command"
                  )
                  .then(async () => {
                    await msg.reply(`channel has been locked`);
                  })
                  .catch(async e => {
                    await msg.reply(
                      `something went wrong while trying to lock the channel. Contact an admin on this server.`
                    );
                  });
              }
              // Name: Rename the channel
              // .v n New Name
              else if (subCommand === "name" || subCommand === "n") {
                await msg.member.voice.channel
                  .setName(leftover, "User initiated name command")
                  .then(async channel => {
                    await msg.reply(
                      `channel name changed to \`${channel.name}\``
                    );
                  })
                  .catch(async e => {
                    await msg.reply(
                      `something went wrong while trying to lock the channel. Contact an admin on this server.`
                    );
                  });
              }
              // Unlock: Allow everyone to join your channel
              // .v u
              else if (subCommand === "unlock" || subCommand === "u") {
                await msg.member.voice.channel
                  .createOverwrite(
                    msg.guild.roles.everyone,
                    {
                      CONNECT: true
                    },
                    "User initiated unlock command"
                  )
                  .then(async () => {
                    await msg.reply(
                      `channel has been unlocked for everyone to join`
                    );
                  })
                  .catch(async e => {
                    await msg.reply(
                      `something went wrong while trying to unlock the channel. Contact an admin on this server.`
                    );
                  });
              } else {
                await msg.reply(
                  `sub-command not found. Only allow/a, bitrate/b, claim/c, disallow/d, disconnect, kick/k, lock/l, name/n, permit/p, and unlock/u are allowed. Use \`.help\` if you need more help.`
                );
              }
              break;
            } else {
              if (subCommand === "claim" || subCommand === "c") {
                collector.children[msg.member.voice.channelID].owner =
                  msg.author.id;
                await msg.reply(`you now own this channel.`);
              } else {
                await msg.reply(
                  `you must be the owner of the channel to use these commands. If you are a moderator, you can use the \`.vc\` command.`
                );
              }
            }
          } else if (i === voiceCollector.length - 1) {
            await msg.reply(
              `you must be in a voice channel created by the bot to use voice commands.`
            );
          }
        }
      } else {
        await msg.reply(
          `you must be in a voice channel created by the bot to use voice commands.`
        );
      }
    } else {
      await msg.reply(
        `please supply a sub-command. Only allow/a, bitrate/b, claim/c, disallow/d, disconnect, kick/k, lock/l, name/n, permit/p, and unlock/u are allowed. Use \`.help\` if you need more help.`
      );
    }
  }
};
