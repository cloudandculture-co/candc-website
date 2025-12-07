
'use strict';
var { src, dest, series, parallel, watch } = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var browsersync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var del = require('del');
var glob = require('glob');
var fileinclude = require('gulp-file-include');
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
            dir: './',
            files: './**/*',
            dest: './dist'
        },
        html: {
            dir: './src/html/*.html',
            files: './src/html/**/*.html',
            dest: './dist',
            destFiles: './dist/*.html',
        },
        js: {
            dir: './src/js',
            files: './src/js/custom/**/*.js',
            theme: './src/js/theme.js',
            dest: './dist/js'
        },
        css: {
            dir: './src/css',
            files: './src/css/**/*.css',
            theme: './src/css/style.css',
            dest: './dist/css'
        },
        vendor: {
            files: [
                "./node_modules/apexcharts/dist/apexcharts.min.js",
                "./node_modules/dragula/dist/dragula.min.js",
                "./node_modules/flatpickr/dist/flatpickr.min.js",
                "./node_modules/tom-select/dist/js/tom-select.complete.min.js"
            ],
            css: [
                "./node_modules/dragula/dist/dragula.min.css",
                "./node_modules/flatpickr/dist/flatpickr.min.css"
            ],
            dest: './dist/vendor',
            destCss: './dist/vendor/css'
        }
    }
};

function cleanUp() {
    return del([paths.src.js.dest, paths.src.html.destFiles, paths.src.css.dest,paths.src.vendor.dest]);
};

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

function buildCss() {
  return src(paths.src.css.theme)
    .pipe(sourcemaps.init())
    .pipe(postcss())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.src.css.dest))
    .pipe(browsersync.stream());
}
function bundleJs() {
    var files = glob.sync('./src/js/theme.js');
    return (
        browserify({
            entries: files,
            debug: true,
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
            .pipe(uglify())
            .pipe(sourcemaps.write(paths.here))
            .pipe(dest(paths.src.js.dest))
    );
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
    watch([paths.config.tailwindjs,paths.src.css.files],series(buildCss, browsersyncReload));
    watch(paths.src.js.files, series(bundleJs, browsersyncReload));
    watch(paths.src.html.files, series(html,buildCss, browsersyncReload));
};

exports.watchFiles = watch;
exports.bundleJs = bundleJs;
exports.copyVendor = copyVendor;
exports.copyVendorCss = copyVendorCss;
exports.html = html;
exports.cleanUp = cleanUp;
exports.buildCss = buildCss;
exports.default = series(cleanUp, html,buildCss, bundleJs, copyVendor, copyVendorCss, parallel(browserSync, watchFiles));