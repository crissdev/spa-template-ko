/**
 * Eventing Service
 * @alias $events
 *
 * This module can be used as a way to communicate between components in the application.
 */
define(['signals'], function(signals) {
    'use strict';

    var Signal = signals.Signal,
        serviceInstance = {},
        _signals = {};


    serviceInstance.on = function(eventName, handler, handlerContext) {
        var signal = _signals[eventName] || (_signals[eventName] = new Signal());
        signal.add(handler, handlerContext);
        return serviceInstance;
    };

    serviceInstance.once = function(eventName, handler, handlerContext) {
        var signal = _signals[eventName] || (_signals[eventName] = new Signal());
        signal.addOnce(handler, handlerContext);
        return serviceInstance;
    };

    serviceInstance.off = function(eventName, handler, handlerContext) {
        var signal = _signals[eventName];

        if (signal) {
            signal.remove(handler, handlerContext);
        }
        return serviceInstance;
    };

    serviceInstance.dispatch = function() {
        var eventName = arguments[0],
            eventArgs = Array.prototype.slice.call(arguments, 1),
            signal = _signals[eventName];

        if (signal) {
            signal.dispatch.apply(signal, eventArgs);
        }
        return serviceInstance;
    };


    return serviceInstance;
});
