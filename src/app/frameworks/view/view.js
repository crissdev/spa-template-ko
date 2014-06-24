define(function(require) {
    'use strict';

    var ko = require('knockout');


    function FrameworkDetailsViewPage() {
        this.title = ko.observable('');
        this.name = ko.observable('');
    }

    FrameworkDetailsViewPage.prototype.$onLoad = function($element, routeParams) {
        this.title(routeParams.name);
        this.name(routeParams.name);
    };


    return FrameworkDetailsViewPage;
});
