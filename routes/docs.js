const express = require("express");
const router = express.Router();

// GET home page
router.get("/", (req, res, next) => {
	res.render("docs/index", { title: "Documentation", CLIENT_ID: process.env.CLIENT_ID });
});

module.exports = router;
