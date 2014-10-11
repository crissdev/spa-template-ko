define(['app/shared/router', 'knockout', 'crossroads', 'hasher', 'jquery'], function(router, ko, crossroads, hasher, jQuery) {
    'use strict';

    function ViewContainer() {
        this.component = ko.observable();

        var redirectCount = 1,
            maxRedirect = 10;

        crossroads.routed.add(function(location, data) {
            var $routeInfo = data.route.$definition,
                routeParams = {};

            // Clear current view
            this.component(undefined);

            data.route._paramsIds.forEach(function(paramId, index) {
                var paramInfo = data.params[index];
                if (paramInfo) {
                    if (paramId.indexOf('?') === 0 && jQuery.isPlainObject(paramInfo)) {
                        Object.keys(paramInfo).forEach(function(paramId) {
                            routeParams[paramId] = paramInfo[paramId];
                        });
                    }
                    else {
                        routeParams[paramId] = data.params[index];
                    }
                }
            });

            if ($routeInfo.redirectTo) {
                redirectCount++;

                if (redirectCount > maxRedirect) {
                    redirectCount = 1;
                    throw new Error('Maximum redirection count reached.');
                }
                hasher.replaceHash($routeInfo.redirectTo);
                return;
            }

            var componentInfo = {
                name: $routeInfo.$component
            };

            redirectCount = 1;

            if (!componentInfo.name) {
                if ($routeInfo.template) {
                    componentInfo.template = $routeInfo.template;
                }
                else if ($routeInfo.templateUrl) {
                    componentInfo.template = { require: $routeInfo.templateUrl };
                }

                if ($routeInfo.viewModel) {
                    componentInfo.viewModel = $routeInfo.viewModel;
                }
                else if ($routeInfo.viewModelUrl) {
                    componentInfo.viewModel = { require: $routeInfo.viewModelUrl };
                }

                if (!componentInfo.name) {
                    componentInfo.name = $routeInfo.$component = 'c' + (+new Date());
                    ko.components.register(componentInfo.name, componentInfo);
                }
            }

            this.component({ name: componentInfo.name, params: routeParams });
        }, this);

        crossroads.bypassed.add(function(location) {
            if (router._missingRouteOptions) {
                this.component(undefined);
                hasher.replaceHash(router._missingRouteOptions.redirectTo);
            }
        }, this);

        hasher.init();
    }



    return {
        viewModel: ViewContainer,
        template: '<div data-bind="if: $data.component"><div data-bind="component: $data.component"></div></div>'
    };
});
