// project paths are set in package.json
const paths = require("./package.json").paths;

const gulp = require("gulp");
const postcss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const tailwindcss = require("tailwindcss");
const browserSync = require("browser-sync").create();
const webstandards = require('gulp-webstandards');
const pa11y = require('pa11y');
const fancyLog = require('fancy-log');
const chalk = require('chalk');

// Custom extractor for purgeCSS, to avoid stripping classes with `:` prefixes
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

// compiling tailwind CSS
gulp.task("css", () => {
  return gulp
    .src(paths.src.css + "*.css")
    .pipe(
      postcss([tailwindcss(paths.config.tailwind), require("autoprefixer")])
    )
    .pipe(
      purgecss({
        content: [paths.dist.base + "*.html"],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html", "js"]
          }
        ]
      })
    )
    .pipe(gulp.dest(paths.dist.css));
});

// Process data in an array synchronously, moving onto the n+1 item only after the nth item callback
function doSynchronousLoop(data, processData, done) {
    if (data.length > 0) {
        const loop = (data, i, processData, done) => {
            processData(data[i], i, () => {
                if (++i < data.length) {
                    loop(data, i, processData, done);
                } else {
                    done();
                }
            });
        };
        loop(data, 0, processData, done);
    } else {
        done();
    }
}
gulp.task('webstandards', function () {
    return gulp.src(["http://localhost:3000/index.html","http://localhost:3000/sub.html"])
        .pipe(webstandards());
});

// browser-sync dev server
gulp.task("serve", ["css"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });

  gulp.watch(paths.src.css + "*.css", ["css"]);
  gulp.watch(paths.config.tailwind, ["css"]);
  gulp.watch(paths.dist.base + "*.html").on("change", browserSync.reload);
});

// default task
gulp.task("default", ["serve"]);
