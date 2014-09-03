define(['$app'], function($app) {
    'use strict';

    describe('$app', function() {
       it('should have a start method', function() {
           expect($app.start).toBeDefined();
       });
    });
});
