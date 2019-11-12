const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
	res.render("docs/commands/index", { title: "Introduction // Commands", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/ban", (req, res, next) => {
	res.render("docs/commands/ban", { title: "ban // Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/clear", (req, res, next) => {
	res.render("docs/commands/clear", { title: "clear // Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/help", (req, res, next) => {
	res.render("docs/commands/help", { title: "help // Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/kick", (req, res, next) => {
	res.render("docs/commands/kick", { title: "kick // Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/ping", (req, res, next) => {
	res.render("docs/commands/ping", { title: "ping // Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/template", (req, res, next) => {
	res.render("docs/commands/template", { title: "template // Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/track", (req, res, next) => {
	res.render("docs/commands/track", { title: "track // Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

module.exports = router;
