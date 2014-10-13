//
// The build configuration used for optimization
// All configuration options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
//
module.exports = {
    logLevel: 0,    //TRACE: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4

    // Defines the loading time for modules
    waitSeconds: 30,

    // Will be set by gulpfile.js
    appDir: '',

    // Will be set by gulpfile.js
    dir: '',

    baseUrl: './',

    mainConfigFile: 'main.js',

    keepBuildDir: false,

    removeCombined: true,

    optimize: 'uglify2',

    generateSourceMaps: false,

    preserveLicenseComments: true,

    // No need to optimize the CSS because it's already optimized in gulpfile.js
    optimizeCss: 'none',

    inlineText: true,

    stubModules: ['text'],

    name: 'main',

    include: [
        // Will be set from gulpfile.js
    ]
};
