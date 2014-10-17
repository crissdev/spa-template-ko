(function() {
  define(function(require) {
    var init, ko, router, _registerComponents, _registerRoutes;
    ko = require('knockout');
    router = require('$router');
    _registerRoutes = function() {
      return router.when('/libs/all/', {
        templateUrl: 'text!app/libs/all/all.html',
        viewModelUrl: 'app/libs/all/all'
      }).when('/libs/view/{name}/', {
        templateUrl: 'text!app/libs/view/view.html',
        viewModelUrl: 'app/libs/view/view',
        rules: {
          name: /^[-._a-z0-9 ]{1,30}$/i
        }
      });
    };
    _registerComponents = function() {
      return ko.components.register('library-details', {
        require: 'app/libs/components/library-details/library-details'
      });
    };
    init = function() {
      _registerRoutes();
      _registerComponents();
    };
    return {
      init: init
    };
  });

}).call(this);
