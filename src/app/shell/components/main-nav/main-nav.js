define(function(require) {
    'use strict';

    var $router = require('$router');

    function MainNav() {
        this.currentLocation = $router.currentLocation;
    }

    return {viewModel: MainNav, template: require('text!app/shell/components/main-nav/main-nav.html')};
});
