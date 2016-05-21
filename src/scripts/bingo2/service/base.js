
(function (bingo) {
    "use strict";
<<<<<<< HEAD

    bingo.service('$rootView', function () { return bingo.rootView(); });
    bingo.service('$parentView', ['$view', function ($view) { return $view.$parentView(); }]);

    bingo.service('$inject', ['$view', '$attr', function ($view, $attr) {
        return function (p, withData) {
            return bingo.inject(p, $view, {
                node: $attr && $attr.node,
                $viewnode: $attr && $attr.viewnode,
                $attr: $attr,
                $withData: $attr ? bingo.extend({}, $attr.withData, withData) : withData
            }, $attr);
        };
    }]);

    bingo.service('$compile', ['$view', function ($view) { return function (p) { return bingo.compile($view).tmpl(p);  } }]);

    bingo.service('$ajax', ['$view', function ($view) {
        return function (p) { return bingo.ajax(p, $view); };
    }]);

    //$comp('select1');
    bingo.each(['$comp', '$component'], function (name) {
        bingo.service(name, ['$view', function ($view) {
            var fn = function (name) { return $view.$getComp(name); };
            fn.create = function (p) {
                return $view.$createComp(p);
            };

            return fn;
        }]);
    });

    //绑定内容解释器, var bind = $bindContext('user.id == "1"', document.body); var val = bind.getContext();
    bingo.each(['$bindContext', '$evalContext'], function (sName) {
        var hasRet = sName == '$bindContext';
        bingo.service(sName, ['$view', '$viewnode', '$withData', function ($view, $viewnode, $withData) {
            return function (content, node, withData, event) {
                node || (node = $viewnode.node);
                withData = bingo.extend({}, $withData, withData);
                return bingo.bindContext($viewnode, content, $view, node, withData, event, hasRet);
            };
        }]);
    });//end $bindContext;

    bingo.service('$observe', ['$view', function ($view) {
=======
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
>>>>>>> master
        return function (p, fn, disposer) {
            return $view.$observe(p, fn, disposer);
        };
    }]);

<<<<<<< HEAD
    bingo.service('$layout', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$layout(p, fn, 1, disposer);
        };
    }]);

    bingo.service('$tmpl', ['$view', function ($view) {
=======
    defualtApp.service('$layout', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$layout(p, fn, 0, disposer);
        };
    }]);

    defualtApp.service('$tmpl', ['$view', function ($view) {
>>>>>>> master
        return function (p, async) {
            return bingo.tmpl(p, async);
        };
    }]);

    var _cacheObj = {};
<<<<<<< HEAD
    bingo.service('$cache', function () {
=======
    defualtApp.service('$cache', function () {
>>>>>>> master
        return function (key, value, max) {
            var args = [_cacheM].concat(bingo.sliceArray(arguments));
            return bingo.cache.apply(bingo, args);
        };
    });

    //参数，使用后，自动清除
    var _paramObj = {};
<<<<<<< HEAD
    bingo.service('$param', function () {
=======
    defualtApp.service('$param', function () {
>>>>>>> master
        return function (key, value) {
            if (arguments.length == 1)
                return bingo.cache(_paramObj, key);
            else
                return bingo.cache(_paramObj, key, value, 10);
        };
    });

})(bingo);
