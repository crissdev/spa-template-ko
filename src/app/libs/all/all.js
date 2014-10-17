define(['knockout', 'app/libs/libraries'], function(ko, libraries) {
    'use strict';

    function AllLibrariesPage() {
        this.title = ko.observable('Libraries');
        this.libraries = libraries.map(function(item) {
            return {
                name: item.name,
                title: item.title || item.name
            };
        });
    }

    return AllLibrariesPage;
});
