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
        serviceInstance = {},
        _currentRoute, _currentLocation;


    function ensureTrailingSlash(location) {
        var index = location.indexOf('?');
        if (index > 0 && location[index - 1] !== '/') {
            location = location.slice(0, index) + '/' + location.slice(index);
        }
        else if (index < 0 && location[location.length - 1] !== '/') {
            location += '/';
        }
        var previouslyActive = hasher.changed.active;
        hasher.changed.active = false;
        hasher.replaceHash(location);
        hasher.changed.active = previouslyActive;

        return location;
    }

    function onRouteChanged(location, data) {
        _currentLocation = location;
        _currentRoute = data.route._pattern;
    }

    crossroads.greedyEnabled = !!config.greedyEnabled;
    crossroads.ignoreState = config.hasOwnProperty('ignoreState') ? !!config.ignoreState : true;
    crossroads.routed.add(onRouteChanged);

    hasher.prependHash = config.prependHash || '';
    hasher.changed.add(function(newHash) { crossroads.parse(ensureTrailingSlash(newHash)); });
    hasher.initialized.addOnce(function(newHash) { crossroads.parse(ensureTrailingSlash(newHash)); });

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
            throw new Error('Missing route should redirect to a default route');
        }
        return serviceInstance.when(null, options);
    };

    Object.defineProperties(serviceInstance, {
        currentRoute: {
            get: function() { return _currentRoute; }
        },
        currentLocation: {
            get: function() { return _currentLocation; }
        }
    });


    return serviceInstance;
});
