
(function (bingo) {
    "use strict";
    var defualtApp = bingo.defualtApp;

    defualtApp.service('$rootView', function () { return bingo.rootView(); });

    defualtApp.service('$inject', ['$view', function ($view) {
        return function (p, injectObj, thisArg) {
            return $view.$inject(p, injectObj, thisArg);
        };
    }]);

    defualtApp.service('$location', ['$app', function ($app) {
        return function (name) { return $app.location(name); };
    }]);

    defualtApp.service('$ajax', ['$app', function ($app) {
        return function (url, p) { return $app.ajax(url, p); };
    }]);

    defualtApp.service('$observe', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$observe(p, fn, disposer);
        };
    }]);

    defualtApp.service('$layout', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$layout(p, fn, 0, disposer);
        };
    }]);

    defualtApp.service('$tmpl', ['$app', function ($app) {
        return function (p, ap) {
            return $app.tmpl(p, true, ap);
        };
    }]);

    var _cacheObj = {};
    defualtApp.service('$cache', function () {
        return function (key, value, max) {
            var args = [_cacheObj].concat(bingo.sliceArray(arguments));
            return bingo.cache.apply(bingo, args);
        };
    });

    //参数，使用后，自动清除
    var _paramObj = {};
    defualtApp.service('$param', function () {
        return function (key, value) {
            if (arguments.length == 1)
                return bingo.cache(_paramObj, key);
            else
                return bingo.cache(_paramObj, key, value, 10);
        };
    });

})(bingo);
