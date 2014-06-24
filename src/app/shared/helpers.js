define(function(require) {
    'use strict';


    function qRequire() {
        var q = require('q'),
            deferred = q.defer(),
            _slice = Array.prototype.slice,
            dependencies = _slice.call(arguments);
        require(dependencies,
            function() {
                deferred.resolve(_slice.call(arguments));
            },
            function(error) {
                deferred.reject(error);
            });
        return deferred.promise;
    }


    return { qRequire: qRequire };
});
