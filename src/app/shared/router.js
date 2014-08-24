/**
 * Router module
 */
define(function(require, exports, module) {
    'use strict';

    var crossroads  = require('crossroads'),
        hasher      = require('hasher'),
        config      = module.config(),
        serviceInstance = {};


    crossroads.greedyEnabled = !!config.greedyEnabled;
    crossroads.ignoreState = config.hasOwnProperty('ignoreState') ? !!config.ignoreState : true;

    hasher.prependHash = config.prependHash || '!';
    hasher.changed.add(function(newHash) { crossroads.parse(newHash); });
    hasher.initialized.addOnce(function(newHash) { crossroads.parse(newHash); });


    serviceInstance.when = function(pattern, options) {
        var crossroadsRoute = crossroads.addRoute(pattern, null, options.priority);
        crossroadsRoute.rules = options.rules;
        crossroadsRoute.$definition = options;
        return serviceInstance;
    };

    serviceInstance.otherwise = function(options) {
        //TODO: Not yet implemented
        return serviceInstance;
    };

    return serviceInstance;
});
