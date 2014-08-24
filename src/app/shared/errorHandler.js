/**
 * Error Handling Service
 * @alias $errorHandler
 */
define(function(require, exports, module) {
    'use strict';

    var events          = require('app/shared/events'),
        i18next         = require('i18next'),
        q               = require('q'),
        config          = module.config(),
        serviceInstance = {},
        _customHandlers = {};


    Object.defineProperties(serviceInstance, {
        defaultErrorCode: {
            value: config.defaultErrorCode || 'generic',
            writable: true
        },
        defaultErrorMessage: {
            value: config.defaultErrorMessage || 'Something went wrong',
            writable: true
        },
        errorsPrefix: {
            value: config.errorsPrefix || 'errors.',
            writable: true
        },
        errorEventName: {
            value: config.errorEventName || 'app-error',
            writable: true
        }
    });

    /**
     * Extracts the underlying error code from a given error.
     * @param error {String|Error|Object} The error from which to extract the error code.
     * @returns {String} The underlying error code, or default error code if it cannot be determined.
     */
    serviceInstance.getErrorCode = function(error) {
        var errorCode;

        if (error) {
            if (error instanceof Error) {
                errorCode = error.message;
            }
            else if (typeof error === 'string') {
                errorCode = error;
            }
            else if (error.code) {
                errorCode = error.code;
            }
        }
        return errorCode || serviceInstance.defaultErrorCode;
    };

    /**
     * Returns the localized error message for a given error.
     * @param error {String|Error|Object} The error to format.
     * @param params {Object} Interpolation parameters to pass along to translation service.
     * @returns {Promise}
     */
    serviceInstance.formatError = function(error, params) {
        var translationKey = serviceInstance.errorsPrefix + serviceInstance.getErrorCode(error),
            deferred = q.defer();

        i18next.translate(translationKey, params)
            .then(function(translation) {
                deferred.resolve(translation);
            })
            .catch(function() {
                console.log('The translation key ' + translationKey + ' is not mapped');
                deferred.resolve(serviceInstance.defaultErrorMessage);
            });
        return deferred.promise;
    };

    /**
     * Attempts to handle the given error.
     * If no custom handler is defined for the error, it will be formatted and notified through
     * $events service.
     * @param error {String|Error|Object} The error to handle.
     * @param params {Object} Interpolation parameters to pass along to translation service.
     * @returns {Promise}
     */
    serviceInstance.handleError = function(error, params) {
        var errorCode = serviceInstance.getErrorCode(error),
            customHandler = _customHandlers[errorCode];

        return serviceInstance.formatError(error, params)
            .then(function(errorMessage) {
                if (customHandler) {
                    customHandler.handler.call(customHandler.context, error);

                    // A custom error handler should perform an action that no longer requires to
                    // dispatch the error through $events module.
                }
                else {
                    events.emit(serviceInstance.errorEventName, errorMessage, errorCode);
                }
                return errorMessage;
            });
    };

    /**
     * Associate a custom handler for a given error.
     * The error handler will be called with the error provided through handleError method.
     * @param errorCode {String} The error code.
     * @param handler {Function} The function that will handle the error.
     * @param handlerContext {*} The context (this object) to use when calling the handler.
     */
    serviceInstance.setCustomHandler = function(errorCode, handler, handlerContext) {
        if (errorCode && typeof handler === 'function') {
            _customHandlers[errorCode] = {
                handler: handler,
                context: handlerContext
            };
        }
    };


    return serviceInstance;
});
