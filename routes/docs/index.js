const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
	res.render("docs/index", { title: "Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

module.exports = router;
