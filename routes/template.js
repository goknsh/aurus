const express = require("express");
const router = express.Router();
const path = require("path");
const Sequelize = require("sequelize");
const logger = require("./../logger");

const database = new Sequelize("database", process.env.DB_USER, process.env.DB_PASSWORD, {
	dialect: "sqlite",
	logging: (message) => logger.db.info(message),
	storage: "bot/database.sqlite",
});

// GET home page
router.get("/:id", (req, res, next) => {
	const Templates = database.import(path.join(__dirname, "..", "bot", "models", "templates.js"));
	Templates.findOne({ where: { id: req.params.id } }).then(template => {
		res.render("template", { title: "Template", template: template, CLIENT_ID: process.env.CLIENT_ID });
	});
});

module.exports = router;
