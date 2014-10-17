/**
 * Http module
 * @alias $http
 *
 * Provides an AngularJS like API to handle HTTP requests (GET, POST, PUT, etc.).
 * This means that request and response interceptors are available and can be used
 * the same way as in AngularJS.
 *
 */
define(['jquery', 'q', 'module'], function(jQuery, q, module) {
    'use strict';

    var moduleConfig = module.config();

    http.defaults = {};
    http.defaults.headers = moduleConfig.headers || {};
    http.defaults.timeout = moduleConfig.timeout || 30 * 1000;
    http.interceptors = [];


    function http(requestConfig) {
        var config = {
            method: 'get',
            headers: http.defaults.headers,
            timeout: http.defaults.timeout,
            cache: false
        };

        jQuery.extend(config, requestConfig);

        if (requestConfig.params) {
            var url = config.url || '/';
            config.url = url + (url.indexOf('?') === -1 ? '?' : '&') +
                jQuery.param(requestConfig.params);
        }

        var reversedInterceptors = http.interceptors.slice(0).reverse(),
            chain = [http.sendRequest, undefined],
            promise = q.when(config);

        reversedInterceptors.forEach(function(interceptor) {
            if (interceptor.request || interceptor.requestError) {
                chain.unshift(interceptor.request, interceptor.requestError);
            }
            if (interceptor.response || interceptor.responseError) {
                chain.push(interceptor.response, interceptor.responseError);
            }
        });

        while (chain.length) {
            var thenFn = chain.shift();
            var rejectFn = chain.shift();
            promise = promise.then(thenFn, rejectFn);
        }

        promise.success = function(fn) {
            promise.then(function(response) {
                fn(response.data, response.status, response.headers, response.config);
            });
            return promise;
        };

        promise.error = function(fn) {
            promise.then(null, function(response) {
                fn(response.data, response.status, response.headers, response.config);
            });
            return promise;
        };

        return promise;
    }


    ['get', 'head', 'delete'].forEach(function(method) {
        http[method] = function(url, requestConfig) {
            return http(jQuery.extend({}, requestConfig, { url: url, method: method }));
        };
    });

    ['post', 'put', 'patch'].forEach(function(method) {
        http[method] = function(url, data, requestConfig) {
            return http(jQuery.extend({}, requestConfig, { url: url, method: method, data: data }));
        };
    });


    function _parseResponseHeaders(responseHeadersString) {
        var rheaders = /^(.*?):[ \t]*([^\r\n]*)$/m,
            responseHeaders = {},
            match;

        while ((match = rheaders.exec(responseHeadersString))) {
            responseHeaders[match[1].toLowerCase()] = match[2];
        }
        return responseHeaders;
    }

    http.sendRequest = function(requestConfig) {
        var deferred = q.defer();

        jQuery.ajax(requestConfig)
            .done(function(data, statusText, jqXHR) {
                var allHeaders = jqXHR.getAllResponseHeaders(),
                    config = {
                        data: data,
                        status: jqXHR.status,
                        statusText: statusText,
                        headers: function(headerName) {
                            if (allHeaders && !jQuery.isPlainObject(allHeaders)) {
                                allHeaders = _parseResponseHeaders(allHeaders);
                            }
                            if (headerName) {
                                return allHeaders[headerName.toLowerCase()];
                            }
                            return allHeaders;
                        },
                        config: requestConfig
                    };
                deferred.resolve(config);
            })
            .fail(function(jqXHR, statusText, error) {
                /*jshint unused:false*/
                console.error(error);
                var allHeaders = jqXHR.getAllResponseHeaders(),
                    config = {
                        data: null,
                        status: jqXHR.status,
                        statusText: statusText,
                        headers: function(headerName) {
                            if (allHeaders && !jQuery.isPlainObject(allHeaders)) {
                                allHeaders = _parseResponseHeaders(allHeaders);
                            }
                            if (headerName) {
                                return allHeaders[headerName.toLowerCase()];
                            }
                            return allHeaders;
                        }
                    };
                deferred.reject(config);
            });
        return deferred.promise;
    };

    return http;
});
