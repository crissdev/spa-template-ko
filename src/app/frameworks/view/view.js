define(['knockout'], function(ko) {
    'use strict';

    function FrameworkDetailsViewPage(routeParams) {
        this.title = ko.observable(routeParams.name);
        this.name = ko.observable(routeParams.name);
    }

    return FrameworkDetailsViewPage;
});
