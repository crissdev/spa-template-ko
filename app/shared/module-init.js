define(['knockout'], function(ko) {
    'use strict';

    function init() {
        ko.components.register('ui-view', { require: 'app/shared/components/ui-view/ui-view' });
    }

    return { init: init };
});
