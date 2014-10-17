#==============================================================================
# libs
#
# CoffeeScript can be used along with JavaScript - the build script will
# know how to handle them.
#
# Registers the routes for lib/ section of the DEMO
#==============================================================================
define (require) ->
  ko = require('knockout')
  router = require('$router')

  _registerRoutes = () ->
    router
      .when '/libs/all/',
        templateUrl: 'text!app/libs/all/all.html'
        viewModelUrl: 'app/libs/all/all'
      .when '/libs/view/{name}/',
        templateUrl: 'text!app/libs/view/view.html'
        viewModelUrl: 'app/libs/view/view'
        rules:
          name: /^[-._a-z0-9 ]{1,30}$/i

  #
  # Register KO components exposed by this module
  #
  _registerComponents = () ->
    ko.components.register('library-details',
      require: 'app/libs/components/library-details/library-details')

  init = () ->
    _registerRoutes()
    _registerComponents()
    return

  return {init}
