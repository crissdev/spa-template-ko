define(['knockout'], function(ko) {
    'use strict';

    return {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = ko.unwrap(valueAccessor()),
                data = ('data' in options) ? options.data : bindingContext.$rawData,
                alias = options.as;

            if (typeof alias !== 'string' || alias.length === 0) {
                throw new Error('alias must be a non-empty string');
            }

            var context = bindingContext.createChildContext(data, alias);
            ko.applyBindingsToDescendants(context, element);

            return {controlsDescendantBindings: true};
        }
    };
});
