
;(function () {
    "use strict";

    var stringEmpty = "",
        toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty,
        noop = function () { },
        slice = Array.prototype.slice,
        undefined;

    var _htmlDivTarget = null,
    _getHtmlDivTarget = function () {
        return _htmlDivTarget || (_htmlDivTarget = $('<div style="display:none"></div>'));
    };

    var _makeAutoIdTemp = 0, _makeAutoIdTempPointer = 0;

    var _config = {};

    var bingo = window.bingo = {
        //主版本号.子版本号.修正版本号.编译版本号(日期)
        version: { major: 2, minor: 0, rev: 0, build: 'beta1', toString: function () { return [this.major, this.minor, this.rev, this.build].join('.'); } },
        _no_observe: true,//防止observe
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
            return this.isType("Function", fun);
        },
        isNumeric: function (n) {
            //return this.isType("Number", n) && !isNaN(n) && isFinite(n);;
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isString: function (obj) {
            return this.isType("String", obj);
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
            /// <summary>
            /// inArray(1, [1,2,3])<br />
            /// inArray(function(item){return item == 1;}, [1,2,3])
            /// </summary>
            var index = -1;
            if (this.isFunction(p))
                list.some(function (e, i) { if (p.apply(this, arguments) === true) { index = i; return true; } });
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
            _makeAutoIdTempPointer = (time === _makeAutoIdTemp) ? _makeAutoIdTempPointer + 1 : 0;
            _makeAutoIdTemp = time;
            return [time, _makeAutoIdTempPointer].join('_');
        },
        each: function (list, callback, thisArg) {
            //callback(element, index, array){this === data;}
            //过程中改变list长度， 不会影响遍历长度, 但内容会变
            if (!list || !callback) return;
            bingo.isArray(list) || (list = this.sliceArray(list));
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
            var jo = _getHtmlDivTarget();
            jo.text(str);
            str = jo.html();
            return str;
        },
        htmlDecode: function (str) {
            if (this.isNullEmpty(str)) return "";
            var jo = _getHtmlDivTarget();
            jo.html(str);
            var hs = jo.text();
            return hs;
        },
        extend: function (obj) {
            var len = arguments.length;
            if (len == 1) {
                this.eachProp(obj, function (item, n0) {
                    this[n0] = item;
                    if (this.isFunction(item))
                        intellisenseSetCallContext(item, this);
                }, this);
                return this;
            }
            var args = this.sliceArray(arguments, 1);
            bingo.each(args, function (ot) {
                ot && this.eachProp(ot, function (item, n) {
                    obj[n] = item;
                    if (this.isFunction(item))
                        intellisenseSetCallContext(item, obj);
                });
            }, this);
            return obj;
        },
        Class: function (fn) {
            var def = function () {
                var p = this._bgpro_;
                p && (this._bgpro_ = bingo.extend({}, p));
                this._bgpri_ = new pri();
                init && init.apply(this, arguments);
            }, init = null, prototype = def.prototype,
            pri = function () { }, pritype = pri.prototype,
                defObj = {
                    Prop: function (p) {
                        prototype._bgpro_ = bingo.extend(prototype._bgpro_ || {}, p);
                        bingo.eachProp(p, function (item, n) {
                            prototype[n] = function (val) {
                                if (arguments.length == 0)
                                    return item;
                                else {
                                    item = val;
                                    return this;
                                }
                            };
                        }, this);
                    },
                    Event: function (s) { prototype.bgEventDef(s); },
                    Define: function (p) {
                        bingo.extend(prototype, p);

                        //提示用
                        //var o = new def();
                        //bingo.extend(o, p);
                        //intellisenseAnnotate(property, p);
                    },
                    Private: function (p) {
                        bingo.extend(pritype, p);
                    },
                    Init: function (fn) {
                        init = fn;
                        var o = new def();
                        //intellisenseSetCallContext(fn, o);
                    }
                };
            fn.call(defObj);
            bingo.extend(prototype, {
                Extend: function (p) { bingo.extend(this, p); },
                Private: function (p) { bingo.extend(this._bgpri_, p); }
            });

            def.constructor = def;

            intellisenseRedirectDefinition(def, init);
            
            return def;
        },
        proxy: function (thisArg, fn) {
            fn && fn.apply(thisArg, []);
            return function () { return fn && fn.apply(thisArg, arguments); };
        },
        _splitEvName: function (eventName) {
            return bingo.isString(eventName)
                ? (bingo.isNullEmpty(eventName) ? null : bingo.trim(eventName).split(/\s+/g).map(function (item) { return bingo.trim(item); }))
                : eventName;
        },
        isArgs: function (args) {
            /// <summary>
            /// isArgs(arguments, 'str', 'fun|bool') <br />
            /// isArgs(arguments, '@@title', null, 1)
            /// 注意如果arguments超出部分不判断
            /// </summary>
            /// <param name="args"></param>
            /// <param name="p">obj, str, array, bool, num, null, empty, undef, fun, *, regex, window, element</param>
            var types = bingo.sliceArray(arguments, 1), isOk = true, val;
            bingo.each(types, function (item, index) {
                val = args[index];
                if (bingo.isString(item)) {
                    if (item.indexOf('@@') == 0)
                        isOk = (item.substr(2) === val);
                    else {
                        bingo.each(item.split('|'), function (sItem) {
                            isOk = _isType(sItem, val);
                            if (!isOk) return false;
                        });
                    }
                } else
                    isOk = _isType(item, val);

                if (!isOk) return false;
            });
            return isOk;
        }
    };

    var _isType = function (type, p, isStr) {
        switch (type) {
            case 'obj':
                return bingo.isObject(p);
            case 'str':
                return bingo.isString(p);
            case 'array':
                return bingo.isArray(p);
            case 'bool':
                return bingo.isBoolean(p);
            case 'num':
                return bingo.isNumeric(p);
            case 'null':
                return bingo.isNull(p);
            case 'empty':
                return bingo.isNullEmpty(p);
            case 'undef':
                return bingo.isUndefined(p);
            case 'fun':
                return bingo.isFunction(p);
            case 'regex':
                return !bingo.isNull(p) && (p instanceof RegExp);
            case 'window':
                return bingo.isWindow(p);
            case 'element':
                return bingo.isElement(p);
            case '*':
                return true;
            default:
                return type === p;
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


    //解决多版共存问题
    var majVer = ['bingoV' + bingo.version.major].join(''),
        minorVer = [majVer, bingo.version.minor].join('_');
    window[majVer] = window[minorVer] = bingo;

})();
