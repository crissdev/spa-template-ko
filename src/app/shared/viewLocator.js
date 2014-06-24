define(function(require) {
    'use strict';

    //
    // The module that loads HTML and Javascript and performs data binding
    //


    //
    // Same options as for resourceLoader
    //
    function resolve(options, cancelPromise) {
        var q = require('q'),
            jQuery = require('jquery'),
            ko = require('knockout'),
            resourceLoader = require('app/shared/resourceLoader');

        // Clone the options object so we don't have strange/stupid bugs or unexpected behavior
        options = jQuery.extend({}, options);

        return resourceLoader.load(options)
            .spread(function($element, viewModel) {
                if (cancelPromise && cancelPromise.isFulfilled()) {
                    throw new Error('operation-cancelled');
                }

                if (!$element || $element.size() === 0) {
                    // If the template is empty then it means that bareTemplate was true and no content was provided for the template.
                    // So instead of applying bindings to some ghost element, we simply return only the viewModel
                    return { viewModel: viewModel };
                }

                var bindingContext = viewModel;

                if (options.parentContext && options.parentContext.createChildContext) {
                    bindingContext = options.parentContext.createChildContext(viewModel);
                }
                ko.applyBindings(bindingContext, $element.get(0));

                return { element: $element, viewModel: viewModel };
            });
    }

    return { resolve: resolve };
});
