'use strict';

var gulp = require('gulp'),
    buildConfig = {
        dev: {
            basePath: './dev'
        }
    };


//region Development Tasks

gulp.task('dev-copy-assets', function() {
    var changed = require('gulp-changed');

    return gulp.src('src/assets/**')
        .pipe(changed(buildConfig.dev.basePath + '/assets'))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/assets'));
});

gulp.task('dev-copy-vendor-js', function() {
    var concat = require('gulp-concat'),
        streamqueue = require('streamqueue'),
        rename = require('gulp-rename');

    return streamqueue({ objectMode: true },
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
        gulp.src('vendor/knockout/dist/knockout.debug.js')
            .pipe(rename('knockout.js')),
        gulp.src([
            'vendor/crossroads/dist/crossroads.js',
            'vendor/hasher/dist/js/hasher.js',
            'vendor/js-signals/dist/signals.js',
            'vendor/q/q.js',
            'vendor/requirejs-text/text.js'
        ])
    )
        .pipe(gulp.dest(buildConfig.dev.basePath));
});

gulp.task('dev-copy-main-js', function() {
    var jshint = require('gulp-jshint'),
        inject = require('gulp-inject'),
        path = require('path');

    var injectDependencies = function(filePath) {
        var fileName = path.relative('src/', filePath);
        return '\'' + fileName.substr(0, fileName.length - 3) + '\',';
    };

    return gulp.src('src/main.js')
        .pipe(inject(gulp.src('src/app/**/moduleInit.js', { read: false }), {
            transform: injectDependencies,
            starttag: '//-inject:modules',
            endtag: '//-end-inject',
            addRootSlash: false
        }))
        .pipe(jshint())
        .pipe(jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest(buildConfig.dev.basePath));
});

gulp.task('dev-copy-app-js', ['dev-copy-main-js'], function() {
    var jshint = require('gulp-jshint');

    return gulp.src('src/app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/app'));
});

gulp.task('dev-process-less', function() {
    var inject = require('gulp-inject'),
        less = require('gulp-less'),
        concat = require('gulp-concat');

    return gulp.src(['src/styles/main.less', 'src/app/**/*.less'])
        .pipe(concat('main.less'))
        .pipe(less({ ieCompat: false }))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/styles'));
});

gulp.task('dev-transform-jade', function() {
    var jade = require('gulp-jade');

    return gulp.src(['src/app/**/*.jade', '!src/app/**/_*.jade'])
        .pipe(jade({
            ext:         '.html',
            pretty:      true,
            client:      false,
            clientDebug: false
        }))
        .pipe(gulp.dest(buildConfig.dev.basePath + '/app'));
});

gulp.task('dev-process-index', ['dev-process-less', 'dev-copy-app-js'], function() {
    var jade = require('gulp-jade');

    return gulp.src('src/index.jade')
        .pipe(jade({
            ext:         '.html',
            pretty:      true,
            client:      false,
            clientDebug: false,
            data: {
                PKG: require('./package.json'),
                STYLES: ['styles/main.css'],
                SCRIPTS: ['require.js', 'main.js']
            }
        }))
        .pipe(gulp.dest(buildConfig.dev.basePath));
});

gulp.task('dev-build', ['dev-copy-assets', 'dev-copy-vendor-js', 'dev-copy-app-js', 'dev-transform-jade', 'dev-process-index']);

gulp.task('dev-build-watch', ['dev-build'], function() {
    gulp.watch('src/assets/**', ['dev-copy-assets']);
    gulp.watch('vendor/**/bower.json', ['dev-copy-vendor-js']);
    gulp.watch('src/app/**/*.js', ['dev-copy-app-js']);
    gulp.watch('src/main.js', ['dev-copy-main-js']);
    gulp.watch('src/app/**/*.less', ['dev-process-less']);
    gulp.watch('src/styles/*.less', ['dev-process-less']);
    gulp.watch('src/app/**/*.jade', ['dev-transform-jade']);
    gulp.watch('src/index.jade', ['dev-process-index']);
});

//endregion
