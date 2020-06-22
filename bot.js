require("dotenv").config();
const Commando = require("discord.js-commando");
const path = require("path");
const fs = require("fs").promises;
const sqlite = require("sqlite");
const client = new Commando.CommandoClient({
  commandPrefix: process.env.PREFIX,
  owner: process.env.OWNER,
  invite: process.env.INVITE,
  unknownCommandResponse: false
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ["fun", "Fun"],
    ["moderation", "Moderation"],
    ["roles", "Roles"],
    ["voice", "Voice"]
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

client
  .setProvider(
    sqlite
      .open(path.join(__dirname, "database", "main.db"))
      .then(db => new Commando.SQLiteProvider(db))
  )
  .catch(console.error);

fs.readdir(path.join(__dirname, "events"))
  .then(files => files.filter(file => file.endsWith(".js")))
  .then(files =>
    files.forEach(file => {
      let eventName = file.substr(0, file.indexOf(".js"));
      let event = require(path.join(__dirname, "events", eventName));
      client.on(eventName, event.bind(null, client));
    })
  )
  .catch(err => console.log(err));

client.login(process.env.TOKEN);
