define(['knockout', 'app/frameworks/libraries'], function(ko, libraries) {
    'use strict';

    function FrameworkDetailsViewPage(routeParams) {
        var info = ko.utils.arrayFirst(libraries, function(item) {
            return item.name === routeParams.name;
        });

        this.title = ko.observable(routeParams.name);
        this.name = ko.observable(routeParams.name);

        if (info && info.title) {
            this.title(info.title);
        }
    }

    return FrameworkDetailsViewPage;
});
