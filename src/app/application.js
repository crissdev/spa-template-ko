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
        helpers = require('app/shared/helpers'),
        config  = module.config();


    /**
     * Ensure core dependencies are loaded first
     * For instance, knockout will not use jQuery if it's loaded first.
     * @private
     */
    function _loadCoreDependencies() {
        // bootstrap will load jQuery because bootstrap module is an AMD module (see gulpfile.js)
        // Other dependencies that may go here as well: knockout-validation etc.
        return helpers.qRequire('bootstrap');
    }


    /**
     * Initialize each module and apply top level bindings.
     *
     * @returns {Promise} A q promise that will have no value on success, but an error on failure.
     */
    function start() {
        return _loadCoreDependencies()
            .then(function() {
                return _initModules();
            })
            .then(function() {
                return helpers.qRequire('knockout')
                    .spread(function(ko) {
                        // This will make document level bindings to be applied and to start the router
                        ko.applyBindings({});
                    });
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


    //
    // Start the application
    //
    try {
        start().done();
    }
    catch (e) {
        console.error(e);
        // Default is to clear up the whole document and replace it with an error message
        document.body.innerHTML = '<div class="container"><div class="page-header">' +
        '<h1 class="text-danger">Application could not start :-(</h1></div>' +
        '<div style="margin-top"><code>' + e.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>&nbsp;&nbsp;') + '</code></div>' + '</div>';
        throw e;
    }
});
