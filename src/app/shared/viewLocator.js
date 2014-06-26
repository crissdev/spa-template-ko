define(function(require) {
    'use strict';

    var q = require('q'),
        ko = require('knockout'),
        jQuery = require('jquery'),
        resourceLoader = require('app/shared/resourceLoader');


    //
    // Same options as for resourceLoader
    //
    function resolve(options, cancelPromise) {
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
