const gulp = require("gulp");

gulp.task("styles", () => {
	const sourcemaps = require("gulp-sourcemaps");
	const sass = require('gulp-sass');
	sass.compiler = require("node-sass");
	const postcss = require("gulp-postcss");
	const purgecss = require("@fullhuman/postcss-purgecss");

	return gulp.src("src/**/*.scss")
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(postcss([
			require("tailwindcss"),
			require("autoprefixer"),
			...process.env.NODE_ENV === "production" ? [purgecss({
				content: ["src/**/*.pug", "src/**/.js"],
				defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
			})] : [],
		]))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("public/"));
});

gulp.task("styles:watch", () => {
	gulp.watch("src/**/*.scss", gulp.series("styles"));
});

gulp.task("dev", () => {
	const nodemon = require("gulp-nodemon");
	nodemon({
		script: "app.js",
		tasks: ["styles"]
	})
});
