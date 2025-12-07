
'use strict';
var { src, dest, series, parallel, watch } = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sass = require('gulp-sass')(require('sass'));
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browsersync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var del = require('del');
var glob = require('glob');
var fileinclude = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
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
        scss: {
            dir: './src/scss',
            files: './src/scss/**/*',
            main: './src/scss/*.scss',
            dest: './public/assets/css'
        },
        img:{
            dir:'./src/img/**/*',
            dest: './public/assets/img',
            clean: './public/assets/img/**/*',
        },
        vendor: {
            files: [
                "./node_modules/swiper/swiper-bundle.min.js",
                "./node_modules/choices.js/public/assets/scripts/choices.min.js",
                "./node_modules/inputmask/dist/inputmask.min.js",
                "./node_modules/quill/dist/quill.js",
            ],
            css: [
                "./node_modules/swiper/swiper-bundle.min.css",
                "./node_modules/sal.js/dist/sal.css",
                "./node_modules/choices.js/public/assets/styles/choices.min.css",
                "./node_modules/glightbox/dist/css/glightbox.min.css",
                "./node_modules/quill/dist/quill.snow.css",
            ],
            dest: './public/assets/vendor/node_modules/js',
            destCss: './public/assets/vendor/node_modules/css',
            clean: './public/assets/vendor/node_modules'
        }
    }
};

//Clean public folder html,css,js
function cleanUp() {
    return del([paths.src.js.clean,paths.src.vendor.clean, paths.src.scss.dest, paths.src.html.cleanHtml]);
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
function buildCss() {
    return src(paths.src.scss.main)
        .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write(paths.here))
        .pipe(dest(paths.src.scss.dest))
        .pipe(browsersync.stream());
};
function minifyCss() {
    return src(paths.src.scss.main)
        .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write(paths.here))
        .pipe(dest(paths.src.scss.dest))
        .pipe(browsersync.stream());
};

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
    watch(paths.src.scss.files, series(buildCss, minifyCss));
    watch(paths.src.js.files, series(bundleJs,minifyJs, browsersyncReload));
    // watch(paths.src.img.dir, series(copyImages, browsersyncReload));
    watch(paths.src.html.files, series(html, browsersyncReload));
};

exports.watchFiles = watch;
exports.buildCss = buildCss;
exports.bundleJs = bundleJs;
exports.minifyJs = minifyJs;
exports.minifyCss = minifyCss;
exports.html = html;
exports.copyVendor = copyVendor;
exports.copyVendorCss = copyVendorCss;
exports.cleanUp = cleanUp;
exports.default = series(cleanUp, html, buildCss, minifyCss, copyVendor, copyVendorCss, bundleJs, minifyJs, parallel(browserSync, watchFiles));
