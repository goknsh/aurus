const winston = require("winston");
const expressWinston = require("express-winston");

const express = expressWinston.logger({
	transports: [
		new winston.transports.File({ filename: "logs/website/combined.log" }),
		new winston.transports.File({ filename: "logs/website/info.log", level: "info" }),
		new winston.transports.File({ filename: "logs/website/warn.log", level: "warn" }),
		new winston.transports.File({ filename: "logs/website/error.log", level: "error" }),
		new winston.transports.File({ filename: "logs/website/critical.log", level: "critical" }),
	],
	meta: true,
	statusLevels: false,
	level: (req, res) => {
		let level = "";
		if (res.statusCode >= 100) {
			level = "info";
		}
		if (res.statusCode >= 400) {
			level = "warn";
		}
		if (res.statusCode >= 500) {
			level = "error";
		}
		if (res.statusCode === 401 || res.statusCode === 403) {
			level = "critical";
		}
		return level;
	},
});

const db = new winston.createLogger({
	transports: [
		new winston.transports.File({ filename: "logs/database/combined.log" }),
		new winston.transports.File({ filename: "logs/database/info.log", level: "info" }),
		new winston.transports.File({ filename: "logs/database/error.log", level: "error" }),
	],
	format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.colorize()),
});

const bot = new winston.createLogger({
	transports: [
		new winston.transports.File({ filename: "logs/bot/combined.log" }),
		new winston.transports.File({ filename: "logs/bot/info.log", level: "info" }),
		new winston.transports.File({ filename: "logs/bot/error.log", level: "error" }),
	],
	format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.colorize()),
});

module.exports = {
	express,
	db,
	bot,
};
