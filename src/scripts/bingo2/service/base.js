
(function (bingo) {
    "use strict";
    var defualtApp = bingo.defualtApp;

    defualtApp.service('$rootView', function () { return bingo.rootView(); });
    defualtApp.service('$parentView', ['$view', function ($view) { return $view.$parentView(); }]);

    defualtApp.service('$inject', ['$view', '$attr', function ($view, $attr) {
        return function (p, withData) {
            return bingo.inject(p, $view, {
                node: $attr && $attr.node,
                $viewnode: $attr && $attr.viewnode,
                $attr: $attr,
                $withData: $attr ? bingo.extend({}, $attr.withData, withData) : withData
            }, $attr);
        };
    }]);

    defualtApp.service('$compile', ['$view', function ($view) { return function (p) { return bingo.compile($view).tmpl(p); } }]);

    defualtApp.service('$ajax', ['$view', function ($view) {
        return function (p) { return bingo.ajax(p, $view); };
    }]);

    //$comp('select1');
    bingo.each(['$comp', '$component'], function (name) {
        defualtApp.service(name, ['$view', function ($view) {
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
        defualtApp.service(sName, ['$view', '$viewnode', '$withData', function ($view, $viewnode, $withData) {
            return function (content, node, withData, event) {
                node || (node = $viewnode.node);
                withData = bingo.extend({}, $withData, withData);
                return bingo.bindContext($viewnode, content, $view, node, withData, event, hasRet);
            };
        }]);
    });//end $bindContext;

    defualtApp.service('$observe', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$observe(p, fn, disposer);
        };
    }]);

    defualtApp.service('$layout', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$layout(p, fn, 1, disposer);
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
