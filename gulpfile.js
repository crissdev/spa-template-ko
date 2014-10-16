'use strict';
/*jshint maxlen:false*/

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    mapStream = require('map-stream'),
    mergeStream = require('merge-stream'),
    notifier = require('node-notifier'),
    tildify = require('tildify'),
    commander = require('commander'),
    extend = require('extend'),
    del = require('del'),
    temp = require('temp').track(),
    nodejs = {
        fs: require('fs'),
        path: require('path'),
        os: require('os'),
        childProcess: require('child_process')
    },
    plugins = {
        changed: require('gulp-changed'),
        coffee: require('gulp-coffee'),
        concat: require('gulp-concat'),
        footer: require('gulp-footer'),
        iif: require('gulp-if'),
        inject: require('gulp-inject'),
        jade: require('gulp-jade'),
        jshint: require('gulp-jshint'),
        less: require('gulp-less'),
        plumber: require('gulp-plumber'),
        rename: require('gulp-rename'),
        sourceMaps: require('gulp-sourcemaps'),
        stripDebug: require('gulp-strip-debug'),
        webServer: require('gulp-webserver'),
        coffeeLint: require('gulp-coffeelint')
    },
    buildConfig = {
        // The location to use to write transformed output
        outputPath: './dev',

        // If source maps should be generated (coffee, less, js)
        sourceMaps: false,

        // The version to use for build
        version: '0.0.' + String(Math.round(Math.random() * 1000000)),

        // Whether or not this is a release build
        release: false,

        // Where to copy the release build files
        releaseOutput: './build',

        // If almond should be used instead of require.js
        useAlmond: false,

        // If the current build was started with the watch task
        IS_WATCH: false
    },
    argv = commander
        .option('--output [path]', 'The location to use to output build files [./dev | ./build]')
        .option('--source-maps', 'Generate source maps')
        .option('--release [version]', 'Create a release build [generate]')
        .option('--almond', 'If almond should be used instead of require.js')
        .option('--server [port]', 'Start a livereload server on the specified port [8000]')

        //- Gulp related CLI arguments
        .option('--tasks')
        .option('--color')
        .option('--no-color')
        .option('--gulpfile')
        .parse(process.argv);


if (argv.release) {
    buildConfig.release = true;
    buildConfig.outputPath = mkTmpDir();

    if (typeof argv.release === 'string') {
        buildConfig.version = argv.release;
    }
    if (typeof argv.output === 'string') {
        buildConfig.releaseOutput = argv.output;
    }
    if (argv.almond) {
        buildConfig.useAlmond = argv.almond;
    }
}
else {
    if (typeof argv.output === 'string') {
        buildConfig.outputPath = argv.output;
    }
}
if (argv.sourceMaps) {
    buildConfig.sourceMaps = true;
}


function onTaskError(error) {
    // When doing an optimized build, any task error is considered fatal
    gutil.log(gutil.colors.red(error.stack));

    if (buildConfig.release) {
        process.exit(1);
    }
}

function notify(message) {
    notifier.notify({title: 'SPA-KO', message: message, sound: true, wait: false, time: 10000});
}

function mkTmpDir() {
    return temp.mkdirSync('spa-ko-');
}



gulp.task('clean', function(done) {
    if (buildConfig.IS_WATCH || buildConfig.release) {
        done();
    }
    else {
        gutil.log('Cleaning output directory ' + gutil.colors.magenta(tildify(nodejs.path.resolve(buildConfig.outputPath))));
        del('*', {cwd: buildConfig.outputPath}, function(err) {
            if (err) {
                gutil.log(gutil.colors.red(err.stack));
            }
            done();
        });
    }
});


gulp.task('process-vendor-scripts', ['clean'], function() {
    var amdWrapTransform = function(depMap) {
        return mapStream(function(file, cb) {
            var dependencyNames = Object.keys(depMap);
            var variableNames = [];

            dependencyNames.forEach(function(name) {
                if (depMap[name] === true) {
                    variableNames.push(name);
                }
                else {
                    variableNames.push(depMap[name]);
                }
            });

            var output = [];
            output.push('define([');
            output.push(dependencyNames.map(function(name) { return '\'' + name + '\''; }).join(', '));
            output.push('], function(');
            output.push(variableNames.join(', '));
            output.push(') {\n\n');
            output.push(file.contents.toString('utf8'));
            output.push('\n});\n');

            file.contents = new Buffer(output.join(''));
            cb(null, file);
        });
    };
    var stream = mergeStream(
        gulp.src([
            'transition.js',
            'alert.js',
            'button.js',
            'carousel.js',
            'collapse.js',
            'dropdown.js',
            'modal.js',
            'tooltip.js',
            'popover.js',
            'scrollspy.js',
            'tab.js',
            'affix.js'
        ], {cwd: 'vendor/bootstrap/js'})
            .pipe(plugins.plumber(onTaskError))
            .pipe(plugins.concat('bootstrap.js'))
            .pipe(amdWrapTransform({jquery: 'jQuery'}))
            .pipe(plugins.changed(buildConfig.outputPath, {hasChanged: plugins.changed.compareSha1Digest})),
        gulp.src(buildConfig.release ? 'knockout.debug.js' : 'knockout.js', {cwd: 'vendor/knockout/dist'})
            .pipe(plugins.plumber(onTaskError))
            .pipe(plugins.rename('knockout.js'))
            .pipe(plugins.changed(buildConfig.outputPath, {hasChanged: plugins.changed.compareSha1Digest})),
        gulp.src([
            buildConfig.release && buildConfig.useAlmond ? 'vendor/almond/almond.js' : 'vendor/requirejs/require.js',
            'vendor/jquery/dist/jquery.js',
            'vendor/crossroads/dist/crossroads.js',
            'vendor/hasher/dist/js/hasher.js',
            'vendor/js-signals/dist/signals.js',
            'vendor/q/q.js',
            'vendor/requirejs-text/text.js'])
            .pipe(plugins.changed(buildConfig.outputPath))
    );
    return stream.pipe(gulp.dest(buildConfig.outputPath));
});


gulp.task('process-app-js', ['clean'], function() {
    gulp.src('src/app/**/*.js', {base: 'src'})
        .pipe(plugins.plumber(onTaskError))
        .pipe(plugins.changed('app', {cwd: buildConfig.outputPath}))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.iif(buildConfig.sourceMaps, plugins.sourceMaps.init()))
        .pipe(plugins.iif(buildConfig.release, plugins.stripDebug()))
        .pipe(plugins.iif(buildConfig.sourceMaps, plugins.sourceMaps.write()))
        .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('process-app-main', ['clean'], function() {
    var injectDependenciesOptions = {
        transform: function(filePath, file, i, length) {
            var fileName = '\'' + gutil.replaceExtension(file.relative, '') + '\'';
            if (i + 1 < length) {
                fileName += ',';
            }
            return fileName.replace(/\\/g, '/');
        },
        starttag: '//-inject:modules',
        endtag: '//-end-inject',
        addRootSlash: false
    };
    return gulp.src('src/main.js')
        .pipe(plugins.plumber(onTaskError))
        .pipe(plugins.inject(gulp.src('src/app/**/module-init.{js,coffee}', {read: false, base: 'src'}), injectDependenciesOptions))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('process-app-coffee', ['clean'], function() {
    return gulp.src('src/app/**/*.coffee', {base: 'src'})
        .pipe(plugins.plumber(onTaskError))
        .pipe(plugins.changed('app', {cwd: buildConfig.outputPath, ext: '.js'}))
        .pipe(plugins.coffeeLint())
        .pipe(plugins.coffeeLint.reporter('default'))
        .pipe(plugins.iif(buildConfig.sourceMaps, plugins.sourceMaps.init()))
        .pipe(plugins.coffee())
        .pipe(plugins.iif(buildConfig.sourceMaps, plugins.sourceMaps.write()))
        .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('process-app-scripts', ['process-app-js', 'process-app-main', 'process-app-coffee']);


gulp.task('process-assets', ['clean'], function() {
    return gulp.src('src/assets/**', {base: 'src'})
        .pipe(plugins.plumber(onTaskError))
        .pipe(plugins.changed('assets', {cwd: buildConfig.outputPath}))
        .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('process-less', ['clean'], function() {
    return gulp.src(['src/styles/main.less', 'src/app/**/*.less'])
        .pipe(plugins.plumber(onTaskError))
        .pipe(plugins.iif(buildConfig.sourceMaps, plugins.sourceMaps.init()))
        .pipe(plugins.concat('main.less'))
        .pipe(plugins.less({ ieCompat: false, compress: buildConfig.release}))
        .pipe(plugins.iif(buildConfig.sourceMaps, plugins.sourceMaps.write()))
        .pipe(gulp.dest('styles', {cwd: buildConfig.outputPath}));
});

gulp.task('process-app-jade', ['clean'], function() {
    return gulp.src('src/app/**/*.jade', {base: 'src'})
        .pipe(plugins.plumber(onTaskError))
        .pipe(plugins.changed('app', {cwd: buildConfig.outputPath, ext: '.html'}))
        .pipe(plugins.jade({clientDebug: false, client: false, pretty: false, ext: '.html'}))
        .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('process-index-jade', ['clean'], function() {
    return gulp.src('src/index.jade', {base: 'src'})
        .pipe(plugins.plumber(onTaskError))
        .pipe(plugins.changed(buildConfig.outputPath, {ext: '.html'}))
        .pipe(plugins.jade({
            clientDebug: false,
            client: false,
            pretty: false,
            ext: '.html',
            data: {
                APP_VERSION: buildConfig.version,
                ALMOND_VERSION: buildConfig.release && buildConfig.useAlmond ? require('./vendor/almond/bower.json').version : null,
                REQUIRE_VERSION: buildConfig.release && buildConfig.useAlmond ? null : require('./vendor/requirejs/bower.json').version
            }
        }))
        .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('process-static-content', ['process-assets', 'process-less', 'process-app-jade', 'process-index-jade']);


gulp.task('build', ['process-vendor-scripts', 'process-app-scripts', 'process-static-content'], function(done) {
    if (buildConfig.release) {
        setTimeout(optimize.bind(undefined, done), 1000);
    }
    else {
        notify('Your build is complete');
        done();
    }
});


gulp.task('watch', ['build'], function() {
    buildConfig.IS_WATCH = true;

    gulp.watch('vendor/**/bower.json', ['process-vendor-js']);
    gulp.watch('src/app/**/*.js', ['process-app-js']);
    gulp.watch('src/app/**/*.coffee', ['process-app-coffee']);
    gulp.watch('src/app/**/module-init.{js,coffee}', ['process-app-main']);
    gulp.watch('src/main.js', ['process-app-main']);

    gulp.watch('src/assets/**', ['process-assets']);
    gulp.watch(['src/styles/*.less', 'src/app/**/*.less'], ['process-less']);
    gulp.watch('src/app/**/*.jade', ['process-app-jade']);
    gulp.watch('src/index.jade', ['process-index-jade']);

    if (argv.server) {
        gulp.src(buildConfig.outputPath)
            .pipe(plugins.plumber(onTaskError))
            .pipe(plugins.webServer({
                host: 'localhost',
                port: parseInt(argv.server) || 8000,
                livereload: true,
                directoryListing: false,
                open: true
            }));
    }
});

gulp.task('default', ['build']);


function optimize(done) {
    try {
        var rjsConfig = extend({}, require('./require-config'));
        rjsConfig.appDir = buildConfig.outputPath;
        rjsConfig.dir = mkTmpDir();

        if (buildConfig.useAlmond) {
            rjsConfig.insertRequire = ['main'];
        }

        var globOptions = {read: false, cwd: buildConfig.outputPath, base: buildConfig.outputPath};
        var stream = gulp.src(['*.js', 'app/**/*.js', 'app/**/*.html', buildConfig.useAlmond ? '!almond.js' : '!require.js'], globOptions);

        stream.pipe(mapStream(function(file, callback) {
            switch (nodejs.path.extname(file.path)) {
                case '.js':
                    rjsConfig.include.push(gutil.replaceExtension(file.relative, ''));
                    break;
                case '.html':
                    rjsConfig.include.push('text!' + file.relative);
                    break;
                default:
                    gutil.log(gutil.colors.yellow(file.path));
                    break;
            }
            callback(null, file);
        }));
        stream.on('end', function() {
            var configPath = nodejs.path.join(buildConfig.outputPath, 'require-config.js');
            nodejs.fs.writeFileSync(configPath, '(' + JSON.stringify(rjsConfig) + ')');

            var process = nodejs.childProcess.spawn('./node_modules/.bin/r.js', ['-o', configPath], {stdio: 'inherit'});

            process.on('close', function(exitCode) {
                if (exitCode !== 0) {
                    notifier.notify({
                        title: 'SPA-KO',
                        message: 'The build failed. Exit code: ' + exitCode,
                        sound: true,
                        wait: false,
                        time: 10000
                    });
                    done();
                }
                else {
                    var buildFiles = [
                        'index.html',
                        buildConfig.useAlmond ? 'almond.js' : 'require.js',
                        'main.js',
                        'styles/**',
                        'assets/**',
                        'build.txt'
                    ];
                    var deployStream = gulp.src(buildFiles, {cwd: rjsConfig.dir, base: rjsConfig.dir})
                        .pipe(plugins.plumber(onTaskError))
                        .pipe(gulp.dest(buildConfig.releaseOutput));

                    deployStream.on('end', function() {
                        notifier.notify({
                            title: 'SPA-KO',
                            message: 'The build is complete',
                            sound: true,
                            wait: false,
                            time: 10000
                        });
                        done();
                    });
                }
            });
        });
        stream.on('error', function(err) {
            onTaskError(err);
        });
    }
    catch (err) {
        onTaskError(err);
    }
}
