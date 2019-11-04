const express = require("express");
require('dotenv').config();
const path = require("path");
const sassMiddleware = require("node-sass-middleware");

// import routes
const indexRouter = require("./routes");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(sassMiddleware({
	src: path.join(__dirname, "public"),
	dest: path.join(__dirname, "public"),
	indentedSyntax: true, // true = .sass and false = .scss
	sourceMap: true,
}));

// set directory of static files
app.use(express.static(path.join(__dirname, "public")));

// setup router
app.use("/", indexRouter);

// catch 404 error
app.use((req, res, next) => {
	res.render("error", {
		code: "Not Found",
		message: "We couldn't find that page; check if there are any typos in the URL",
		title: "404 - We couldn't find that page",
	});
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the developer error page
	if (req.app.get("env") === "development") {
		res.status(err.status || 500).json(err.toJSON());
	}
	// render the production error page
	else {
		res.status(err.status || 500).render("error", {
			code: "Our Fault",
			message: "Something went wrong and we'll work to fix it soon",
			title: "Something went wrong",
		});
	}
});

module.exports = app;
