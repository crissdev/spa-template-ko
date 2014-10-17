define(function(require) {
    'use strict';

    var ko = require('knockout'),
        libraries = require('app/libs/libraries');

    function LibraryDetails(params) {
        var libraryName = ko.unwrap(params.name),
            info = ko.utils.arrayFirst(libraries, function(item) { return item.name === libraryName; });

        this.name = ko.observable();
        this.title = ko.observable();
        this.description = ko.observableArray();
        this.links = ko.observableArray();

        if (info) {
            this.name(info.name);
            this.title(info.title || info.name);
            this.description(info.description);
            this.links(info.links);
        }
    }

    return {
        viewModel: LibraryDetails,
        template: require('text!app/libs/components/library-details/library-details.html')
    };
});
