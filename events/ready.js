let purgeMessageCollector = [];

module.exports = client => {
  client.user
    .setActivity("for your messages", { type: "WATCHING" })
    .then(async res => {
      console.log(client.user.username + " has logged in.");
      let allSettings = await client.provider.db.all(
        `SELECT CAST(guild as TEXT) as guild, settings from settings`
      );
      let purgeChannelsAll = allSettings.filter(settings => {
        settings.settings = JSON.parse(settings.settings);
        return settings.settings.purgeChannelList != null;
      });
      for (let settings of purgeChannelsAll) {
        for (let purgeChannelList of settings.settings.purgeChannelList) {
          client.channels
            .fetch(purgeChannelList.channel)
            .then(async channel => {
              purgeMessageCollector[purgeChannelList.channel] = await channel
                .createMessageCollector(m => true)
                .on("collect", m => {
                  setTimeout(() => {
                    m.delete();
                  }, purgeChannelList.time * 1000);
                });
            })
            .catch(async e => {
              if (e.code === 10003) {
                await client.provider.set(
                  purgeChannelList.guild,
                  "purgeChannelList",
                  settings.settings.purgeChannelList.filter(list => {
                    return list.channel !== purgeChannelList.channel;
                  })
                );
              }
            });
        }
      }
    });
};
module.exports.purgeMessageCollector = purgeMessageCollector;
