define(['knockout', 'app/frameworks/libraries'], function(ko, libraries) {
    'use strict';

    function AllFrameworksPage() {
        this.title = ko.observable('Frameworks');
        this.libraries = libraries.map(function(item) {
            return {
                name: item.name,
                title: item.title || item.name
            };
        });
    }

    return AllFrameworksPage;
});
