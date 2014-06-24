(function() {
    'use strict';

    //
    // Bootstrap the application
    //
    requirejs.config({
        // How long we allow the dependencies to load (in seconds)
        waitSeconds: 30,

        shim: {
            // Bootstrap needs jQuery and we want it loaded (see below)
            bootstrap: ['jquery'],

            // We want jQuery anf Bootstrap to load before Knockout
            knockout: ['bootstrap']
        },

        //
        // The callback should be kept as simple as possible.
        //
        callback: function() {
            var _reportApplicationStartupFailure = function(error) {
                console.error(error);
                //
                // Default is to clear up the whole document and replace it with an error submission form.
                // We consider that Bootstrap was loaded.
                //
                var reportErrorForm = '<div class="container"><div class="page-header"><h1 class="text-danger">Application could not start.</h1></div></div>';
                document.body.innerHTML = reportErrorForm;
            };

            requirejs(['app/app'],
                function(app) {
                    try {
                        // Call done so that any error occurred during initialization will be caught and reported
                        app.start().done();
                    }
                    catch (error) {
                        _reportApplicationStartupFailure(error);
                    }
                },
                function(error) {
                    _reportApplicationStartupFailure(error);
                });
        }
    });
})();
