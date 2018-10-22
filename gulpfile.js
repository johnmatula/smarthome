var gulp = require("gulp");
var browserSync = require("browser-sync");
var compass = require("gulp-compass");
var plumber = require("gulp-plumber");
var uglify = require("gulp-uglify");
var autoprefixer = require("gulp-autoprefixer");
var reload = browserSync.reload;
var fileinclude = require('gulp-file-include');
var rename = require("gulp-rename");
var log = require("fancy-log");
var del = require("del");
var fs = require("fs");


gulp.task("scripts", function() {
	gulp.src(["./src/js/**/*.js", "!./src/js/**/*.min.js"])
		.pipe(plumber())
		.pipe(rename({suffix: ".min"}))
		.pipe(uglify())
		.pipe(gulp.dest("./dist/js/"))
		.pipe(reload({stream:true}));
});

gulp.task("styles", function() {
	gulp.src("./src/scss/main.scss")
		.pipe(plumber())
		.pipe(compass({
			css: "./dist/css/",
			sass: "./src/scss/"
		}))
		.pipe(autoprefixer(["defaults", "iOS >= 7"]))
		.pipe(gulp.dest("./dist/css/"))
		.pipe(reload({stream:true}));
});

gulp.task("browser-sync", function() {

	// Check if a certificate exists in
	// the expected spot. If not, pass "true"
	// to Browsersync and have it generate
	// a certificate (which the browser will
	// probably flag as insecure).

	var httpsConfig = true;

	if (fs.existsSync("selfsigned.dev.key")) {
		httpsConfig = {
			key: "selfsigned.dev.key",
			cert: "selfsigned.dev.crt"
		};
	}

	browserSync({
		server: {
			baseDir: "./dist",
			middleware: function (req, res, next) {
				res.setHeader("Access-Control-Allow-Origin", "*");
				next();
			}
		},
		open: false,
		https: httpsConfig
	});
});

gulp.task("html", function() {
	gulp.src(["./src/html/**/*.html"])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: 'src'
		}))
		.pipe(gulp.dest("dist"))
		.pipe(reload({stream:true}));
});

gulp.task("images", function() {
	gulp.src(["./src/img/**/*"])
		.pipe(gulp.dest("dist/img"))
		.pipe(reload({stream:true}));
});

gulp.task("php", function() {
	gulp.src(["./src/php/**/*.php"])
		.pipe(gulp.dest("dist/php"))
		.pipe(reload({stream:true}));
});


gulp.task("watch", function() {
	gulp.watch("./src/js/**/*.js", ["scripts"]);
	gulp.watch(["./src/scss/**/.scss"], ["styles"]);
	gulp.watch("src/**/*.html", ["html"]);
	gulp.watch("src/**/*.php", ["php"]);
	gulp.watch("src/img/*" ["images"]);
});

gulp.task("removedist", function() {
	return del([
		"./dist/**/*",
		"./dist/"
	]);
});

// Public tasks

gulp.task("default", ["scripts", "styles", "html", "images", "browser-sync", "watch"]);
gulp.task("build", ["scripts", "styles", "html", "images"]);
gulp.task("clean", ["removedist"]);
