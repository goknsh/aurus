const { oneLine } = require("common-tags");
const { Command } = require("discord.js-commando");

module.exports = class RemoveJoinableRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rjr",
      aliases: ["removejoinablerole"],
      group: "roles",
      memberName: "removejoinablerole",
      description: "Let me know that a role is no longer joinable.",
      details: oneLine`
        The only argument is to mention the role you would like to make no longer joinable.
        Take note that using this command will require you to mention a role, so consider if you need to use this command in a channel where existing members will not get pinged.
        Also note that names of roles should be unique in your server.
				Only members who can manage roles may use this command.
			`,
      examples: [".rjr [roles]", ".rjr @Member", ".rjr @Role 1 @Role 2"],
      guarded: false,
      guildOnly: true,
      clientPermissions: ["MANAGE_ROLES"],
      userPermissions: ["MANAGE_ROLES"],
      args: [
        {
          key: "roles",
          label: "roles",
          prompt: "Mention the role you like to make no longer joinable",
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
    // Add joinable roles to database
    await this.client.provider.set(msg.guild, "joinableRoles", joinableRoles);
    return msg.reply(
      `Role(s) are no longer joinable. There are now ${joinableRoles.length} joinable and removable roles in this server. Type \`.join\` to view joinable roles.`
    );
  }
};
