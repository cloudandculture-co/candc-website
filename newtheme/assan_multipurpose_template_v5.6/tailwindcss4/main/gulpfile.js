
'use strict';
const { src, dest, series, parallel, watch } = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const glob = require('glob');
const fileinclude = require('gulp-file-include');
const autoprefixer = require('gulp-autoprefixer');
const postcss = require('gulp-postcss');
// Define paths
var paths = {
    here: './',
    base: {
        base: {
            dest: './'
        },
        node: {
            dest: './node_modules'
        }
    },
    config: {
		tailwindjs: "./tailwind.config.js",
	},
    src: {
        base: {
            dir: './src/',
            files: './src/**/*',
            dest: './public'
        },
        html: {
            dir: './src/html/*.html',
            files: './src/html/**/*.html',
            dest: './public',
            cleanHtml: './public/*.html',
        },
        js: {
            dir: './src/js',
            files: './src/js/custom/**/*.js',
            theme: './src/js/theme.js',
            dest: './public/assets/js',
            clean: './public/assets/js/*.js',
        },
        css: {
            dir: './src/css',
            files: './src/css/**/*',
            main: './src/css/*.css',
            dest: './public/assets/css'
        },
        img:{
            dir:'./src/img/**/*.{jpg,jpeg,png,svg}',
            dest: './public/assets/img',
            cleanImages: './public/assets/img/**/*',
        },
        vendor: {
            files: [
                "./node_modules/jquery/dist/jquery.min.js",
                "./node_modules/jquery-countdown/dist/jquery.countdown.min.js",
                "./node_modules/gsap/dist/gsap.min.js",
                "./node_modules/gsap/dist/ScrollTrigger.min.js",
                "./node_modules/gsap/dist/SplitText.min.js",
                "./node_modules/gsap/dist/TextPlugin.min.js",
                "./node_modules/gsap/dist/ScrollSmoother.min.js",
                "./node_modules/swiper/swiper-bundle.min.js",
                "./node_modules/particles.js/particles.js",
                "./node_modules/plyr/dist/plyr.min.js",
                "./node_modules/choices.js/public/assets/scripts/choices.min.js",
                "./node_modules/autosize/dist/autosize.min.js",
            ],
            css: [
                "./node_modules/swiper/swiper-bundle.min.css",
                "./node_modules/plyr/dist/plyr.css",
                "./node_modules/choices.js/public/assets/styles/choices.min.css",
                "./node_modules/glightbox/dist/css/glightbox.min.css",
            ],
            dest: './public/assets/vendor/node_modules/js',
            destCss: './public/assets/vendor/node_modules/css',
            clean: './public/assets/vendor/node_modules'
        }
    }
};

//Clean public folder html,css,js
function cleanUp() {
    return del([paths.src.js.clean,paths.src.css.dest,paths.src.vendor.clean, paths.src.html.cleanHtml]);
};

//Copy vendor to assets/vendor folder
function copyVendor() {
    return src(paths.src.vendor.files)
        .pipe(dest(paths.src.vendor.dest))
        .pipe(browsersync.stream());
}
function copyVendorCss() {
    return src(paths.src.vendor.css)
        .pipe(dest(paths.src.vendor.destCss))
        .pipe(browsersync.stream());
}

//BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: [paths.src.base.dest]
        },
    });
    done();
};

function browsersyncReload(done) {
    browsersync.reload();
    done();
};

function bundleJs() {
    var files = glob.sync('./src/js/theme.js');
    return (
        browserify({
            entries: files,
            debug: false,
            cache: {},
            packageCache: {}
        }).transform(babelify, {
            global: true,
            presets: ["@babel/preset-env"]
        })
            .bundle()
            .pipe(source('theme.bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write(paths.here))
            .pipe(dest(paths.src.js.dest))
    );
};
function minifyJs() {
    var files = glob.sync('./src/js/theme.js');
    return (
        browserify({
            entries: files,
            debug: false,
            cache: {},
            packageCache: {}
        }).transform(babelify, {
            global: true,
            presets: ["@babel/preset-env"]
        })
            .bundle()
            .pipe(source('theme.bundle.min.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(sourcemaps.write(paths.here))
            .pipe(dest(paths.src.js.dest))
    );
};
//styles
// function buildCss(){
//     const tailwindcss = require('tailwindcss'); 
//     return src(paths.src.css.main)
//     .pipe(postcss([
//         tailwindcss(paths.config.tailwindjs),
//         require('autoprefixer'),
//       ]))
//     .pipe(dest(paths.src.css.dest));
// }
function buildCss() {
  return src(paths.src.css.main)
    .pipe(sourcemaps.init())
    .pipe(postcss())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.src.css.dest))
    .pipe(browsersync.stream());
}


//Copy html
function html() {
    return src(paths.src.html.dir)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(dest(paths.src.html.dest))
        .pipe(browsersync.reload({
            stream: true
        }));
};
function watchFiles() {
    watch([paths.config.tailwindjs,paths.src.css.files],series(buildCss, browsersyncReload));
    watch(paths.src.js.files, series(bundleJs, minifyJs, browsersyncReload));
    watch(paths.src.html.files, series(html,buildCss, browsersyncReload));
};

exports.watchFiles = watch;
exports.buildCss = buildCss;
exports.bundleJs = bundleJs;
exports.minifyJs = minifyJs;
exports.html = html;
exports.copyVendor = copyVendor;
exports.copyVendorCss = copyVendorCss;
exports.cleanUp = cleanUp;
exports.default = series(cleanUp, html, buildCss, copyVendor, copyVendorCss, bundleJs, minifyJs, parallel(browserSync, watchFiles));
