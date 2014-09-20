/**
 * Router module
 * @alias $router
 *
 * Provides a simple API to handle routes registration. It also watches for window hash changes
 * and passes the hash to crossroads instance. Options can be set through module's configuration.
 */
define(function(require, exports, module) {
    'use strict';

    var crossroads  = require('crossroads'),
        hasher      = require('hasher'),
        config      = module.config(),
        serviceInstance = {};


    crossroads.greedyEnabled = !!config.greedyEnabled;
    crossroads.ignoreState = config.hasOwnProperty('ignoreState') ? !!config.ignoreState : true;

    hasher.prependHash = config.prependHash || '';
    hasher.changed.add(function(newHash) { crossroads.parse(newHash); });
    hasher.initialized.addOnce(function(newHash) { crossroads.parse(newHash); });


    serviceInstance.when = function(pattern, options) {
        if (pattern === null) {
            serviceInstance._missingRouteOptions = options;
        }
        else {
            var crossroadsRoute = crossroads.addRoute(pattern, null, options.priority);
            crossroadsRoute.rules = options.rules;
            crossroadsRoute.$definition = options;
        }
        return serviceInstance;
    };

    serviceInstance.otherwise = function(options) {
        if (!options.redirectTo) {
            throw new Error('Missing route should redirect to a default route.');
        }
        return serviceInstance.when(null, options);
    };

    return serviceInstance;
});
