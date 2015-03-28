/**
 * Created by dingye on 2014/5/11.
 */
define('EventEmitter', 'Promise', function (EventEmitter) {
    function Promise() {
        Promise.superClass.call(this);
    };
    Promise.event = {
        success: 'success',
        error: 'error',
        progress: 'progress'
    };
    ClassManager.extend(Promise, EventEmitter);
    Promise.prototype.then = function (fulfilledHandler, errorHandler, progressHandler) {
        if ($.isFunction(fulfilledHandler)) {
            this.on(Promise.event.success, fulfilledHandler);
        }
        if ($.isFunction(errorHandler)) {
            this.on(Promise.event.error, errorHandler);
        }
        if ($.isFunction(progressHandler)) {
            this.on(Promise.event.progress, progressHandler);
        }
        return this;
    }
    return Promise;
});


