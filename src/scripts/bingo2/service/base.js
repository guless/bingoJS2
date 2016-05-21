
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

    defualtApp.service('$ajax', ['$view', function ($view) {
        return function (p) { return bingo.ajax(p, $view); };
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

    defualtApp.service('$tmpl', ['$view', function ($view) {
        return function (p, async) {
            return bingo.tmpl(p, async);
        };
    }]);

    var _cacheObj = {};
    defualtApp.service('$cache', function () {
        return function (key, value, max) {
            var args = [_cacheM].concat(bingo.sliceArray(arguments));
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
