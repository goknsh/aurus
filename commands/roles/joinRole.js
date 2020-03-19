const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class JoinRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "join",
      aliases: ["joinrole", "jr"],
      group: "roles",
      memberName: "joinrole",
      description: "List joinable roles or join a role.",
      details: oneLine`
        Join a role in the list of joinable roles.
        Send the name of the role you would to join as an argument, do not mention the role.
        Sending no arguments will list the joinable roles.
				Only members who can send messages may use this command.
			`,
      examples: [".join (role name)", ".join", ".join Member", ".join Role 1"],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_ROLES"],
      userPermissions: ["SEND_MESSAGES"],
      args: [
        {
          key: "role",
          label: "role",
          prompt: "Name of the role you would like to join",
          error:
            "Role was not found, remember, do not mention the role, only name the role you would like to join. Try again.",
          type: "string",
          default: ""
        }
      ]
    });
  }

  async run(msg, args) {
    // Fetch joinable roles
    let joinableRoles = await this.client.provider.get(
      msg.guild,
      "joinableRoles"
    );
    if (joinableRoles == null) joinableRoles = [];
    // List roles
    if (args.role === "") {
      // There are no joinable roles
      if (joinableRoles.length === 0) {
        return msg.reply(`There are no joinable roles in this server.`);
      }
      // Roles exists, continue listing them
      else {
        let listRoles = "";
        // Extract role names
        for (let role of joinableRoles) {
          listRoles += role.name;
          listRoles += "\n";
        }
        // Reply with names of joinable roles
        return msg.reply(
          `Here are the name of the roles you can join:\`\`\`\n${listRoles}\`\`\``
        );
      }
    }
    // Join a role
    else {
      let roleToJoin = joinableRoles.filter(role => {
        return role.name === args.role;
      });
      if (roleToJoin.length === 0) {
        return msg.reply(
          `No role of that name was found. Is it joinable? Type \`.join\` to view joinable roles. Remember, don't mention the role, only name it.`
        );
      } else {
        let guildRole = await msg.guild.roles.fetch(roleToJoin[0].id);
        if (guildRole != null) {
          await msg.member.roles
            .add(guildRole)
            .then(res => {
              return msg.reply(
                `I've assigned the role ${guildRole.name} to you.`
              );
            })
            .catch(error => {
              if (error.httpStatus === 403) {
                return msg.reply(
                  `Contact an admin on this server, I cannot assign this role to you because it is higher than my role in the hierarchy.`
                );
              }
            });
        } else {
          let roleToRemove = joinableRoles.filter(role => {
            return role.name !== args.role;
          });
          // Remove role that no longer exists from the database
          await this.client.provider.set(
            msg.guild,
            "joinableRoles",
            roleToRemove
          );
          return msg.reply(
            `The role does not exist anymore on this server, so it isn't joinable. I've removed it from joinable roles.`
          );
        }
      }
    }
  }
};
