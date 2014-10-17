(function() {
    'use strict';

    //
    // Bootstrap the application
    //
    requirejs.config({
        // How long we allow the dependencies to load (in seconds)
        waitSeconds: 30,

        shim: {
            // We want jQuery and Bootstrap to load before Knockout
            knockout: ['jquery', 'bootstrap'],

            // Useful to have jQuery/KnockoutJS plugins loaded automatically
            $app: ['jquery', 'bootstrap', 'knockout']
        },

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
                    'app/shared/module-init',
                    'app/shell/module-init',
                    'app/libs/module-init'
                    //-end-inject
                ]
            }
        },
        deps: ['$app']
    });
})();
