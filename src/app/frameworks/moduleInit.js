define(function(require) {
    'use strict';

    //
    // This where this module gets initialized
    //

    function _registerCustomBindings() {
        // This might be extracted in a separate file
        var ko = require('knockout'),
            bindingHandlers = ko.bindingHandlers;

        bindingHandlers.authorLabel = {
            update: function(element, valueAccessor) {
                element.innerText = ko.unwrap(valueAccessor()) || 'No author';
            }
        };
    }

    function _registerRoutes() {
        var helpers = require('app/shared/helpers');
        return helpers.qRequire('app/shared/navigator')
            .spread(function(navigator) {
                var routes = {
                    '/frameworks/all/': {
                        viewPage: 'app/frameworks/all'
                    },
                    '/frameworks/view/{name}/': {
                        viewPage: 'app/frameworks/view',
                        rules: {
                            name: navigator.paramsValidation.libName,
                            normalize_: function(req, vals) {
                                return {
                                    name: vals.name
                                };
                            }
                        }
                    }
                };
                navigator.registerRoutes(routes);
            });
    }


    function init() {
        var q = require('q');
        return q.try(_registerRoutes).then(_registerCustomBindings);
    }


    return { init: init };
});
