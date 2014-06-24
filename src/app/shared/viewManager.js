define(function(require) {
    'use strict';

    //
    // Handle view loading and presenting into DOM
    //

    //region Dependencies

    var q                   = require('q'),
        ko                  = require('knockout'),
        jQuery              = require('jquery'),
        viewLocator         = require('app/shared/viewLocator'),
        navigator           = require('app/shared/navigator'),
        events              = require('app/shared/events'),
        helpers             = require('app/shared/helpers'),
        _$viewContainer     = null;

    //endregion

    //region Private API

    function _onNavigate(eventData) {
        var routeParams = eventData.routeParams,
            viewPage = eventData.viewPage;

        //TODO: If for some reason (ie. data binding errors etc.) the view cannot be shown --> redirect to an error page
        _showViewPage(viewPage, routeParams)
            .catch(function(error) {
                console.error(error);

                // Treat it as 404 until we find a better way to do it :-)
                navigator.redirect('/404');
            })
            .done();
    }

    function _onNavigateFailed(eventData) {
        eventData.redirectUrl = '/404';
        eventData.replace = true;
    }


    function _showViewPage(viewPage, routeParams) {
        //
        // We should have all the info required in viewPage
        //
        return q.try(_destroyCurrentViewPage)
            .then(function() {
                if (typeof viewPage === 'string') {
                    // short form
                    var resourceBaseName = viewPage + viewPage.substr(viewPage.lastIndexOf('/'));

                    viewPage = {
                        // HTML
                        templateUrl: 'text!' + resourceBaseName + '.html',
                        // JavaScript
                        viewModelUrl: resourceBaseName
                    };
                }

                return viewLocator.resolve(viewPage)
                    .then(function(response) {
                        var $element = response.element,
                            viewModel = response.viewModel;

                        if (!$element || $element.size() === 0) {
                            $element = jQuery('<div data-fallback="true" data-generated="true"></div>');
                        }
                        else if ($element.get(0).nodeType !== 1) {
                            var $wrapperElement = jQuery('<div data-wrapper="true" data-generated="true"></div>');
                            $wrapperElement.append($element);
                            $element = $wrapperElement;
                        }

                        $element.attr('data-role', 'viewpage');

                        // Attach to DOM
                        _$viewContainer.append($element);

                        // Initialize the view
                        if (jQuery.isFunction(viewModel.$onLoad)) {
                            viewModel.$onLoad.apply(viewModel, [$element].concat(routeParams));
                        }

                        // Show in DOM
                        $element.show();
                    });
            });
    }

    function _destroyCurrentViewPage() {
        var $currentViewElement = _$viewContainer.find('[data-role="viewpage"]').first(),
            currentViewModel = $currentViewElement.size() > 0 ? ko.dataFor($currentViewElement.get(0)) : null;

        if (currentViewModel && jQuery.isFunction(currentViewModel.$onDestroy)) {
            try {
                currentViewModel.$onDestroy($currentViewElement);
                currentViewModel.$destroyed = true;
            }
            catch (error) {
                console.warn('Error thrown while destroying current view: ', error);
                console.trace();
            }
        }
        if ($currentViewElement.size() > 0) {
            $currentViewElement.hide();

            // Ensure cleanup
            ko.removeNode($currentViewElement.get(0));

            // Ensure the container is empty; just in case the viewManager was invoked too fast -> this might pop up a bug in Development
            _$viewContainer.empty();
        }
        return q.resolve();
    }


    //endregion

    //region Public API

    function init(viewContainerElement) {
        _$viewContainer = jQuery(viewContainerElement);
        events.navigation.navigate.add(_onNavigate);
        events.navigation.notFound.add(_onNavigateFailed);
    }

    //endregion

    return { init: init };
});
