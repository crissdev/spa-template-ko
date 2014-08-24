define(['app/shared/router'], function(router) {
    'use strict';

    function _registerRoutes() {
        router
            .when('/', {
                template: '<div><h1>Home</h1><br><h4>This is just a default home page.</h4></div>'
            })
            .when('/404/', {
                template: '<div><h1>Not Found</h1><br><h4 class="text-danger">The page you are looking for does not exist or has been moved.</h4></div>'
            });
    }

    function init() {
        _registerRoutes();
    }

    return { init: init };
});
