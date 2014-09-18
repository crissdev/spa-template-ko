'use strict';

/**
 * Arguments that can be passed through command line:
 *
 *      --debug - Generate source maps, pretty jade templates etc.
 *              Default: false
 *              When --optimize=true, r.js will not compress any scripts or stylesheets
 *
 *      --optimize - Optimize output using r.js (this option is not yet supported)
 *              Default: false
 *
 *      --server - create a server with livereload enabled (applies to build-watch task)
 *              Default: false
 *
 * Examples:
 *      gulp --debug
 *      gulp --optimize
 *      gulp --optimize --debug
 *
 *      gulp watch --debug
 *      gulp watch --debug --server
 *
 */

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    argv = require('minimist')(process.argv.slice(2)),
    buildConfig = {
        dev: {
            outputPath: './dev'
        },
        dist: {
            outputPath: './dist'
        },
        optimize: !!argv['optimize'],
        debug: !!argv['debug'],
        server: !!argv['server']
    };


function onTaskError(error) {
    // When doing an optimized build, any task error is considered fatal
    gutil.log(gutil.colors.red(error.toString()));

    if (buildConfig.optimize) {
        process.exit(1);
    }
}


gulp.task('process-assets', function() {
    var changed = require('gulp-changed'),
        plumber = require('gulp-plumber');

    return gulp.src('src/assets/**')
        .pipe(plumber(onTaskError))
        .pipe(changed(buildConfig.dev.outputPath + '/assets'))
        .pipe(gulp.dest(buildConfig.dev.outputPath + '/assets'));
});

gulp.task('process-vendor-js', function() {
    var concat = require('gulp-concat'),
        es = require('event-stream'),
        rename = require('gulp-rename'),
        iif = require('gulp-if'),
        plumber = require('gulp-plumber');

    var amdWrapTransform = function() {
        return es.map(function(file, cb) {
            file.contents = new Buffer('define([\'jquery\'], function() {\n\n' +
                file.contents.toString() + '\n});\n');
            cb(null, file);
        });
    };

    var stream = es.merge(
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
        ]).pipe(plumber(onTaskError)).pipe(concat('bootstrap.js')).pipe(amdWrapTransform()),
        iif(buildConfig.debug,
                gulp.src('vendor/knockout/dist/knockout.debug.js')
                    .pipe(plumber(onTaskError))
                    .pipe(rename('knockout.js')),
                gulp.src('vendor/knockout/dist/knockout.js')),
        gulp.src('vendor/crossroads/dist/crossroads.js'),
        gulp.src('vendor/hasher/dist/js/hasher.js'),
        gulp.src('vendor/js-signals/dist/signals.js'),
        gulp.src('vendor/q/q.js'),
        gulp.src('vendor/requirejs-text/text.js')
    );
    return stream.pipe(gulp.dest(buildConfig.dev.outputPath));
});

gulp.task('process-app-js', function() {
    var jshint = require('gulp-jshint'),
        inject = require('gulp-inject'),
        stripDebug = require('gulp-strip-debug'),
        changed = require('gulp-changed'),
        iif = require('gulp-if'),
        es = require('event-stream'),
        plumber = require('gulp-plumber'),
        pathRelative = require('path').relative;

    var injectDependencies = function(filePath) {
        var fileName = pathRelative('src/', filePath);
        fileName = '\'' + fileName.substr(0, fileName.length - 3) + '\',';
        return fileName.replace(/\\/g, '/');
    };

    return es.merge(
        gulp.src('src/app/**/*.js')
            .pipe(plumber(onTaskError))
            .pipe(changed(buildConfig.dev.outputPath + '/app'))
            .pipe(iif(!buildConfig.debug, stripDebug()))
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(gulp.dest(buildConfig.dev.outputPath + '/app')),

        gulp.src('src/main.js')
            .pipe(plumber(onTaskError))
            .pipe(inject(gulp.src('src/app/**/module-init.js', { read: false }), {
                transform: injectDependencies,
                starttag: '//-inject:modules',
                endtag: '//-end-inject',
                addRootSlash: false
            }))
            .pipe(iif(!buildConfig.debug, stripDebug()))
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(gulp.dest(buildConfig.dev.outputPath))
    );
});

gulp.task('process-less', function() {
    var inject = require('gulp-inject'),
        less = require('gulp-less'),
        iif = require('gulp-if'),
        sourcemaps = require('gulp-sourcemaps'),
        concat = require('gulp-concat'),
        plumber = require('gulp-plumber');

    return gulp.src(['src/styles/main.less', 'src/app/**/*.less'])
        .pipe(plumber(onTaskError))
        .pipe(iif(buildConfig.debug, sourcemaps.init()))
        .pipe(concat('main.less'))
        .pipe(less({ ieCompat: false, compress: !buildConfig.debug }))
        .pipe(iif(buildConfig.debug, sourcemaps.write()))
        .pipe(gulp.dest(buildConfig.dev.outputPath + '/styles'));
});

gulp.task('process-coffee', function() {
    var coffee = require('gulp-coffee'),
        iif = require('gulp-if'),
        sourcemaps = require('gulp-sourcemaps'),
        plumber = require('gulp-plumber');

    return gulp.src('src/app/**/*.coffee')
        .pipe(plumber(onTaskError))
        .pipe(iif(buildConfig.debug, sourcemaps.init()))
        .pipe(coffee())
        .pipe(iif(buildConfig.debug, sourcemaps.write()))
        .pipe(gulp.dest(buildConfig.dev.outputPath + '/app'));
});

gulp.task('process-jade', function() {
    var jade = require('gulp-jade'),
        es = require('event-stream'),
        plumber = require('gulp-plumber');

    var trimLeftTransform = function(trim) {
        return es.map(function(file, cb) {
            if (trim) {
                file.contents = new Buffer(file.contents.toString('utf8').trimLeft());
            }
            cb(null, file);
        });
    };

    return es.merge(
        gulp.src('src/index.jade')
            .pipe(plumber(onTaskError))
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
            .pipe(trimLeftTransform(buildConfig.debug))
            .pipe(gulp.dest(buildConfig.dev.outputPath)),

        gulp.src(['src/app/**/*.jade', '!src/app/**/_*.jade'])
            .pipe(plumber(onTaskError))
            .pipe(jade({
                clientDebug: false,
                client: false,
                pretty: !!buildConfig.debug,
                ext: '.html'
            }))
            .pipe(trimLeftTransform(buildConfig.debug))
            .pipe(gulp.dest(buildConfig.dev.outputPath + '/app'))
    );
});

gulp.task('build', ['process-assets', 'process-vendor-js', 'process-app-js', 'process-jade',
    'process-less', 'process-coffee'], function(done) {
    if (buildConfig.optimize) {
        gutil.log(gutil.colors.yellow('*** WARNING: r.js optimization is not yet supported ***'));
    }
    done();
});

gulp.task('watch', ['build'], function() {
    gulp.watch('src/assets/**', ['process-assets']);
    gulp.watch('vendor/**/bower.json', ['process-vendor-js']);
    gulp.watch(['src/app/**/*.js', 'src/main.js'], ['process-app-js']);
    gulp.watch('src/app/**/*.coffee', ['process-coffee']);
    gulp.watch(['src/app/**/*.less', 'src/styles/*.less'], ['process-less']);
    gulp.watch('src/app/**/*.jade', ['process-jade']);

    if (buildConfig.server) {
        var webServer = require('gulp-webserver'),
            plumber = require('gulp-plumber');

        gulp.src(buildConfig.dev.outputPath)
            .pipe(plumber(onTaskError))
            .pipe(webServer({
                host: 'localhost',
                port: 8000,
                livereload: true,
                directoryListing: false,
                open: true
            }));
    }
});

gulp.task('default', ['build']);
