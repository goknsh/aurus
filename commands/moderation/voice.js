const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class VoiceControl extends Command {
  constructor(client) {
    super(client, {
      name: "voicecontrol",
      aliases: ["vc", "vm"],
      group: "moderation",
      memberName: "voicecontrol",
      description: "Control voice channels with ease.",
      details: oneLine`
        Control your voice channels using these commands.
        You must be in a voice channel to use this command.
        The first argument must the the type of command you want to use in your Voice Channel.
        Whenever a sub command allows you to mention users, you may mention as may users as you like.
        Allow: To allow a user or role to join your channel, use \`.v allow @User\` or \`.v a @User 1 @User 2\`; permit and p is alias for allow.
        Bitrate: To change the bitrate (in kbps) of your channel, use \`.v bitrate 60\` or \`.v b 96\`.
        Deafen: To deafen a user, use \`.v deafen @User\` or \`.v df @User 1 @User 2\`.
        Disallow: To disallow a user or role to join your channel, use \`.v disallow @User\` or \`.v d @User 1 @User 2\`.
        Kick: To kick a user from your channel, use \`.v kick @User\` or \`.v k @User 1 @User 2\`; disconnect is an alias for kick.
        Lock: To disallow everyone from joining your channel, use \`.v lock\`, or \`.v l\`.
        Move: To move a user to a new channel, use \`.v move @User channel_id\`, \`.v mo @User 1 @User 2 channel_id\`.
        Mute: To mute a user, use \`.v mute @User\` or \`.v m @User 1 @User 2\`.
        Name: To change the name of the channel you are in, use \`.v name New Name\` or \`.v n New Name\`.
        Undeafen: To undeafen a user, use \`.v undeafen @User\` or \`.v udf @User 1 @User 2\`.
        Unlock: To allow everyone to join your channel, use \`.v unlock\` or \`.v u\`.
        Unmute: To unmute a user, use \`.v unmute @User\` or \`.v um @User 1 @User 2\`.
				Only members who can manage channels and roles, deafen and move members may use this command.
			`,
      examples: [
        ".vc allow @User",
        ".vc a @User 1 @User 2",
        ".vc permit @User",
        ".vc p @User 1 @User 2",
        ".vc bitrate 60",
        ".vc b 96",
        ".vc disallow @User",
        ".vc d @User 1 @User 2",
        ".vc deafen @User",
        ".vc df @User 1 @User 2",
        ".vc kick @User",
        ".vc k @User 1 @User 2",
        ".vc lock",
        ".vc l",
        ".vc move @User 1 696041692205285450",
        ".vc mo @User 1 @User 2 696041692205285450",
        ".vc mute @User",
        ".vc m @User 1 @User 2",
        ".vc name New Name",
        ".vc n New Name",
        ".vc undeafen @User",
        ".vc udf @User 1 @User 2",
        ".vc unlock",
        ".vc u",
        ".vc unmute @User",
        ".vc um @User 1 @User 2"
      ],
      guarded: false,
      guildOnly: true,
      clientPermissions: [
        "DEAFEN_MEMBERS",
        "MANAGE_CHANNELS",
        "MANAGE_ROLES",
        "MOVE_MEMBERS",
        "MUTE_MEMBERS"
      ],
      userPermissions: [
        "DEAFEN_MEMBERS",
        "MANAGE_CHANNELS",
        "MANAGE_ROLES",
        "MOVE_MEMBERS",
        "MUTE_MEMBERS",
        "SEND_MESSAGES"
      ],
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
                `${msg.author.id} initiated permit command`
              )
              .then(async () => {
                await msg.reply(`everyone is allowed to join the channel`);
              })
              .catch(async e => {
                await msg.reply(
                  `something went wrong while trying to permit everyone to join the channel. Try using Discord's UI instead.`
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
                  `${msg.author.id} initiated permit command`
                )
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when try to allow <@${mentionedMember[1].id}> to join the channel`;
                });
            }
            for (let mentionedRole of msg.mentions.roles) {
              await msg.member.voice.channel
                .createOverwrite(
                  mentionedRole[1].id,
                  { CONNECT: true },
                  `${msg.author.id} initiated permit command`
                )
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when try to allow the role \`${mentionedRole[1].name}\` to join the channel`;
                });
            }
            if (beforeMessage.length === 0) {
              await msg.reply(`Done, they should be able to join the channel`);
            } else {
              await msg.reply(
                `${beforeMessage}\nTry using Discord's UI instead.`
              );
            }
          } else {
            await msg.reply(
              `you need to mention users you want to allow to join the channel`
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
                `${msg.author.id} initiated bitrate command`
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
                    `something went wrong while trying to set the bitrate on the channel. Try using Discord's UI instead.`
                  );
                }
              });
          } else {
            await msg.reply(
              `bitrate not set because a valid number was not entered. The minimum valid bitrate is 8. Correct format: \`.vc b 96\``
            );
          }
        }
        // Deafen: Deafen a user in your channel
        // .v df @ark
        else if (subCommand === "deafen" || subCommand === "df") {
          let beforeMessage = ``;
          if (msg.mentions.everyone) {
            beforeMessage += `\nThe bot will not deafen everyone`;
          }
          if (msg.mentions.roles.size !== 0) {
            beforeMessage += `\nThe bot will not deafen roles`;
          }
          if (msg.mentions.users.size !== 0) {
            for (let mentionedMember of msg.mentions.users) {
              await msg.guild
                .member(mentionedMember[1])
                .voice.setDeaf(
                  true,
                  `${msg.author.id} initiated deafen command`
                )
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when trying to deafen <@${mentionedMember[1].id}> in your channel`;
                });
            }
          } else {
            await msg.reply(
              `you need to mention users you want to deafen in your channel`
            );
          }
          if (beforeMessage.length === 0) {
            await msg.reply(`Done, they are deafened in your channel`);
          } else {
            await msg.reply(
              `${beforeMessage}\nTry using Discord's UI instead.`
            );
          }
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
                `${msg.author.id} initiated disallow command`
              )
              .then(async () => {
                await msg.reply(`everyone is not allowed to join the channel`);
              })
              .catch(async e => {
                await msg.reply(
                  `something went wrong while trying to disallow everyone from joining the channel. Try using Discord's UI instead.`
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
                  `${msg.author.id} initiated disallow command`
                )
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when try to disallow <@${mentionedMember[1].id}> from joining the channel`;
                });
            }
            for (let mentionedRole of msg.mentions.roles) {
              await msg.member.voice.channel
                .createOverwrite(
                  mentionedRole[1].id,
                  { CONNECT: false },
                  `${msg.author.id} initiated disallow command`
                )
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when try to disallow the role \`${mentionedRole[1].name}\` from joining the channel`;
                });
            }
            if (beforeMessage.length === 0) {
              await msg.reply(
                `Done, they should not be able to join the channel`
              );
            } else {
              await msg.reply(
                `${beforeMessage}\nTry using Discord's UI instead.`
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
            beforeMessage += `\nThe bot will not kick everyone`;
          }
          if (msg.mentions.roles.size !== 0) {
            beforeMessage += `\nThe bot will not kick roles`;
          }
          if (msg.mentions.users.size !== 0) {
            for (let mentionedMember of msg.mentions.users) {
              await msg.guild
                .member(mentionedMember[1])
                .voice.kick(`${msg.author.id} initiated kick command`)
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when trying to kick <@${mentionedMember[1].id}> from the channel`;
                });
            }
          } else {
            await msg.reply(
              `you need to mention users you want to kick from the channel`
            );
          }
          if (beforeMessage.length === 0) {
            await msg.reply(`Done, they are kicked from the channel`);
          } else {
            await msg.reply(
              `${beforeMessage}\nTry using Discord's UI instead.`
            );
          }
        }
        // Lock: Disallow everyone from joining your channel
        else if (subCommand === "lock" || subCommand === "l") {
          await msg.member.voice.channel
            .createOverwrite(
              msg.guild.roles.everyone,
              {
                CONNECT: false
              },
              `${msg.author.id} initiated lock command`
            )
            .then(async () => {
              await msg.reply(`channel has been locked`);
            })
            .catch(async e => {
              await msg.reply(
                `something went wrong while trying to lock the channel. Try using Discord's UI instead.`
              );
            });
        }
        // Move: Move a user to another channel
        // .v m @ark
        else if (subCommand === "move" || subCommand === "mo") {
          let beforeMessage = ``;
          if (msg.mentions.everyone) {
            beforeMessage += `\nThe bot will not move everyone`;
          }
          if (msg.mentions.roles.size !== 0) {
            beforeMessage += `\nThe bot will not move roles`;
          }
          if (msg.mentions.users.size !== 0) {
            for (let mentionedMember of msg.mentions.users) {
              await msg.guild
                .member(mentionedMember[1])
                .voice.setChannel(
                  leftover
                    .trim()
                    .split(" ")
                    .pop(),
                  `${msg.author.id} initiated move command`
                )
                .catch(e => {
                  if (e.code === 40032) {
                    beforeMessage += `\n<@${mentionedMember[1].id}> is not in a voice channel`;
                  } else {
                    beforeMessage += `\nSomething went wrong when trying to move <@${mentionedMember[1].id}> to the channel`;
                  }
                });
            }
          } else {
            await msg.reply(
              `you need to mention users you want to move to the channel`
            );
          }
          if (beforeMessage.length === 0) {
            await msg.reply(`Done, they are moved to the channel`);
          } else {
            await msg.reply(
              `${beforeMessage}\nTry using Discord's UI instead.`
            );
          }
        }
        // Mute: Mute a user in your channel
        // .v m @ark
        else if (subCommand === "mute" || subCommand === "m") {
          let beforeMessage = ``;
          if (msg.mentions.everyone) {
            beforeMessage += `\nThe bot will not mute everyone`;
          }
          if (msg.mentions.roles.size !== 0) {
            beforeMessage += `\nThe bot will not mute roles`;
          }
          if (msg.mentions.users.size !== 0) {
            for (let mentionedMember of msg.mentions.users) {
              await msg.guild
                .member(mentionedMember[1])
                .voice.setMute(true, `${msg.author.id} initiated mute command`)
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when trying to mute <@${mentionedMember[1].id}> in the channel`;
                });
            }
          } else {
            await msg.reply(
              `you need to mention users you want to mute in the channel`
            );
          }
          if (beforeMessage.length === 0) {
            await msg.reply(`Done, they are muted in the channel`);
          } else {
            await msg.reply(
              `${beforeMessage}\nTry using Discord's UI instead.`
            );
          }
        }
        // Name: Rename the channel
        // .v n New Name
        else if (subCommand === "name" || subCommand === "n") {
          await msg.member.voice.channel
            .setName(leftover, `${msg.author.id} initiated name command`)
            .then(async channel => {
              await msg.reply(`channel name changed to \`${channel.name}\``);
            })
            .catch(async e => {
              await msg.reply(
                `something went wrong while trying to lock the channel. Try using Discord's UI instead.`
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

              `${msg.author.id} initiated unlock command`
            )
            .then(async () => {
              await msg.reply(`channel has been unlocked for everyone to join`);
            })
            .catch(async e => {
              await msg.reply(
                `something went wrong while trying to unlock the channel. Try using Discord's UI instead.`
              );
            });
        }
        // Undeafen: Undeafen a user in your channel
        // .v udf @ark
        else if (subCommand === "undeafen" || subCommand === "udf") {
          let beforeMessage = ``;
          if (msg.mentions.everyone) {
            beforeMessage += `\nThe bot will not undeafen everyone`;
          }
          if (msg.mentions.roles.size !== 0) {
            beforeMessage += `\nThe bot will not undeafen roles`;
          }
          if (msg.mentions.users.size !== 0) {
            for (let mentionedMember of msg.mentions.users) {
              await msg.guild
                .member(mentionedMember[1])
                .voice.setDeaf(
                  false,
                  `${msg.author.id} initiated undeafen command`
                )
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when trying to undeafen <@${mentionedMember[1].id}> in the channel`;
                });
            }
          } else {
            await msg.reply(
              `you need to mention users you want to undeafen in the channel`
            );
          }
          if (beforeMessage.length === 0) {
            await msg.reply(`Done, they are undeafen in the channel`);
          } else {
            await msg.reply(
              `${beforeMessage}\nTry using Discord's UI instead.`
            );
          }
        }
        // Unmute: Unmute a user in your channel
        // .v unmute @ark
        else if (subCommand === "unmute" || subCommand === "um") {
          let beforeMessage = ``;
          if (msg.mentions.everyone) {
            beforeMessage += `\nThe bot will not unmute everyone`;
          }
          if (msg.mentions.roles.size !== 0) {
            beforeMessage += `\nThe bot will not unmute roles`;
          }
          if (msg.mentions.users.size !== 0) {
            for (let mentionedMember of msg.mentions.users) {
              await msg.guild
                .member(mentionedMember[1])
                .voice.setMute(
                  false,
                  `${msg.author.id} initiated unmute command`
                )
                .catch(e => {
                  beforeMessage += `\nSomething went wrong when trying to unmute <@${mentionedMember[1].id}> in the channel`;
                });
            }
          } else {
            await msg.reply(
              `you need to mention users you want to unmute in the channel`
            );
          }
          if (beforeMessage.length === 0) {
            await msg.reply(`Done, they are unmuted in the channel`);
          } else {
            await msg.reply(
              `${beforeMessage}\nTry using Discord's UI instead.`
            );
          }
        } else {
          await msg.reply(
            `sub-command not found. Only allow/a, bitrate/b, deafen/df, disallow/d, disconnect, kick/k, lock/l, name/n, permit/p, undeafened/udf, unlock/u and unmute/um are allowed. Use \`.help\` if you need more help.`
          );
        }
      } else {
        await msg.reply(
          `You need to be in the voice channel for which you want to change things.`
        );
      }
    } else {
      await msg.reply(
        `please supply a sub-command. Allow/a, bitrate/b, deafen/df, disallow/d, disconnect, kick/k, lock/l, name/n, permit/p, undeafened/udf, unlock/u and unmute/um are allowed. Use \`.help\` if you need more help.`
      );
    }
  }
};
