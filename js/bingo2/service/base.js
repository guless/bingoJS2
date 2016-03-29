
(function (bingo) {
    "use strict";

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
            fn.create = function (pNode, src, name) {
                return bingo.aFramePromise().then(function () {
                    var tmpl = '<bg:component bg-src="' + src + '" bg-name="' + name + '"></bg:component>';
                    var node = bingo.parseHTML(tmpl, pNode)[0];
                    pNode.appendChild(node);
                    return bingo.compile($view).nodes([node]).compile();
                });
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
        return function (p, fn, disposer) {
            return $view.$observe(p, fn, disposer);
        };
    }]);

    bingo.service('$layout', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$layout(p, fn, disposer);
        };
    }]);

    bingo.service('$tmpl', ['$view', 'node', function ($view, node) {
        return function (p, async) {
            return bingo.tmpl(p, async, $view);
        };
    }]);


    var _cacheObj = {};
    bingo.service('$cache', function () {
        return function (key, value, max) {
            var args = [_cacheM].concat(bingo.sliceArray(arguments));
            return bingo.cache.apply(bingo, args);
        };
    });

    //参数，使用后，自动清除
    var _paramObj = {};
    bingo.service('$param', function () {
        return function (key, value) {
            if (arguments.length == 1)
                return bingo.cache(_paramObj, key);
            else
                return bingo.cache(_paramObj, key, value, 10);
        };
    });

})(bingo);
