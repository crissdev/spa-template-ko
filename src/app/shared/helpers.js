/**
 * Helpers module
 * @alias $helpers
 *
 * Helper methods intended to be used throughout the application.
 */
define(function(require) {
    'use strict';

    var q = require('q');


    /**
     * Retrieve dependencies using RequireJS and return them as a promise.
     *
     * @returns {Promise} On success, a resolved promise with its value set to
     * an array with the loaded dependencies. On failure, a rejected promise
     * containing the error.
     *
     * This is an all or nothing method - if any of the dependencies cannot be loaded
     * the method will return a rejected promise.
     *
     * @param {...*|Array} params Dependencies to load
     */
    function qRequire(params) {
        var deferred = q.defer();
        try {
            var _slice = Array.prototype.slice,
                dependencies = Array.isArray(arguments[0]) ? arguments[0] : _slice.call(arguments);

            require(dependencies, function() {
                    deferred.resolve(_slice.call(arguments));
                },
                function(error) {
                    deferred.reject(error);
                });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    }


    return { qRequire: qRequire };
});
