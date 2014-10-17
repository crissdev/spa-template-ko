/**
 * shell
 *
 * Registers routes for the root section of the DEMO.
 * It also registers a default route.
 */
define(function(require) {
    'use strict';

    function init() {
        var router = require('$router');
        var ko = require('knockout');

        ko.components.register('main-nav', {require: 'app/shell/components/main-nav/main-nav'});

        router
            .when('/', {
                viewModelUrl: 'app/shell/home/home',
                templateUrl: 'text!app/shell/home/home.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    }

    return { init: init };
});
