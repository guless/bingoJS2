
; (function (bingo) {
    "use strict";

    var _newApp = function (name) {
        return bingo.extend({
            name: name, bgNoObserve: true,
            controller: _controllerFn, _controller: {},
            service: _serviceFn, _service: {},
            command: _commandFn, _command: {}
        }, bingo.app._bg_appEx);
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
            mType[name] = { name: name, fn: fn, app: app.name, getApp: _getApp, bgNoObserve: true };
        }
    }, _controllerFn = function (name, fn) {
        if (bingo.isFunction(name) || bingo.isArray(name)) {
            return name;
        };
        var args = [this, '_controller'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _serviceFn = function (name, fn) {
        var args = [this, '_service'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _commandFn = function (name, fn) {
        var args = [this, '_command'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }

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
        }
    });

    var _app = {}, _defualtApp = bingo.defualtApp = _newApp('$$defualtApp$$'), _lastApp = null;
    bingo.extend(bingo.app, {
        _bg_appEx: {},
        extend: function (p) {
            bingo.extend(_defualtApp, p);
            return bingo.extend(this._bg_appEx, p);
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

    var _Promise = bingo.Promise, _injectIn = function (fn, name, injectObj, thisArg) {
        if (!fn) throw new Error('not find inject: ' + name);
        var $injects = fn.$injects;
        var injectParams = [], promises = [];
        if ($injects && $injects.length > 0) {
            var pTemp = null;
            bingo.each($injects, function (item) {
                if (item in injectObj) {
                    injectParams.push(injectObj[item]);
                } else {
                    //注意, 有循环引用问题
                    promises.push(_inject(item, injectObj, thisArg).then(function (ret) {
                        injectParams.push(injectObj[item] = ret);
                    }));
                }
            });
        }

        return _Promise.always(promises).then(function () {
            var ret = fn.apply(thisArg || window, injectParams);
            if (bingo.isString(name)) {
                injectObj[name] = ret;
            }
            return ret;
        });
    }, _inject = function (p, injectObj, thisArg) {
        var fn = null, name = '';
        if (bingo.isFunction(p) || bingo.isArray(p)) {
            fn = _makeInjectAttrs(p);
        }
        else {
            name = p;
            fn = _getSrvByName(name, injectObj);
        }
        return _preUsing(fn ? fn.$injects : [name], injectObj).then(function () {
            if (!fn) fn = _getSrvByName(name, injectObj);
            return _injectIn(fn, name, injectObj, thisArg);
        });
    }, _preUsing = function ($injects, injectObj) {
            var app = injectObj.$view.$app,
            promises = [];
        bingo.each($injects, function (item) {
            if ((item in injectObj) || app.service(item))
                return;
            promises.push(app.usingAll('service::' + item));
        });
        return _Promise.always(promises);
    }, _getSrvByName = function (name, injectObj) {
        var srv = injectObj.$view.$app.service(name);
       return srv ? srv.fn : null;
    };

    bingo.app.extend({
        inject: function (p, injectObj, thisArg) {
            var view = bingo.rootView();
            injectObj = bingo.extend({
                $view: view,
                $cp: view.$ownerCP,
                $app: this
            }, injectObj);
            return _inject(p, injectObj, thisArg || view);
        }
    });

})(bingo);