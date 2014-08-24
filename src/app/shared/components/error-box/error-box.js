define(function(require) {
    'use strict';

    var ko = require('knockout'),
        events = require('app/shared/events'),
        errorHandler = require('app/shared/errorHandler');


    function ErrorBox(params) {
        if (ko.isObservable(params.error)) {
            var underlyingObservable = params.error;

            this.pageError = ko.computed({
                read: function() {
                    return underlyingObservable();
                },
                write: function(value) {
                    if (ko.isWriteableObservable(underlyingObservable)) {
                        if (underlyingObservable() !== value) {
                            underlyingObservable(value);
                            this.notifySubscribers();
                        }
                    }
                }
            });
        }
        else {
            this.pageError = ko.observable(params.error);
        }

        events.on(errorHandler.errorEventName, this._onAppError, this);
    }

    ErrorBox.prototype.dispose = function() {
        events.off(errorHandler.errorEventName, this._onAppError);

        if (ko.isComputed(this.pageError)) {
            this.pageError.dispose();
        }
    };

    ErrorBox.prototype._onAppError = function(errorMessage) {
        this.pageError(errorMessage);
    };


    return {
        viewModel: ErrorBox,
        template: require('text!app/shared/widgets/error-box/error-box.html')
    };
});
