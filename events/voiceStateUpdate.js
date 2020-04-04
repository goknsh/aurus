const { voiceCollector } = require("./ready");
let purgeMessageCollector = [];

module.exports = async (client, oldState, newState) => {
  if (newState.channelID == null) {
    for (let collector of voiceCollector) {
      if (
        collector.children[oldState.channelID] !== undefined &&
        oldState.channel.members.size === 0
      ) {
        await collector.children[oldState.channelID].info.delete(
          `No users remain in the VC-on-demand channel.`
        );
        break;
      }
    }
  } else if (oldState.channelID !== newState.channelID) {
    for (let collector of voiceCollector) {
      if (collector.origin.id === newState.channelID) {
        client.channels.fetch(collector.origin.id).then(originChannel => {
          client.guilds
            .resolve(collector.origin.guild)
            .channels.create(
              `${newState.member.nickname ||
                newState.member.user.username}'s Channel`,
              {
                type: "voice",
                bitrate: 64000,
                parent: originChannel.parentID
              }
            )
            .then(async childChannel => {
              await newState.setChannel(
                childChannel,
                `User joined an VC-on-demand channel.`
              );
              await childChannel.createOverwrite(
                newState.id,
                {
                  MANAGE_CHANNELS: true
                },
                "User joined an VC-on-demand channel."
              );
              collector.children[childChannel.id] = {
                info: childChannel,
                owner: newState.id
              };
            })
            .catch(e => console.log(e));
        });
        break;
      }
    }
  }
};

module.exports.purgeMessageCollector = purgeMessageCollector;
