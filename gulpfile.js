'use strict';

/**
 * Arguments that can be passed through command line:
 *
 *      debug [false] - generate pretty templates, source maps etc.
 *      optimize [false] - bundle everything using r.js optimizer
 *      server [false] - create a server with livereload enabled (applies to build-watch task)
 *
 */

var gulp = require('gulp'),
    argv = require('optimist')
        .boolean('debug')
        .boolean('server')
        .argv,
    buildConfig = {
        dev: {
            basePath: './dev'
        },
        dist: {
            basePath: './dist'
        },
        optimize: !!argv.optimize,
        debug: !!argv.debug
    };


gulp.task('copy-assets', function() {
    var changed = require('gulp-changed');

    return gulp.src('src/assets/**')
        .pipe(changed(buildConfig.dev.basePath + '/assets'))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/assets'));
});

gulp.task('process-vendor-js', function() {
    var concat = require('gulp-concat'),
        es = require('event-stream'),
        rename = require('gulp-rename');

    return es.merge(
        gulp.src('vendor/requirejs/require.js'),
        gulp.src('vendor/jquery/dist/jquery.js'),
        gulp.src([
            'vendor/bootstrap/js/transition.js',
            'vendor/bootstrap/js/alert.js',
            'vendor/bootstrap/js/button.js',
            'vendor/bootstrap/js/carousel.js',
            'vendor/bootstrap/js/collapse.js',
            'vendor/bootstrap/js/dropdown.js',
            'vendor/bootstrap/js/modal.js',
            'vendor/bootstrap/js/tooltip.js',
            'vendor/bootstrap/js/popover.js',
            'vendor/bootstrap/js/scrollspy.js',
            'vendor/bootstrap/js/tab.js',
            'vendor/bootstrap/js/affix.js'
        ]).pipe(concat('bootstrap.js')),
        gulp.src('vendor/knockout/dist/knockout.debug.js').pipe(rename('knockout.js')),
        gulp.src('vendor/crossroads/dist/crossroads.js'),
        gulp.src('vendor/hasher/dist/js/hasher.js'),
        gulp.src('vendor/js-signals/dist/signals.js'),
        gulp.src('vendor/q/q.js'),
        gulp.src('vendor/requirejs-text/text.js'))
        .pipe(gulp.dest(buildConfig.dev.basePath));
});

gulp.task('process-main-js', function() {
    var jshint = require('gulp-jshint'),
        inject = require('gulp-inject'),
        stripDebug = require('gulp-strip-debug'),
        iif = require('gulp-if'),
        plumber = require('gulp-plumber'),
        path = require('path');

    var injectDependencies = function(filePath) {
        var fileName = path.relative('src/', filePath);
        return '\'' + fileName.substr(0, fileName.length - 3) + '\',';
    };

    return gulp.src('src/main.js')
        .pipe(plumber())
        .pipe(inject(gulp.src('src/app/**/module-init.js', { read: false }), {
            transform: injectDependencies,
            starttag: '//-inject:modules',
            endtag: '//-end-inject',
            addRootSlash: false
        }))
        .pipe(iif(!buildConfig.debug, stripDebug()))
        .pipe(jshint())
        .pipe(jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest(buildConfig.dev.basePath));
});

gulp.task('process-app-js', function() {
    var jshint = require('gulp-jshint'),
        stripDebug = require('gulp-strip-debug'),
        iif = require('gulp-if'),
        plumber = require('gulp-plumber');

    return gulp.src('src/app/**/*.js')
        .pipe(plumber())
        .pipe(iif(!buildConfig.debug, stripDebug()))
        .pipe(jshint())
        .pipe(jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/app'));
});

gulp.task('process-less', function() {
    var inject = require('gulp-inject'),
        less = require('gulp-less'),
        iif = require('gulp-if'),
        sourcemaps = require('gulp-sourcemaps'),
        concat = require('gulp-concat'),
        plumber = require('gulp-plumber');

    return gulp.src(['src/styles/main.less', 'src/app/**/*.less'])
        .pipe(plumber())
        .pipe(iif(buildConfig.debug, sourcemaps.init()))
        .pipe(concat('main.less'))
        .pipe(less({ ieCompat: false }))
        .pipe(iif(buildConfig.debug, sourcemaps.write()))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/styles'));
});

gulp.task('process-coffee', function() {
    var coffee = require('gulp-coffee'),
        iif = require('gulp-if'),
        sourcemaps = require('gulp-sourcemaps'),
        plumber = require('gulp-plumber');

    return gulp.src('src/app/**/*.coffee')
        .pipe(plumber())
        .pipe(iif(buildConfig.debug, sourcemaps.init()))
        .pipe(coffee())
        .pipe(iif(buildConfig.debug, sourcemaps.write()))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/app'));
});

gulp.task('process-jade', function() {
    var jade = require('gulp-jade'),
        plumber = require('gulp-plumber');

    return gulp.src(['src/app/**/*.jade', '!src/app/**/_*.jade'])
        .pipe(plumber())
        .pipe(jade({
            clientDebug: false,
            client: false,
            pretty: !!buildConfig.debug,
            ext: '.html'
        }))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/app'));
});

gulp.task('process-index', function() {
    var jade = require('gulp-jade'),
        plumber = require('gulp-plumber');

    return gulp.src('src/index.jade')
        .pipe(plumber())
        .pipe(jade({
            clientDebug: false,
            client: false,
            pretty: !!buildConfig.debug,
            ext: '.html',
            data: {
                PKG: require('./package.json'),
                STYLES: ['styles/main.css'],
                SCRIPTS: ['require.js', 'main.js']
            }
        }))
        .pipe(gulp.dest(buildConfig.dev.basePath));
});

gulp.task('build', ['copy-assets', 'process-vendor-js', 'process-app-js', 'process-main-js', 'process-jade', 'process-less', 'process-coffee', 'process-index']);

gulp.task('build-watch', ['build'], function() {
    gulp.watch('src/assets/**', ['copy-assets']);
    gulp.watch('vendor/**/bower.json', ['process-vendor-js']);
    gulp.watch('src/app/**/*.js', ['process-app-js']);
    gulp.watch('src/main.js', ['process-main-js']);
    gulp.watch('src/app/**/*.coffee', ['process-coffee']);
    gulp.watch(['src/app/**/*.less', 'src/styles/*.less'], ['process-less']);
    gulp.watch('src/app/**/*.jade', ['process-jade']);
    gulp.watch('src/index.jade', ['process-index']);

    if (argv.server) {
        var webServer = require('gulp-webserver'),
            plumber = require('gulp-plumber');

        gulp.src(buildConfig.dev.basePath)
            .pipe(plumber())
            .pipe(webServer({
                host: 'localhost',
                port: 8000,
                livereload: true,
                directoryListing: false,
                open: true
            }));
    }
});
