define(function(require, exports) {
    'use strict';

    //region Dependencies

    var Crossroads  = require('crossroads'),
        hasher      = require('hasher'),
        events      = require('app/shared/events');

    //endregion

    var router = Crossroads.create(),
        registeredRoutes = {};

    //region Initialization

    // Don't prepend hash with anything because we don't target any search engines
    hasher.prependHash = '';

    // addOnce helps redirect to work well with silent flag set
    hasher.initialized.addOnce(_executeMatchingRequest);

    // Whenever the hash changes a (matching) route will be executed
    hasher.changed.add(_executeMatchingRequest);

    // Speed-up lookup process
    router.greedyEnabled = false;

    // Allow the same route to be executed (only if something in the URL is different - ie. the last slash, search parameters etc.)
    // This will help other components to run the same route without hacking the router.
    router.ignoreState = true;

    router.routed.add(_onRouteMatched);
    router.bypassed.add(_onRouteBypassed);

    //endregion

    //region Private API

    function _executeMatchingRequest(newHash) {
        router.parse(newHash);
    }

    function _onRouteMatched(request, data) {
        console.log('navigator::_onRouteMatched', request, data);

        var routePattern = data.route._pattern;
        if (Object.prototype.toString.call(routePattern) === '[object RegExp]') {
            routePattern = routePattern.source;
        }
        var routeInformation = registeredRoutes[routePattern];

        if (routeInformation) {
            events.navigation.navigate.dispatch({ location: routePattern, routeParams: data.params, viewPage: routeInformation.viewPage });
        }
        else {
            // Redirect by default to /
            var notFoundEventArgs = { redirectUrl: '/', replace: false };
            events.navigation.notFound.dispatch(notFoundEventArgs);

            if (notFoundEventArgs.redirectUrl) {
                redirect(notFoundEventArgs.redirectUrl, undefined, notFoundEventArgs.replace);
            }
        }
    }

    function _onRouteBypassed(request) {
        console.log('navigator::_onRouteBypassed: ', request);

        // Redirect by default to /
        var notFoundEventArgs = { redirectUrl: '/', replace: false, location: request };
        events.navigation.notFound.dispatch(notFoundEventArgs);

        if (notFoundEventArgs.redirectUrl) {
            console.log('navigator::_onRouteBypassed: Redirecting to ', notFoundEventArgs.redirectUrl);
            redirect(notFoundEventArgs.redirectUrl, undefined, notFoundEventArgs.replace);
        }
    }

    //endregion

    //region Public API

    //
    // Regular expressions used to validate route parameters
    //
    exports.paramsValidation = {
        // Validates a library name
        libName: /^[-._a-z0-9 ]{1,30}$/i
    };

    Object.defineProperty(exports, 'currentLocation', {
        get: hasher.getHash.bind(hasher),
        set: hasher.setHash.bind(hasher)
    });


    function run(location) {
        if (location) {
            hasher.setHash(location);
        }
        hasher.init();
    }

    function redirect(location, silent, replace) {
        if (silent) {
            hasher.changed.active = false;
        }
        try {
            if (replace) {
                hasher.replaceHash(location);
            }
            else {
                hasher.setHash(location);
            }
        }
        finally {
            if (silent) {
                hasher.changed.active = false;
            }
        }
    }

    function registerRoutes(routes) {
        for (var routePattern in routes) {
            if (routes.hasOwnProperty(routePattern)) {
                var routeData = routes[routePattern],
                    routeRegistration = {
                        viewPage: routeData.viewPage
                    };

                var crossroadsRoute = router.addRoute(routePattern, null, routeData.priority);
                crossroadsRoute.rules = routeData.rules;

                // Fo development this field might be useful
                //routeRegistration.__route__ = crossroadsRoute;

                registeredRoutes[routePattern] = routeRegistration;
            }
        }
    }

    function reloadPage() {
        window.location.reload();
    }

    //endregion

    exports.run = run;
    exports.redirect = redirect;
    exports.run = run;
    exports.redirect = redirect;
    exports.registerRoutes = registerRoutes;
    exports.reloadPage = reloadPage;
});
