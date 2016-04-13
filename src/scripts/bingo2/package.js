
; (function (bingo) {
    "use strict";

    var _newApp = function (name) {
        return {
            name: name, _no_observe: true,
            controller: _controllerFn, _controller: {},
            service: _serviceFn, _service: {},
            component: _componentFn, _component: {},
            command: _commandFn, _command: {}
        };
    }, _getApp = function () {
        return bingo.app(this.app);
    }, _appMType = function (app, type, name, fn, isF) {
        var mType = app[type];
        if (arguments.length == 3)
            return mType[name] || (app != _defualtApp ? _defualtApp[type][name] : null);
        else {
            if (bingo.isObject(fn) && isF !== false) {
                var o = fn;
                fn = function () { return o; };
            }
            bingo.isObject(fn) || (fn = _makeInjectAttrs(fn));
            mType[name] = { name: name, fn: fn, app: app.name, getApp: _getApp, _no_observe: true };
        }
    }, _controllerFn = function (name, fn) {
        var args = [this, '_controller'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _serviceFn = function (name, fn) {
        var args = [this, '_service'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _componentFn = function (name, fn) {
        var args = [this, '_component'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _commandFn = function (name, fn) {
        var args = [this, '_command'].concat(bingo.sliceArray(arguments));
        var def = args[3];
        if (def) {
            var opt = {
                priority: 50,
                tmpl: '',
                tmplUrl: '',
                replace: false,
                include: false,
                view: false,
                compileChild: true
            };
            def = def();
            if (bingo.isFunction(def) || bingo.isArray(def)) {
                opt.link = _makeInjectAttrs(def);
            } else
                opt = bingo.extend(opt, def);
            args[3] = opt;
            args[4] = false;
        }
        return _appMType.apply(this, args);
    }

    var _app = {}, _defualtApp = _newApp('defualtApp'), _lastApp = null

    bingo.extend({
        app: function (name, fn) {
            var app = !!name ? (_app[name] || (_app[name] = _newApp(name))) : _defualtApp;
            if (!fn) return app;
            _lastApp = app;
            try {
                fn && fn.call(app, app);
                return app;
            } finally {
                _lastApp = null;
            }
        },
        controller: function (name, fn) {
            if (bingo.isFunction(name) || bingo.isArray(name)) {
                return name;
            } else {
                var app = (_lastApp || _defualtApp);
                return app.controller.apply(app, arguments);
            }
        },
        component: function (name, fn) {
            if (bingo.isFunction(name) || bingo.isObject(name)) {
                return name;
            } else {
                var app = (_lastApp || _defualtApp);
                return app.component.apply(app, arguments);
            }
        },
        command: function (name, fn) {
            var app = (_lastApp || _defualtApp);
            return app.command.apply(app, arguments);
        },
        service: function (name, fn) {
            var app = (_lastApp || _defualtApp);
            return app.service.apply(app, arguments);
        }
    });

    var _injectNoop = function () { };
    _injectNoop.$injects = [];

    var _makeInjectAttrRegx = /^\s*function[^(]*?\(([^)]+?)\)/i,
    _makeInjectAttrs = function (p) {
        if (p && (p.$injects || p.$fn)) return p.$fn || p;

        var fn = _injectNoop;
        if (bingo.isArray(p)) {
            var list = bingo.sliceArray(p);
            fn = p.$fn = list.pop();
            fn.$injects = list;
            fn.$owner = p.$owner;
        } else if (bingo.isFunction(p)) {
            fn = p;
            var s = fn.toString();
            var list = [];
            s.replace(_makeInjectAttrRegx, function (findText, find0) {
                if (find0) {
                    bingo.each(find0.split(','), function (item) {
                        item = bingo.trim(item);
                        item && list.push(item);
                    });
                }
            });
            fn.$injects = list;
        }
        return fn;
    };

    var _injectIn = function (fn, name, injectObj, thisArg) {
        if (!fn) throw new Error('not find inject: ' + name);
        var $injects = fn.$injects;
        var injectParams = [];
        if ($injects && $injects.length > 0) {
            var pTemp = null;
            bingo.each($injects, function (item) {
                if (item in injectObj) {
                    pTemp = injectObj[item];
                } else {
                    //注意, 有循环引用问题
                    pTemp = injectObj[item] = _inject(item, injectObj, thisArg);
                }
                injectParams.push(pTemp);
            });
        }

        var ret = fn.apply(thisArg|| window, injectParams);
        if (bingo.isString(name)) {
            injectObj[name] = ret;
        }

        return ret;
    }, _inject = function (p, injectObj, thisArg) {
        var fn = null, name = '';
        if (bingo.isFunction(p) || bingo.isArray(p)) {
            fn = _makeInjectAttrs(p);
        }
        else {
            name = p;
            var srv = injectObj.$view.$getApp().service(name);
            fn = srv ? srv.fn : null;
        }
        return _injectIn(fn, name, injectObj, thisArg);
    };

    bingo.inject = function (p, view, injectObj, thisArg) {
        view || (view = bingo.rootView());
        injectObj = bingo.extend({
            $view: view,
            node: view.$getNode()[0],
            $viewnode: view.$getViewnode(),
            $attr: null,
            $withData: null
        }, injectObj);
        return _inject(p, injectObj, thisArg || view);
    };

})(bingo);