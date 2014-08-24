define(['app/shared/router'], function(router) {
    'use strict';

    function _registerRoutes() {
        router.when('/frameworks/all/', {
                templateUrl: 'text!app/frameworks/all/all.html',
                viewModelUrl: 'app/frameworks/all/all'
            })
            .when('/frameworks/view/{name}/', {
                templateUrl: 'text!app/frameworks/view/view.html',
                viewModelUrl: 'app/frameworks/view/view',
                rules: {
                    name: /^[-._a-z0-9 ]{1,30}$/i
                }
            });
    }

    function init() {
        _registerRoutes();
    }


    return { init: init };
});
