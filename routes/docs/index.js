const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
	res.render("docs/index", { title: "Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/changelog", (req, res, next) => {
	res.render("docs/changelog", { title: "Changelog", CLIENT_ID: process.env.CLIENT_ID });
});

router.get("/byob/", (req, res, next) => {
	res.render("docs/byob", { title: "Bring Your Own Bot", CLIENT_ID: process.env.CLIENT_ID})
});

module.exports = router;
