define(function(require) {
    'use strict';


    function _initModules() {
        var q = require('q'),
            modules = [
                require('app/frameworks/moduleInit'),
                require('app/shell/moduleInit')
            ],
            initMethods = modules.reduce(
                function(methodsList, module) {
                    if (module && typeof module.init === 'function') {
                        methodsList.push(q.try(module.init));
                    }
                    return methodsList;
                }, []);
        return q.all(initMethods);
    }

    function _initViewManager() {
        var helpers = require('app/shared/helpers');
        return helpers.qRequire('app/shared/viewManager')
            .spread(function(viewManager) {
                var container = document.querySelector('[data-role="view-container"]');
                return viewManager.init(container);
            });
    }

    function _initNavigator() {
        var helpers = require('app/shared/helpers');
        return helpers.qRequire('app/shared/navigator')
            .spread(function(navigator) {
                return navigator.run();
            });
    }


    function start() {
        var q = require('q');
        // This might be useful for development
        // q.longStackSupport = true;
        return q.try(_initModules).then(_initViewManager).then(_initNavigator);
    }


    return { start: start };
});
