define(function(require) {
    'use strict';

    var q = require('q');


    function qRequire() {
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
