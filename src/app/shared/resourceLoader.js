define(function(require) {
    'use strict';

    //region Dependencies

    var q       = require('q'),
        jQuery  = require('jquery'),
        helpers = require('app/shared/helpers');

    //endregion

    //region Private API

    //
    // Load all dependencies specified in options.inject
    //
    function _resolveInjectedDependencies(dependencies) {
        var promises = dependencies.map(
            function(dependency) {
                if (typeof dependency === 'string') {
                    return helpers.qRequire(dependency)
                        .spread(function() {
                            return arguments[0];
                        });
                }
                else if (typeof dependency === 'function') {
                    return q.try(dependency);
                }
                return q.resolve(dependency);
            });
        return q.all(promises);
    }

    function _resolveTemplate(options) {
        return q.try(
            function() {
                /*jshint camelcase:false*/
                var option_template = options.template,
                    option_templateUrl = options.templateUrl;

                if (option_template) {
                    return q.resolve(option_template);
                }
                if (option_templateUrl) {
                    return helpers.qRequire(option_templateUrl)
                        .spread(function() {
                            return arguments[0];
                        });
                }
            })
            .then(function(content) {
                /*jshint camelcase:false*/
                var element = document.createElement('div'),
                    option_bareTemplate = options.bareTemplate;

                element.setAttribute('data-generated', 'true');

                if (typeof content === 'string' && content.length > 0) {
                    element.insertAdjacentHTML('afterbegin', content.trim());

                    if (option_bareTemplate) {
                        return jQuery(element.children).detach();
                    }
                    if (element.firstChild && element.firstChild.nodeType === 1) {
                        return jQuery(element.removeChild(element.firstChild));
                    }
                }
                if (option_bareTemplate) {
                    return jQuery();
                }
                return jQuery(element);
            });
    }

    function _resolveViewModel(options) {
        return q.try(
            function() {
                /*jshint camelcase:false*/
                var option_viewModel = options.viewModel,
                    option_viewModelUrl = options.viewModelUrl;

                if (option_viewModel) {
                    return q.resolve(option_viewModel);
                }
                else if (option_viewModelUrl) {
                    return helpers.qRequire(option_viewModelUrl)
                        .spread(function() {
                            return arguments[0];
                        });
                }
            })
            .then(function(viewModel) {
                /*jshint newcap:false, camelcase:false*/
                if (typeof viewModel === 'function') {
                    // Check for injected dependencies
                    var option_inject = options.inject;

                    if (Array.isArray(option_inject) && option_inject.length > 0) {
                        return _resolveInjectedDependencies(option_inject)
                            .then(function(injectedDependencies) {
                                var instance = Object.create(viewModel.prototype);
                                if (viewModel.prototype.constructor) {
                                    viewModel.prototype.constructor.apply(instance, injectedDependencies);
                                }
                                else {
                                    viewModel.prototype.apply(instance, injectedDependencies);
                                }
                                return instance;
                            });
                    }
                    else {
                        /*jshint newcap:false*/
                        return new viewModel();
                    }
                }
                else if (typeof viewModel === 'object') {
                    return viewModel;
                }
                return {};
            });
    }

    //endregion

    //region Public API

    function loadTemplate(optionsOrTemplateUrl) {
        if (typeof optionsOrTemplateUrl === 'string') {
            return _resolveTemplate({ templateUrl: optionsOrTemplateUrl });
        }
        if (typeof optionsOrTemplateUrl === 'object') {
            return _resolveTemplate(optionsOrTemplateUrl);
        }
        return q.reject(new Error('Parameter must be an object or a resource URI.'));
    }

    function loadViewModel(optionsOrViewModelUrl) {
        if (typeof optionsOrViewModelUrl === 'string') {
            return _resolveViewModel({ viewModelUrl: optionsOrViewModelUrl });
        }
        if (typeof optionsOrViewModelUrl === 'object') {
            return _resolveViewModel(optionsOrViewModelUrl);
        }
        return q.reject(new Error('Parameter must be an object or a resource URI.'));
    }

    function load(options) {
        if (typeof options !== 'object') {
            return q.reject(new Error('An object must be passed in when calling this method.'));
        }
        return q.all([loadTemplate(options), loadViewModel(options)]);
    }

    //endregion


    return {
        load:           load,
        loadTemplate:   loadTemplate,
        loadViewModel:  loadViewModel
    };
});
