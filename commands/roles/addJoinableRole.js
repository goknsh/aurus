const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class AddJoinableRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ajr",
      aliases: ["addjoinablerole", "joinablerole"],
      group: "roles",
      memberName: "addjoinablerole",
      description: "Let me know that a user can join or remove this role.",
      details: oneLine`
        The only argument is to mention the role you would like to make joinable.
        Take note that using this command will require you to mention a role, so consider if you need to use this command in a channel where existing members will not get pinged.
        Also note that names of roles should be unique in your server.
				Only members who can manage roles may use this command.
			`,
      examples: [".ajr [roles]", ".ajr @Member", ".ajr @Role 1 @Role 2"],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_ROLES"],
      userPermissions: ["MANAGE_ROLES"],
      args: [
        {
          key: "roles",
          label: "roles",
          prompt: "Mention the role you like to make joinable and removable",
          error:
            "Role was not found, remember, you need to mention the role. Try again.",
          infinite: true,
          type: "role"
        }
      ]
    });
  }

  async run(msg, args) {
    let joinableRoles = await this.client.provider.get(
      msg.guild,
      "joinableRoles"
    );
    if (joinableRoles == null) joinableRoles = [];
    // Check for duplicate joinable roles
    joinableRoles = joinableRoles.filter(role => {
      for (let newRole of args.roles) {
        return role.id !== newRole.id;
      }
    });
    // Add joinable roles to array
    let beforeMessage = ``;
    let nameExists = false;
    for (let role of args.roles) {
      if (role.managed) {
        beforeMessage += `\nCannot add ${role.name} as a joinable and removable role because it is a role managed by an integration.\n`;
      } else {
        for (let oldRoles of joinableRoles) {
          if (oldRoles.name === role.name) nameExists = true;
        }
        if (nameExists) {
          beforeMessage += `\nCannot add ${role.name} as joinable and removable role because there is already a joinable and removable role with that name.\n`;
        } else {
          beforeMessage += `\n${role.name} is now a joinable and removable role.\n`;
          joinableRoles.push(role.toJSON());
        }
      }
    }
    // Add joinable roles to database
    await this.client.provider.set(msg.guild, "joinableRoles", joinableRoles);
    return msg.reply(
      `${beforeMessage}\nThere are now ${joinableRoles.length} joinable and removable roles in this server. Type \`.join\` to view joinable roles.`
    );
  }
};
