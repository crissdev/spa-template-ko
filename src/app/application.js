/**
 * Application module
 */
define(function(require, exports, module) {
    'use strict';

    var q       = require('q'),
        ko      = require('knockout'),
        helpers = require('app/shared/helpers'),
        config  = module.config();

    function start() {
        return _initModules()
            .then(function() {
                // This will make document level bindings to be applied and to start the router
                ko.applyBindings({});
            });
    }

    function _initModules() {
        if (config.modules && config.modules.length > 0) {
            return helpers.qRequire(config.modules)
                .then(function(modules) {
                    var promises = modules.reduce(function(promises, moduleInstance) {
                        if (moduleInstance && typeof moduleInstance.init === 'function') {
                            promises.push(q.try(moduleInstance.init));
                        }
                        return promises;
                    }, []);
                    return q.all(promises);
                });
        }
    }

    return {
        start: start
    };
});
