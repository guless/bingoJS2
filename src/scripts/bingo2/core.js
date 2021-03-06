﻿
(function (undefined) {
    "use strict";
    //window.aaaa = 0;
    var stringEmpty = "",
        toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty,
        noop = function () { },
        slice = Array.prototype.slice;


    var _htmlDivTarget = null,
    _getHtmlDivTarget = function () {
        return _htmlDivTarget || (_htmlDivTarget = document.createElement('div'));
    };
    //window.aaaa = 0;
    var _makeAutoIdTemp = 0, _makeAutoIdTempPointer = 0;

    var _config = {};

    var bingo = window.bingo = {
        //主版本号.子版本号.修正版本号.编译版本号(日期)
        version: { major: 2, minor: 1, rev: 0, build: 160907, toString: function () { return [this.major, this.minor, this.rev, this.build].join('.'); } },
        bgNoObserve: true,//防止observe
        isDebug: false,
        prdtVersion: '',
        supportWorkspace: false,
        stringEmpty: stringEmpty,
        noop: noop,
        config: function (opt) {
            if (arguments.length == 0)
                return _config;
            this.extend(_config, opt);
            this.bgTrigger('config', [_config]);
        },
        hasOwnProp: function (obj, prop) {
            return core_hasOwn.call(obj, prop);
        },
        trace: function (e) {
            console.error && console.error(e.stack || e.message || e+'');
        },
        isType: function (typename, value) {
            //typename:String, Array, Boolean, Object, RegExp, Date, Function,Number //兼容
            //typename:Null, Undefined,Arguments    //IE不兼容
            return toString.apply(value) === '[object ' + typename + ']';
        },
        isUndefined: function (obj) {
            ///<summary>是否定义</summary>

            return (typeof (obj) === "undefined" || obj === undefined);
        },
        isNull: function (obj) {
            ///<summary>是否Null</summary>

            return (obj === null || this.isUndefined(obj));
        },
        isBoolean: function (obj) {
            return this.isType("Boolean", obj);
        },
        isNullEmpty: function (s) {
            return (this.isNull(s) || s === stringEmpty);
        },
        isFunction: function (fun) {
            return !this.isNull(fun) && fun[fpName] === true;
        },
        isNumeric: function (n) {
            //return this.isType("Number", n) && !isNaN(n) && isFinite(n);;
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isString: function (obj) {
            return !this.isNull(obj) && obj[spName] === true;
            //return this.isType("String", obj);
        },
        isObject: function (obj) {
            return !this.isNull(obj) && this.isType("Object", obj)
                && !this.isElement(obj) && !this.isWindow(obj);//IE8以下isElement, isWindow认为Object
        },
        isPlainObject: function (obj) {
            if (!this.isObject(obj)) {
                return false;
            }
            try {
                // Not own constructor property must be Object
                if (obj.constructor &&
                    !core_hasOwn.call(obj, "constructor") &&
                    !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            var key;
            for (key in obj) { }

            return key === undefined || core_hasOwn.call(obj, key);
        },
        isArray: function (value) {
            return Array.isArray ? Array.isArray(value) : this.isType("Array", value);
        },
        isWindow: function (obj) { return !!(obj && obj == obj.window); },
        isElement: function (obj) { var t = obj && (obj.ownerDocument || obj).documentElement; return t ? true : false; },
        trim: function (str) {
            return this.isString(str) ? str.replace(/(^\s*)|(\s*$)|(^\u3000*)|(\u3000*$)|(^\ue4c6*)|(\ue4c6*$)/g, '') : this.isNull(str) ? '' : str.toString();
        },
        replaceAll: function (s, str, repl, flags) {
            if (this.isNullEmpty(s) || this.isNullEmpty(str)) return s;
            str = str.replace(/([^A-Za-z0-9])/g, "\\$1");
            s = s.replace(new RegExp(str, flags || "g"), repl);
            return s;
        },
        toStr: function (p) { return this.isNull(p) ? '' : p.toString(); },
        sliceArray: function (p, index, count) {
            if (!p) return [];
            var args = slice.call(arguments, 1);
            return slice.apply(p, args);
        },
        inArray: function (p, list) {
            var index = -1;
            if (this.isFunction(p))
                list.some(function (e, i) { if (p.apply(e, arguments) === true) { index = i; return true; } });
            else
                index = list.indexOf(p);
            return index;
        },
        removeArrayItem: function (ele, list) {
            var isF = bingo.isFunction(ele);
            return list.filter(function (item) { return isF ? !ele.apply(this, arguments) : item != ele; });
        },
        makeAutoId: function () {
            var time = new Date().valueOf();
            _makeAutoIdTempPointer = (time == _makeAutoIdTemp) ? _makeAutoIdTempPointer + 1 : 0;
            _makeAutoIdTemp = time;
            return [time, _makeAutoIdTempPointer].join('_');
        },
        each: function (list, callback, thisArg) {
            //callback(element, index, array){this === data;}
            //过程中改变list长度， 不会影响遍历长度, 但内容会变
            if (!list || !callback) return;
            bingo.isArray(list) || (list = slice.apply(list));
            list.some(function (item) {
                return (callback.apply(thisArg || item, arguments) === false);
            });
        },
        eachProp: function (obj, callback, thisArg) {
            /// <summary>
            /// eachProp({}, function(item, name, obj){}, thisArg);
            /// </summary>
            if (!obj || !callback) return;
            var item;
            this.each(Object.keys(obj), function (n) {
                item = this[n];
                return callback.call(thisArg || item, item, n, this);
            }, obj);
        },
        htmlEncode: function (str) {
            if (this.isNullEmpty(str)) return "";
            var node = _getHtmlDivTarget();
            node.textContent = str;
            return node.innerHTML;
        },
        htmlDecode: function (str) {
            if (this.isNullEmpty(str)) return "";
            var node = _getHtmlDivTarget();
            node.innerHTML = str;
            return node.textContent;
        },
        extend: function (obj) {
            var len = arguments.length;
            if (len == 1) {
                obj && Object.keys(obj).forEach(function (n) { this[n] = obj[n]; }, this);
                return this;
            }
            var args = slice.call(arguments, 1);
            args.forEach(function (ot) {
                ot && Object.keys(ot).forEach(function (n) { obj[n] = this[n]; }, ot);
            });
            return obj;
        },
        proxy: function (thisArg, fn) {
            return function() { return fn && fn.apply(thisArg, arguments); };
        }
    };

    var _getProp = function (p, writable) {
        return {
            configurable: false,
            enumerable: false,
            value: p,
            writable: writable !== false
        };
    };
    Object.defineProperties(Object.prototype,{
        "bgDefProp": _getProp(function (prop, val, writable) {
            Object.defineProperty(this, prop, _getProp(val, writable));
            return this;
        }),
        "bgDefProps":_getProp( function (p) {
            var def = {};
            bingo.eachProp(p, function (item, n) {
                def[n] = _getProp(item);
            }, this);
            Object.defineProperties(this, def);
            return this;
        })
    });

    var fpName = '_bg_ifFn_', spName = '_bg_ifStr_';
    Function.prototype.bgDefProp(fpName, true, false);
    String.prototype.bgDefProp(spName, true, false);

    var _cacheName = '_bg_cache2_', _orderC = function (cc) {
        cc.sort(function (item, item1) { return item1[2] - item[2]; });
    }, _resetKeyC = function (cc) {
        return cc.map(function (item) { return item[0]; });
    }, _resetC = function (cc) {
        var len = cc.length, n = len - 1;
        _orderC(cc);
        cc.forEach(function (item) { return item[2] = n--; });
        return len;
    }, _maxCC = Number.MAX_VALUE;
    Object.defineProperty(Object.prototype, 'bgCache', {
        configurable: true,
        enumerable: false,
        get: function () {
            var m = this[_cacheName];
            if (m) return m;

            m = this[_cacheName] = function (key, p) {
                return (arguments.length > 1) ? m.setItem(key, p) : m.getItem(key);
            };
            var _cache = [], _keys = [], _max = 20, _dCount = 5, _ti = 0, _tick = function (c) {
                if (_ti == _maxCC) {
                    _ti = _resetC(_cache);
                    _keys = _resetKeyC(_cache);
                }
                c[2] = _ti++; return c;
            }, _removeMax = function (end) {
                _orderC(_cache);
                _cache = slice.call(_cache, 0, end);
                _keys = _resetKeyC(_cache);
            };
            m.option = function (max, dCount) {
                _max = max || 20; _dCount = dCount || ~~(_max / 3);
                return this;
            };
            m.setItem = function (key, p) {
                var index = this.indexOf(key), c;
                if (index > -1) {
                    _tick(_cache[index])[1] = p;
                } else {
                    c = _tick([key, p, 0]);
                    _cache.unshift(c);
                    _keys.unshift(key);
                    var end = _cache.length - _dCount;
                    (end >= _max) && _removeMax(_cache.length - _dCount);
                }
                return p;
            };
            m.getItem = function (key) {
                var index = this.indexOf(key);
                if (index > -1) {
                    return _tick(_cache[index])[1];
                } else
                    return undefined;
            };
            m.getAll = function () { return _cache; };
            m.size = function () { return _cache.length; };
            m.indexOf = function (key) {
                return _keys.indexOf(key);
            };
            //删除key内容
            m.removeItem = function (key) {
                var index = this.indexOf(key);
                return (index > -1) ? (_keys.splice(index, 1), _cache.splice(index, 1)[0]) : undefined;
            };
            //删除所有内容
            m.removeAll = function () {
                _cache = [];
            };
            return m;
        },
        set: function () { }
    });


    //解决多版共存问题
    var majVer = ['bingoV' + bingo.version.major].join(''),
        minorVer = [majVer, bingo.version.minor].join('_');
    window[majVer] = window[minorVer] = bingo;

})();
