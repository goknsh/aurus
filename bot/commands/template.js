const Sequelize = require("sequelize");
const Discord = require("discord.js");
const path = require("path");
const logger = require("./../../logger");

const database = new Sequelize("database", process.env.DB_USER, process.env.DB_PASSWORD, {
	dialect: "sqlite",
	logging: (message) => logger.db.info(message),
	storage: "bot/database.sqlite",
});

module.exports = {
	name: "template",
	description: "Command to create templates or use existing templates",
	args: true,
	argsUsage: "<create/update/delete/use/get> <template id>",
	cooldown: 0.1,
	permissions: ["ADMINISTRATOR"],
	serverOnly: true,
	async execute(message, args) {
		const Templates = database.import(path.join(__dirname, "..", "models", "templates.js"));
		if (args[0] === "create" || args[0] === "update") {
			// Record Roles
			let roles = message.guild.roles.sort((a, b) => b.position - a.position).map(role => {
				return {
					idOld: role.id,
					name: role.name,
					hexColor: role.hexColor,
					hoist: role.hoist,
					mentionable: role.mentionable,
					position: role.position,
					rawPosition: role.rawPosition,
					defaultRole: message.guild.roles.everyone.id === role.id,
					permBitfield: role.permissions.bitfield,
				};
			});
			// Record Channels
			let channels = {
				category: message.guild.channels.filter(channel => channel.type === "category").sort((a, b) => b.position - a.position).map(category => {
					return {
						idOld: category.id,
						name: category.name,
						position: category.position,
						rawPosition: category.rawPosition,
						permOverwrites: category.permissionOverwrites.filter(overwrites => overwrites.type === "role").filter(overwrites => message.guild.roles.has(overwrites.id)).map(overwrites => {
							return {
								id: overwrites.id,
								allowed: overwrites.allow.bitfield,
								denied: overwrites.deny.bitfield,
							};
						}),
					};
				}),
				text: message.guild.channels.filter(channel => channel.type === "text").sort((a, b) => b.position - a.position).map(text => {
					return {
						id: text.id,
						name: text.name,
						topic: text.topic,
						nsfw: text.nsfw,
						isSystemChannel: message.guild.systemChannelID === text.id,
						position: text.position,
						rawPosition: text.rawPosition,
						parentCat: text.parentID,
						permLocked: text.permissionsLocked ? text.permissionsLocked : false,
						permOverwrites: text.permissionsLocked ? null : text.permissionOverwrites.filter(overwrites => overwrites.type === "role").filter(overwrites => message.guild.roles.has(overwrites.id)).map(overwrites => {
							return {
								id: overwrites.id,
								allowed: overwrites.allow.bitfield,
								denied: overwrites.deny.bitfield,
							};
						}),
					};
				}),
				voice: message.guild.channels.filter(channel => channel.type === "voice").sort((a, b) => b.position - a.position).map(voice => {
					return {
						id: voice.id,
						name: voice.name,
						position: voice.position,
						rawPosition: voice.rawPosition,
						parentCat: voice.parentID,
						bitrate: voice.bitrate,
						userLimit: voice.userLimit,
						isAfkChannel: message.guild.afkChannelID === voice.id,
						permLocked: voice.permissionsLocked ? voice.permissionsLocked : false,
						permOverwrites: voice.permissionsLocked ? null : voice.permissionOverwrites.filter(overwrites => overwrites.type === "role").filter(overwrites => message.guild.roles.has(overwrites.id)).map(overwrites => {
							return {
								id: overwrites.id,
								allowed: overwrites.allow.bitfield,
								denied: overwrites.deny.bitfield,
							};
						}),
					};
				}),
			};
			let emojis = message.guild.emojis.map(emoji => {
				return {
					name: emoji.name,
					url: emoji.url,
					animated: emoji.animated,
				};
			});
			if (args[0] === "create") {
				Templates.create({
					id: message.guild.id,
					name: message.guild.name,
					region: message.guild.region,
					icon: message.guild.iconURL(),
					defaultMessageNotifications: message.guild.defaultMessageNotifications,
					verificationLevel: message.guild.verificationLevel,
					afkTimeout: message.guild.afkTimeout,
					explicitContentFilter: message.guild.explicitContentFilter,
					banner: message.guild.bannerURL(),
					splash: message.guild.splashURL(),
					channels: channels,
					emojis: emojis,
					roles: roles,
				}).then(() => {
					return message.reply(`template created successfully; check it out: ${process.env.WEBSITE}/template/${message.guild.id}`);
				}).catch(error => {
					if (error.name === "SequelizeUniqueConstraintError") {
						return message.reply(`a template of this server already exists here: ${process.env.WEBSITE}/template/${message.guild.id}. If you want to update this template, use the \`update\` argument.`);
					}
					else {
						logger.bot.error(error);
						return message.reply("there was an error trying to execute that command. We've recorded the error and will fix it soon.");
					}
				});
			}
			else if (args[0] === "update") {
				Templates.update({
					id: message.guild.id,
					name: message.guild.name,
					region: message.guild.region,
					icon: message.guild.iconURL({ format: "png" }),
					defaultMessageNotifications: message.guild.defaultMessageNotifications,
					verificationLevel: message.guild.verificationLevel,
					afkTimeout: message.guild.afkTimeout,
					explicitContentFilter: message.guild.explicitContentFilter,
					banner: message.guild.bannerURL({ format: "png" }),
					splash: message.guild.splashURL({ format: "png" }),
					channels: channels,
					emojis: emojis,
					roles: roles,
				}, { where: { id: message.guild.id } }).then(updated => {
					if (updated[0] === 0) {
						message.reply(`template for this server does not exist`);
					}
					else {
						message.reply(`template updated successfully; check it out: ${process.env.WEBSITE}/template/${message.guild.id}`);
					}
				}).catch(error => {
					logger.bot.error(error);
					return message.reply("there was an error trying to execute that command. We've recorded the error and will fix it soon.");
				});
			}
		}
		else if (args[0] === "delete") {
			Templates.destroy({ where: { id: message.guild.id } }).then(deleted => {
				if (deleted === 0) {
					message.reply(`template for this server does not exist`);
				}
				else {
					message.reply(`template ${message.guild.id} was deleted`);
				}
			}).catch(error => {
				logger.bot.error(error);
				return message.reply("there was an error trying to execute that command. We've recorded the error and will fix it soon.");
			});
		}
		else if (args[0] === "use") {
			try {
				await message.author.send("We are applying the template to the server; we'll let you know once it is done");
				const template = await Templates.findOne({ where: { id: args[1] } });
				if (template) {
					let promises = [];
					message.guild.channels.forEach(channel => {
						promises.push(channel.delete());
					});
					await Promise.all(promises);
					promises = [];

					message.guild.roles.filter(role => role.id !== message.guild.roles.highest.id && role.id !== message.guild.roles.everyone.id && !role.managed).forEach(role => {
						promises.push(role.delete());
					});
					await Promise.all(promises);
					promises = [];

					message.guild.emojis.forEach(emoji => {
						promises.push(emoji.delete());
					});
					await Promise.all(promises);
					promises = [];

					template.references = {};
					template.references.roles = new Discord.Collection();
					template.references.category = new Discord.Collection();
					let nGuild = message.guild;

					await nGuild.setName(template.name);
					await nGuild.setIcon(template.icon);
					await nGuild.setVerificationLevel(template.verificationLevel);
					await nGuild.setExplicitContentFilter(template.explicitContentFilter);
					await nGuild.setDefaultMessageNotifications(template.defaultMessageNotifications);

					if (nGuild.premiumTier === 1 && template.splash) await nGuild.setSplash(template.splash);
					if (nGuild.premiumTier === 3 && template.splash) await nGuild.setSplash(template.splash);
					if (nGuild.premiumTier === 3 && template.banner) await nGuild.setSplash(template.banner);

					console.log(template.roles.length);
					if (template.roles.length) {
						await template.roles.forEach(role => {
							if (role.defaultRole) {
								promises.push(nGuild.roles.everyone.setPermissions(role.permBitfield));
								template.references.roles.set(role.idOld, { new: nGuild.roles.everyone, old: role });
							}
							else {
								promises.push(nGuild.roles.create({
									data: {
										name: role.name,
										color: role.hexColor,
										hoist: role.hoist,
										mentionable: role.mentionable,
										permissions: role.permBitfield,
									},
								}).then(newRole => {
									template.references.roles.set(role.idOld, { new: newRole, old: role });
								}));
							}
						});
						await Promise.all(promises);
					}
					promises = [];

					if (template.channels.category.length) {
						await template.channels.category.reverse().forEach(category => {
							let options = {
								type: "category",
								permissionOverwrites: category.permOverwrites.map(overwrites => {
									return {
										id: template.references.roles.get(overwrites.id).new.id,
										allow: new Discord.Permissions(overwrites.allowed),
										deny: new Discord.Permissions(overwrites.denied),
									};
								}),
							};
							if (category.position) {
								options.position = category.position;
							}
							promises.push(nGuild.channels.create(category.name, options).then(newCategory => {
								template.references.category.set(category.idOld, { new: newCategory, old: category });
							}));
						});
						await Promise.all(promises);
					}
					promises = [];

					if (template.channels.text.length) {
						let setSystemChannel = null;
						let channelTopics = new Discord.Collection();
						await template.channels.text.reverse().forEach(text => {
							let options = {
								type: "text",
								nsfw: text.nsfw,
							};
							if (text.position) {
								options.position = text.position;
							}
							if (text.parentCat) {
								options.parent = template.references.category.get(text.parentCat).new.id;
							}
							if (!text.permLocked) {
								options.permissionOverwrites = text.permOverwrites.map(overwrites => {
									return {
										id: template.references.roles.get(overwrites.id).new.id,
										allow: new Discord.Permissions(overwrites.allowed),
										deny: new Discord.Permissions(overwrites.denied),
									};
								});
							}
							promises.push(nGuild.channels.create(text.name, options).then(newText => {
								if (text.isSystemChannel) setSystemChannel = newText.id;
								if (text.topic) channelTopics.set(newText.id, { newCh: newText, topic: text.topic });
							}));
						});
						await Promise.all(promises);
						if (setSystemChannel) await nGuild.setSystemChannel(setSystemChannel);
						promises = [];
						channelTopics.forEach(ch => promises.push(ch.newCh.setTopic(ch.topic)));
						await Promise.all(promises);
					}
					promises = [];

					if (template.channels.voice.length) {
						let setAFKChannel = null;
						const adjustBitrate = (bitrate = 64000, tier = 0) => {
							if (tier === 0) return bitrate > 96000 ? 96000 : bitrate < 8000 ? 8000 : bitrate;
							if (tier === 1) return bitrate > 128000 ? 128000 : bitrate < 8000 ? 8000 : bitrate;
							if (tier === 2) return bitrate > 256000 ? 256000 : bitrate < 8000 ? 8000 : bitrate;
							if (tier === 3) return bitrate > 384000 ? 384000 : bitrate < 8000 ? 8000 : bitrate;
						};
						const verifyUserLimit = limit => {
							if (limit < 0) {
								return 0;
							}
							else if (limit > 99) {
								return 99;
							}
							else {
								return limit;
							}
						};
						await template.channels.voice.reverse().forEach(voice => {
							let options = {
								type: "voice",
								bitrate: adjustBitrate(voice.bitrate, nGuild.premiumTier),
								userLimit: verifyUserLimit(voice.userLimit),
							};
							if (voice.position) {
								options.position = voice.position;
							}
							if (voice.parentCat) {
								options.parent = template.references.category.get(voice.parentCat).new.id;
							}
							if (!voice.permLocked) {
								options.permissionOverwrites = voice.permOverwrites.map(overwrites => {
									return {
										id: template.references.roles.get(overwrites.id).new.id,
										allow: new Discord.Permissions(overwrites.allowed),
										deny: new Discord.Permissions(overwrites.denied),
									};
								});
							}
							promises.push(nGuild.channels.create(voice.name, options).then(newVoice => {
								if (voice.isAfkChannel) setAFKChannel = newVoice.id;
							}));
						});
						await Promise.all(promises);
						if (setAFKChannel) await nGuild.setAFKChannel(setAFKChannel);
						await nGuild.setAFKTimeout(template.afkTimeout);
					}
					promises = [];

					if (template.emojis.length) {
						let emojisNormal = template.emojis.filter(e => !e.animated);
						let emojisAnimated = template.emojis.filter(e => e.animated);
						if (nGuild.premiumTier === 0) {
							emojisNormal = emojisNormal.filter((e, i) => i < 50);
							emojisAnimated = emojisAnimated.filter((e, i) => i < 50);
						}
						if (nGuild.premiumTier === 1) {
							emojisNormal = emojisNormal.filter((e, i) => i < 100);
							emojisAnimated = emojisAnimated.filter((e, i) => i < 100);
						}
						if (nGuild.premiumTier === 2) {
							emojisNormal = emojisNormal.filter((e, i) => i < 150);
							emojisAnimated = emojisAnimated.filter((e, i) => i < 150);
						}
						if (nGuild.premiumTier === 3) {
							emojisNormal = emojisNormal.filter((e, i) => i < 250);
							emojisAnimated = emojisAnimated.filter((e, i) => i < 250);
						}
						emojisNormal.forEach(emoji => {
							promises.push(nGuild.emojis.create(emoji.url, emoji.name));
						});
						emojisAnimated.forEach(emoji => {
							promises.push(nGuild.emojis.create(emoji.url, emoji.name));
						});
						await Promise.all(promises);
					}
					template.increment("uses");
					await message.author.send("Template was successfully applied to server");
				}
				else {
					await message.reply(`template id \`${args[1]}\` does not exist`);
				}
			} catch (error) {
				console.log(error);
				await message.author.send("Something went wrong when trying to use template. We've recorded the error and will work on fixing it");
				logger.bot.error(error);
			}
		}
		else if (args[0] === "get") {
			return message.reply(`if a template of this server was created, then the template id is: \`${message.guild.id}\``);
		}
		else {
			return message.reply("an invalid argument was provided, valid arguments include: `create`, `delete`, `update` and `use`.");
		}
	},
};
