let purgeMessageCollector = [];
module.exports = client => {
  client.user
    .setActivity("for your messages", { type: "WATCHING" })
    .then(async res => {
      console.log(client.user.username + " has logged in.");
      let allSettings = await client.provider.db.all(
        `SELECT CAST(guild as TEXT) as guild, settings from settings`
      );
      allSettings = allSettings.filter(settings => {
        settings.settings = JSON.parse(settings.settings);
        return settings.settings.purgeChannelList != null;
      });
      for (let settings of allSettings) {
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
            });
        }
      }
    });
};
module.exports.purgeMessageCollector = purgeMessageCollector;
