define(['knockout', 'crossroads', 'hasher'], function(ko, crossroads, hasher) {
    'use strict';

    function ViewContainer() {
        this.component = ko.observable();

        crossroads.routed.add(function(location, data) {
            var $routeInfo = data.route.$definition,
                routeParams = {};

            data.route._paramsIds.forEach(function(paramId, index) {
                if (data.params[index] !== undefined) {
                    routeParams[paramId] = data.params[index];
                }
            });

            var componentInfo = {
                name: $routeInfo.$component
            };

            if (!componentInfo.name) {
                if ($routeInfo.template) {
                    componentInfo.template = $routeInfo.template;
                }
                else if ($routeInfo.templateUrl) {
                    componentInfo.template = { require: $routeInfo.templateUrl };
                }

                if ($routeInfo.viewModel) {
                    switch (typeof $routeInfo.viewModel) {
                        case 'function':
                            componentInfo.viewModel = $routeInfo.viewModel;
                            break;

                        case 'string':
                            componentInfo.viewModel = { require: $routeInfo.viewModelUrl };
                            break;
                    }
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
            console.warn('404: ' + location);
            this.component(undefined);
        }, this);

        hasher.init();
    }

    return {
        viewModel: ViewContainer,
        template: '<div data-bind="if: $data.component"><div data-bind="component: $data.component"></div></div>'
    };
});
