(function() {
    'use strict';

    //
    // Bootstrap the application
    //
    requirejs.config({
        // How long we allow the dependencies to load (in seconds)
        waitSeconds: 30,

        map: {
            '*': {
                '$events': 'app/shared/events',
                '$router': 'app/shared/router',
                '$http': 'app/shared/http',
                '$helpers': 'app/shared/helpers',
                '$app': 'app/application'
            }
        },

        config: {
            'app/application': {
                modules: [
                    //-inject:modules
                    //-end-inject
                ]
            }
        },
        deps: ['$app']
    });
})();
