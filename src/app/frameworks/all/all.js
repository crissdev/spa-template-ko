define(function(require) {
    'use strict';

    var ko = require('knockout');


    function AllFrameworksViewPage() {
        // title, number and helpers are injected dependencies
        // see app/libs/moduleInit.js
        this.title = ko.observable('Frameworks');
    }

    AllFrameworksViewPage.prototype.$onLoad = function($element, routeParams) {
    };


    return AllFrameworksViewPage;
});
