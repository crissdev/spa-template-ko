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
        ko          = require('knockout'),
        config      = module.config(),
        serviceInstance = {},
        _currentRoute = ko.observable(),
        _currentLocation = ko.observable();


    function ensureTrailingSlash(location) {
        var index = location.indexOf('?'),
            newLocation = location;

        if (index > 0 && newLocation[index - 1] !== '/') {
            newLocation = newLocation.slice(0, index) + '/' + newLocation.slice(index);
        }
        else if (index < 0 && newLocation[newLocation.length - 1] !== '/') {
            newLocation += '/';
        }
        if (location !== newLocation) {
            var previouslyActive = hasher.changed.active;
            hasher.changed.active = false;
            hasher.replaceHash(newLocation);
            hasher.changed.active = previouslyActive;
        }
        return newLocation;
    }

    function onRouteChanged(location, data) {
        _currentLocation(location);
        _currentRoute(data.route._pattern);
    }

    crossroads.greedyEnabled = !!config.greedyEnabled;
    crossroads.ignoreState = config.hasOwnProperty('ignoreState') ? !!config.ignoreState : true;
    crossroads.routed.add(onRouteChanged);

    hasher.prependHash = config.prependHash || '';
    hasher.changed.add(function(newHash) { crossroads.parse(ensureTrailingSlash(newHash)); }, undefined, 100);
    hasher.initialized.addOnce(function(newHash) { crossroads.parse(ensureTrailingSlash(newHash)); }, undefined, 100);

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

    serviceInstance.currentLocation = ko.pureComputed(function() { return _currentLocation(); });
    serviceInstance.currentRoute = ko.pureComputed(function() { return _currentRoute(); });


    return serviceInstance;
});
