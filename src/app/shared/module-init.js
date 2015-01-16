define(function(require) {
    'use strict';

    var ko = require('knockout');

    function init() {
        // Register components
        ko.components.register('ui-view', { require: 'app/shared/components/ui-view' });

        // Register custom bindings
        ko.bindingHandlers.context = require('app/shared/bindings/context');
        ko.virtualElements.allowedBindings.context = true;
        ko.expressionRewriting.bindingRewriteValidators.context = false;
    }

    return {init: init};
});
