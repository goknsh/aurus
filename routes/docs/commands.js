const express = require("express");
const router = express.Router();

router.get("/ban", (req, res, next) => {
	res.render("docs/commands/ban", { title: "ban - Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/clear", (req, res, next) => {
	res.render("docs/commands/clear", { title: "clear - Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/help", (req, res, next) => {
	res.render("docs/commands/help", { title: "help - Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/kick", (req, res, next) => {
	res.render("docs/commands/kick", { title: "kick - Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

module.exports = router;
