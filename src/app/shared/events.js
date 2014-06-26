define(function(require) {
    'use strict';

    var Signal = require('signals').Signal;


    return {
        navigation: {
            /**
             * Navigate to requested location.
             */
            navigate: new Signal(),

            /**
             * The requested location is not available (In such cases the event data should specify a redirect URL)
             */
            notFound: new Signal()
        }
    };
});
