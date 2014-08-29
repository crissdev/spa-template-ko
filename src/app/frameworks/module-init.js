define(['knockout', 'app/shared/router'], function(ko, router) {
    'use strict';

    function _registerRoutes() {
        router
            .when('/frameworks/all/', {
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

    function _registerComponents() {
        ko.components.register('library-details', { require: 'app/frameworks/components/library-details/library-details' });
    }

    function init() {
        _registerRoutes();
        _registerComponents();
    }

    return { init: init };
});
