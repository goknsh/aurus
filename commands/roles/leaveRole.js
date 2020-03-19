const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class LeaveRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "leave",
      aliases: ["leavejoinedrole", "lr"],
      group: "roles",
      memberName: "leavejoinedrole",
      description: "List joinable roles or removes a joined role.",
      details: oneLine`
        Remove a role you have in the list of joinable roles.
        Send the name of the role you would like removed as an argument, do not mention the role.
        Sending no arguments will list the removable roles.
				Only members who can send messages may use this command.
			`,
      examples: [".leave (role name)", ".leave", ".leave Member", ".leave Role 1"],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_ROLES"],
      userPermissions: ["SEND_MESSAGES"],
      args: [
        {
          key: "role",
          label: "role",
          prompt: "Name of the role you would like to remove from yourself",
          error:
            "Role was not found, remember, do not mention the role, only name the role you would like to remove. Try again.",
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
    // List roles
    if (args.role === "") {
      if (joinableRoles == null) joinableRoles = [];
      // There are no joinable roles
      if (joinableRoles.length === 0) {
        return msg.reply(`There are no removable roles in this server.`);
      }
      // Roles exists, continue listing them
      else {
        let listRoles = "";
        // Extract role names
        for (let role of joinableRoles) {
          listRoles += role.name;
          listRoles += "\n";
        }
        // Reply with names of removable roles
        return msg.reply(
          `Here are the name of the roles you can remove:\`\`\`\n${listRoles}\`\`\``
        );
      }
    }
    // Remove a role
    else {
      let roleToRemove = joinableRoles.filter(role => {
        return role.name === args.role;
      });
      if (roleToRemove.length === 0) {
        return msg.reply(
          `No role of that name was found. Is it removable? Type \`.rmr\` to view removable roles. Remember, don't mention the role, only name it.`
        );
      } else {
        let guildRole = await msg.guild.roles.fetch(roleToRemove[0].id);
        await msg.member.roles
          .remove(guildRole)
          .then(res => {
            return msg.reply(
              `I've removed the role ${guildRole.name} from you.`
            );
          })
          .catch(error => {
            if (error.httpStatus === 403) {
              return msg.reply(
                `Contact an admin on this server, I cannot remove this role to you because it is higher than my role in the hierarchy.`
              );
            }
          });
      }
    }
  }
};
