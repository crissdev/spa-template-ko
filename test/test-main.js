(function() {
    'use strict';

    var allTestFiles = [];
    Object.keys(window.__karma__.files).forEach(function(file) {
        if (/Spec\.js$/.test(file)) {
            allTestFiles.push(file);
        }
    });

    window.requirejs.config({
        // Karma serves files under /base, which is the basePath from your config file
        baseUrl: '/base/dev',

        // dynamically load all test files
        deps: allTestFiles,

        // we have to kickoff jasmine, as it is asynchronous
        callback: window.__karma__.start,

        // How long we allow the dependencies to load (in seconds)
        waitSeconds: 30,

        map: {
            '*': {
                '$events': 'app/shared/events',
                '$router': 'app/shared/router',
                '$http': 'app/shared/http',
                '$helpers': 'app/shared/helpers'
            }
        }
    });
})(window);
