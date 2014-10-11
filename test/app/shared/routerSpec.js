define(['$router'], function($router) {
    'use strict';

    describe('$router', function() {

        it('should have no default route configured', function() {
            expect($router._missingRouteOptions).toBeUndefined();
        });

        it('should register a default route', function() {
            $router.otherwise({redirectTo: '/'});
            expect($router._missingRouteOptions).toEqual({redirectTo: '/'});
        });

        it('should not register default route unless redirectTo is provided', function() {
            var route = {viewModel: function() {}, template: '<div></div>'};
            expect(function() { $router.otherwise(route); }).toThrow(
                new Error('Missing route should redirect to a default route.'));
        });
    });
});
