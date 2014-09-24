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
                    //-end-inject
                ]
            }
        },

        //
        // The callback should be kept as simple as possible.
        //
        callback: function() {
            requirejs(['$app'],
                function(app) {
                    app.start().done();
                },
                function(error) {
                    console.error(error);
                    //
                    // Default is to clear up the whole document and replace it with an error
                    // submission form. We consider that Bootstrap was loaded.
                    //
                    document.body.innerHTML = '<div class="container"><div class="page-header">' +
                        '<h1 class="text-danger">Application could not start.</h1></div></div>';
                });
        }
    });
})();
