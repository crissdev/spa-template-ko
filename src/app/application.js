/**
 * Application module
 * @alias $app
 *
 * The role of this module is to initialize different parts of the application. It does this
 * by calling the init method on each moduleInit dependency found in module configuration.
 *
 * The module configuration is found in main.js, and dependencies are injected during build.
 *
 */
define(function(require, exports, module) {
    'use strict';

    var q       = require('q'),
        ko      = require('knockout'),
        helpers = require('app/shared/helpers'),
        config  = module.config();


    /**
     * Initialize each module and apply top level bindings.
     *
     * @returns {Promise} A q promise that will have no value on success, but an error on failure.
     */
    function start() {
        return _initModules()
            .then(function() {
                // This will make document level bindings to be applied and to start the router
                ko.applyBindings({});
            });
    }

    /**
     * Initialize all modules available in the configuration. If any of these modules
     * fails to initialize, then the application will fail to start and the returned
     * Promise will be rejected.
     * @returns {Promise}
     * @private
     */
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
        return q.when();
    }

    return {
        start: start
    };
});
