define(function(require) {
    'use strict';

    var q = require('q');


    function qRequire() {
        var deferred = q.defer();
        require(Array.prototype.slice.call(arguments),
            function() {
                deferred.resolve(Array.prototype.slice.call(arguments));
            },
            function(error) {
                deferred.reject(error);
            });
        return deferred.promise;
    }


    return { qRequire: qRequire };
});
