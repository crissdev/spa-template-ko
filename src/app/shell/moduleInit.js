define(function(require) {
    'use strict';

    var q = require('q'),
        helpers = require('app/shared/helpers');


    function _registerRoutes() {
        return helpers.qRequire('app/shared/navigator')
            .spread(function(navigator) {
                var routes = {
                    '/': {
                        viewPage: {
                            template: '<div><h1>Home</h1><br><h4>This is just a default home page.</h4></div>'
                        }
                    },
                    '/404/': {
                        viewPage: {
                            template: '<div><h1>Not Found</h1><br><h4 class="text-danger">The page you are looking for does not exist or has been moved.</h4></div>'
                        }
                    }
                };
                navigator.registerRoutes(routes);
            });
    }

    function init() {
        return q.try(_registerRoutes);
    }


    return { init: init };
});
