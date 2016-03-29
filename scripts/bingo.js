/// <reference path="../jquery/jquery-1.8.1.js" />

//https://git.oschina.net/bingoJS/bingoJS

(window.console && window.console.log) || (window.console = { log: function () { }, error: function () { }, info: function () { }, table: function () { } });
﻿
;(function () {
    "use strict";

    var stringEmpty = "",
        toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty,
        noop = function () { },
        undefined;

    var _htmlDivTarget = null,
    _getHtmlDivTarget = function () {
        if (_htmlDivTarget == null)
            _htmlDivTarget = $('<div style="display:none"></div>');//.appendTo(document.body);
        return _htmlDivTarget;
    };

    var _makeAutoIdTemp = 0, _makeAutoIdTempPointer = 0;

    var bingo = window.bingo = {
        //主版本号.子版本号.修正版本号.编译版本号(日期)
        version: { major: 1, minor: 2, rev: 2, build: 151124, toString: function () { return [this.major, this.minor, this.rev, this.build].join('.'); } },
        isDebug: false,
        prdtVersion: '',
        supportWorkspace: false,
        stringEmpty: stringEmpty,
        noop: noop,
        newLine: "\r\n",
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
        isWindow: function (obj) { return !this.isNull(obj) && obj == obj.window; },
        isElement: function (obj) { var t = obj && (obj.ownerDocument || obj).documentElement; return t ? true : false; },
        trim: function (str) {
            return this.isString(str) ? str.replace(/(^\s*)|(\s*$)|(^\u3000*)|(\u3000*$)|(^\ue4c6*)|(\ue4c6*$)/g, '') : this.isNull(str) ? '' : str.toString();
        },
        isStringEquals: function (str1, str2) {
            ///<summary>字串是否相等, 不分大小写</summary>

            if (str1 == str2) return true;
            if (!this.isString(str1) || !this.isString(str2)) return false;
            return (str1.toUpperCase() == str2.toUpperCase());
        },
        replaceAll: function (s, str, repl, flags) {
            if (this.isNullEmpty(s) || this.isNullEmpty(str)) return s;
            str = str.replace(/([^A-Za-z0-9])/g, "\\$1");
            s = s.replace(new RegExp(str, flags || "g"), repl);
            return s;
        },
        toStr: function (p) { return this.isNull(p) ? '' : p.toString(); },
        inArray: function (element, list, index, rever) {
            var callback = this.isFunction(element) ? element : null;
            if (arguments.length == 2 && !callback)
                if (list && list.indexOf) return list.indexOf(element);
            var indexRef = -1;
            //debugger;
            this.each(list, function (item, i) {
                if (callback) {
                    if (callback.call(item, item, i)) {
                        indexRef = i; return false;
                    }
                } else if (item === element) {
                    indexRef = i; return false;
                }
            }, index, rever);
            return indexRef;
        },
        removeArrayItem: function (element, list) {
            var list1 = [];
            for (var i = 0, len = list.length; i < len; i++) {
                if (list[i] != element)
                    list1.push(list[i]);
            }
            return list1;
        },
        sliceArray: function (args, pos, count) {
            isNaN(pos) && (pos = 0);
            isNaN(count) && (count = args.length);
            if (pos < 0) pos = count + pos;
            if (pos < 0) pos = 0;
            return Array.prototype.slice.call(args, pos, pos + count);
        },
        makeAutoId: function () {
            var time = new Date().valueOf();
            _makeAutoIdTempPointer = (time === _makeAutoIdTemp) ? _makeAutoIdTempPointer + 1 : 0;
            _makeAutoIdTemp = time;
            return [time, _makeAutoIdTempPointer].join('_');
        },
        each: function (list, callback, index, rever) {
            //callback(data, index){this === data;}
            if (this.isNull(list) || !bingo.isNumeric(list.length)) return;
            var temp = null;
            var sT = bingo.isNumeric(index) ? index : 0;
            if (sT < 0) sT = list.length + sT;
            if (sT < 0) sT = 0;

            var end = rever ? (sT - 1) : list.length;
            var start = rever ? list.length - 1 : sT;
            if ((rever && start <= end) || (!rever && start >= end)) return;

            var step = rever ? -1 : 1;
            for (var i = start; i != end; i += step) {
                temp = list[i];
                if (callback.call(temp, temp, i) === false) break;
            }
        },
        eachProp: function (obj, callback) {
            if (!obj) return;
            var item;
            for (var n in obj) {
                if (bingo.hasOwnProp(obj, n)) {
                    item = obj[n];
                    if (callback.call(item, item, n) === false) break;
                }
            }
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
        urlEncode: function (str) {
            if (this.isNullEmpty(str)) return "";
            return encodeURI(str);
        },
        urlDecode: function (str) {
            if (this.isNullEmpty(str)) return "";
            return decodeURI(str);
        },
        clearObject: function (obj) {
            for (var i = 0, len = arguments.length; i < len; i++) {
                obj = arguments[i];
                bingo.eachProp(obj, function (item, n) {
                    if (item && item.$clearAuto === true)
                        if (item.dispose)
                            item.dispose();
                        else
                            bingo.clearObject(item);
                    obj[n] = null;
                });
            }
        },
        extend: function (obj) {
            var len = arguments.length;
            if (len <= 0) return obj;
            if (len == 1) {
                for (var n0 in obj) {
                    bingo.hasOwnProp(obj, n0) && (this[n0] = obj[n0]);
                }
                return this;
            }
            var ot = null;
            for (var i = 1; i < len; i++) {
                ot = arguments[i];
                if (!this.isNull(ot)) {
                    bingo.eachProp(ot, function (item, n) {
                        obj[n] = item;
                    });
                }
            }
            return obj;
        },
        clone: function (obj, deep, ipo) {
            deep = (deep !== false);
            return _clone.clone(obj, deep, ipo);
        },
        proxy: function (owner, fn) {
            return function () { return fn && fn.apply(owner, arguments); };
        }
    };

    //解决多版共存问题
    var majVer = ['bingoV' + bingo.version.major].join(''),
        minorVer = [majVer, bingo.version.minor].join('_');
    window[majVer] = window[minorVer] = bingo;

    var _clone = {
        isCloneObject: function (obj) {
            return bingo.isPlainObject(obj);
        },
        clone: function (obj, deep, ipo) {
            if (!obj)
                return obj;
            else if (bingo.isArray(obj))
                return this.cloneArray(obj, deep);
            else if (ipo || this.isCloneObject(obj))
                return this.cloneObject(obj, deep, ipo);
            else
                return obj;
        },
        cloneObject: function (obj, deep, ipo) {
            var to = {};
            bingo.eachProp(obj, function (t, n) {
                if (deep) {
                    t = _clone.clone(t, deep, ipo);
                }
                to[n] = t;
            });
            return to;
        },
        cloneArray: function (list, deep) {
            if (deep === false) return list.concat();
            var lt = [], t;
            for (var i = 0, len = list.length; i < len; i++) {
                t = this.clone(list[i], true);
                lt.push(t);
            }
            return lt;
        }
    };


})();
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";

    var _getDataAttrRegex = /[\[\.]?[\'\"]?([^\[\]\.\'\"]+)[\'\"]?[\]\.]?/g;
    var _getAttrList = function (name) {
        _getDataAttrRegex.lastIndex = 0;
        var attrList = [];
        name.replace(_getDataAttrRegex, function (find, attrName, findPos, allText) {
            if (_isArrayAttr(find) && attrList.length > 0)
                attrList[attrList.length - 1].isArray = true;
            attrList.push({ attrname: attrName, isArray: false });
        });
        return attrList;
    };
    var _setDataValue = function (data, name, value) {
        if (!data || bingo.isNullEmpty(name)) return;
        if (name.indexOf('.') < 0 && name.indexOf(']') < 0) { data[name] = value; }

        var attrList = _getAttrList(name);

        var to = data, item = null;
        var len = attrList.length - 1;
        var nameItem = null;
        for (var i = 0; i < len; i++) {
            item = attrList[i];
            nameItem = item.attrname;
            if (bingo.isNull(to[nameItem])) {
                to[nameItem] = item.isArray ? [] : {};
            }
            to = to[nameItem];
        }
        nameItem = attrList[len].attrname;
        to[nameItem] = value;

    }, _isArrayAttr = function (find) { return find.indexOf(']') >= 0 && (find.indexOf('"') < 0 && find.indexOf("'") < 0); };

    var _getDataValue = function (data, name) {
        if (!data || bingo.isNullEmpty(name)) return;
        if (name.indexOf('.') < 0 && name.indexOf(']') < 0) return data[name];

        var attrList = _getAttrList(name);

        var to = data, item = null;
        var len = attrList.length - 1;
        var nameItem = null;
        for (var i = 0; i < len; i++) {
            item = attrList[i];
            nameItem = item.attrname;
            if (bingo.isNull(to[nameItem])) {
                return to[nameItem];
            }
            to = to[nameItem];
        }
        nameItem = attrList[len].attrname;
        return to[nameItem];
    };

    bingo.extend({
        datavalue: function (data, name, value) {
            if (arguments.length >= 3) {
                _setDataValue(data, name, value);
            } else {
                return _getDataValue(data, name);
            }
        }
    });

})(bingo);
﻿
; (function (bingo) {
    //version 1.0.1
    "use strict";

    bingo.Event = function (owner, eList) {

        var fn = function (callback) {
            callback && fn.on(callback);
            return arguments.length == 0 ? fn : this;
        };

        fn.__bg_isEvent__ = true;
        fn.__eventList__ = eList || [];
        bingo.extend(fn, _eventDefine);
        fn.owner(owner);

        return fn;
    };
    bingo.isEvent = function (ev) {
        return ev && ev.__bg_isEvent__ === true;
    };

    var _eventDefine = {
        _end:false,
        _endArg: undefined,
        owner: function (owner) {
            if (arguments.length == 0)
                return this.__owner__;
            else {
                this.__owner__ = owner;
                return this;
            }
        },
        _this: function () { return this.owner() || this;},
        on: function (callback) {
            if (callback) {
                this._checkEnd(callback) || this.__eventList__.push({ one: false, callback: callback });
            }
            return this;
        },
        one: function (callback) {
            if (callback) {
                this._checkEnd(callback) || this.__eventList__.push({ one: true, callback: callback });
            }

            return this;
        },
        off: function (callback) {
            if (callback) {
                var list = [];
                bingo.each(this.__eventList__, function () {
                    if (this.callback != callback)
                        list.push(this);
                });
                this.__eventList__ = list;
            } else { this.__eventList__ = []; }
            return this;
        },
        _checkEnd: function (callback) {
            if (this._end) {
                var args = this._endArg || [], $this = this._this();
                setTimeout(function () { callback.apply($this, args); }, 1);
            }
            return this._end;
        },
        //结束事件, 先解除绑定事件, 以后绑定事件马上自动确发, 用于ready之类的场景
        end: function (args) {
            this._end = true; this._endArg = args;

            this.trigger(args);
            this.off();
            return this;
        },
        trigger: function () {
            var list = this.__eventList__, ret = null,
                eventObj = null, reList = null,
                $this = this._this();
            for (var i = 0, len = list.length; i < len; i++) {
                eventObj = list[i];
                if (eventObj.one === true) {
                    reList || (reList = this.__eventList__);
                    reList = bingo.removeArrayItem(eventObj, reList);
                } 
                if ((ret = eventObj.callback.apply($this, arguments[0] || [])) === false) break;
            }
            reList && (this.__eventList__ = reList);
            return ret;
        },
        triggerHandler: function () {
            var list = this.__eventList__, eventObj = null,
                $this = this._this();
            if (list.length == 0) return;
            eventObj = list[0];
            var ret = eventObj.callback.apply($this, arguments[0] || []);
            if (eventObj.one === true)
                this.__eventList__ = bingo.removeArrayItem(eventObj, this.__eventList__);
            return ret;
        },
        clone: function (owner) {
            return bingo.Event(owner || this.owner(), this.__eventList__);
        },
        size: function () { return this.__eventList__.length; }
    };


})(bingo);
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";

    var _isVar_ = 'isVar1212';
    bingo.isVariable = function (p) { return p && p._isVar_ == _isVar_; };
    bingo.variableOf = function (p) { return bingo.isVariable(p) ? p() : p; };

    /*
        观察变量: bingo.variable
        提供自由决定change状态, 以决定是否需要同步到view层
        使用$setChange方法设置为修改状态
    */
    var _variable  = bingo.variable = function (p, owner, view) {
        var value = bingo.variableOf(p);
        var fn = function (p1) {
            fn.owner = this;
            if (arguments.length == 0) {
                var rtt = fn._get_ ? fn.$get() : fn.value;
                fn.owner = null;
                return rtt;
            } else {
                p1 = bingo.variableOf(p1);
                var old = bingo.clone(fn.$get());

                if (fn._set_)
                    fn._set_.call(fn, p1);
                else
                    fn.value = p1;
                p1 = fn.$get();
                var change = !bingo.equals(p1, old);

                if (change)
                    fn.$setChange();
                else
                    fn._triggerFn([p1], false);
                fn.owner = null;
                return fn.$owner() || this;
            }
        };
        fn._isVar_ = _isVar_;
        //fn.value = value;
        fn._isChanged = true;
        bingo.extend(fn, _variableDefine);

        _extend && bingo.extend(fn, _extend);

        fn.$owner(owner).$view(view);
        fn(value);

        return fn;
    };

    var _extend = null;
    _variable.extend = function (ex) {
        if (!ex) return;
        _extend = bingo.extend(_extend || {}, ex);
    };

    var _variableDefine = {
        size: function () {
            var value = this.$get();
            return value && value.length || 0;
        },
        _triggerChange: function () {
            var value = this.$get();
            this._triggerFn([value], true);
            //this.$view() && this.$view().$updateAsync();
        },
        _addFn: function (fn, change, disposer, priority) {
            (this._fnList || (this._fnList = [])).push({ fn: fn, change: change, disposer: disposer, _priority: priority || 50 });
            this._fnList = bingo.linq(this._fnList).sortDesc('_priority').toArray();
            return this;
        },
        _triggerFn: function (args, change) {
            if (this._fnList) {
                var $this = this, hasRm = false;
                bingo.each(this._fnList, function () {
                    if (this.disposer && this.disposer.isDisposed) {
                        hasRm = true;
                        bingo.clearObject(this);
                        return;
                    }
                    if (change || !this.change)
                        this.fn.apply($this, args);
                });
                if (hasRm) {
                    this._fnList = bingo.linq(this._fnList).where(function () {
                        return this.fn;
                    }).toArray();
                }
            }
        },
        $off: function (callback) {
            if (arguments.length > 0)
                this._fnList = bingo.linq(this._fnList)
                    .where(function () {
                        if (this.fn == callback) {
                            bingo.clearObject(this);
                            return false;
                        } else
                            return true;
                    }).toArray();
            else {
                bingo.each(this._fnList, function () {
                    bingo.clearObject(this);
                });
                this._fnList = [];
            }
        },
        //赋值事件(当在赋值时, 不理值是否改变, 都发送事件)
        $assign: function (callback, disposer, priority) {
            return this._addFn(callback, false, disposer || this.$view(), priority);
        },
        //改变值事件(当在赋值时, 只有值改变了, 才发送事件)
        $subs: function (callback, disposer, priority) {
            return this._addFn(callback, true, disposer || this.$view(), priority);
        },
        //设置修改状态
        $setChange: function (isChanged) {
            this._isChanged = (isChanged !== false);
            if (this._isChanged) {
                this._triggerChange();
            }
            return this;
        },
        //用于observer检查
        _obsCheck: function () {
            var isChanged = this._isChanged;
            this._isChanged = false;
            return isChanged;
        },
        $get: function (fn) {
            if (arguments.length == 0) {
                return this._get_ ? this._get_.call(this) : this.value;
            } else {
                bingo.isFunction(fn) && (this._get_ = fn);
                return this;
            }
        },
        $set: function (fn) {
            if (bingo.isFunction(fn)) {
                this._set_ = fn;
                this(this.$get());
            }
            return this;
        },
        $view: function (view) {
            if (arguments.length == 0) {
                return this._view_;
            } else {
                this._view_ = view;
                return this;
            }
        },
        $owner: function (owner) {
            if (arguments.length == 0) {
                return this._owner_;
            } else {
                this._owner_ = owner;
                return this;
            }
        },
        $linq: function () {
            return bingo.linq(this.$get());
        },
        clone: function (owner) {
            var p = bingo.variable(this.value);
            p._get_ = this._get_;
            p._set_ = this._set_;
            p.$owner(owner || this.$owner()).$view(this.$view());
            return p;
        }
    };
    
})(bingo);
﻿/*
* 1. 尽量将属性放在Initialization定义和初始
* 2. 尽量将方法放在Define中定义
* 3. 如果要链写方式属性，放在Variable中定义
*/

(function (bingo) {
    //version 1.0.1
    "use strict";

    var _extendDefine = function (define, obj) {
        //对象定义
        var prototype = define.prototype;

        //要分离(clone)的属性
        var property = prototype.__bg_property__ || (prototype.__bg_property__ = {});

        bingo.eachProp(obj, function (item, n) {
            if (!(bingo.isPlainObject(item) || bingo.isArray(item)))
                prototype[n] = item;
            else
                property[n] = item;//要分离处理
        });
       
    }, _proName = '__pro_names__', _extendProp = function (define, obj) {
        //对象定义
        var prototype = define.prototype;

        var proNO = prototype[_proName] ? prototype[_proName].split(',') : [];
        bingo.eachProp(obj, function (item, n) {
            item = obj[n];
            prototype[n] = _propFn(n, item);
            proNO.push(n);
        });
        prototype[_proName] = proNO.join(',');

    }, _propFn = function (name, defaultvalue) {
        var isO = bingo.isObject(defaultvalue),
            $set = isO && defaultvalue.$set,
            $get = isO && defaultvalue.$get,
            fn = null;

        if ($set || $get) {
            fn = function (value) {
                var p = _getProp(this);
                var attr = bingo.hasOwnProp(p, name) ? p[name] : (p[name] = { value: bingo.clone(defaultvalue.value) });
                attr.owner = this;
                if (arguments.length == 0) {
                    var rtt = $get ? $get.call(attr) : attr.value;
                    attr.owner = null;
                    return rtt;
                } else {
                    if ($set)
                        $set.call(attr, value);
                    else
                        attr.value = value;
                    attr.owner = null;
                    return this;
                }
            };
        } else {
            fn = function (value) {
                var p = _getProp(this);
                if (arguments.length == 0) {
                    return bingo.hasOwnProp(p, name) ? p[name] : defaultvalue;
                } else {
                    p[name] = value;
                    return this;
                }
            };
        }
        return fn;
    }, _getProp = function (obj) { return obj._bg_prop_ || (obj._bg_prop_ = {}); };

    //bingo.Class=============================================
    var _NewObject_define_String = "NewObject_define";//让对象现实时， 不初始化(Initialization)

    var _defineClass = function (define, baseDefine) {
        this._define = define;
        if (baseDefine)
            this._Base(baseDefine);
    };
    bingo.extend(_defineClass.prototype, {
        _Base: function (baseDefine) {
            var define = this._define;
            define.prototype = new baseDefine(_NewObject_define_String);
            define.prototype.constructor = define;

            //分离base_property
            var base_property = define.prototype.__bg_property__;
            if (base_property) {
                define.prototype.__bg_property__ = bingo.clone(base_property);
            }

            define.prototype.base = function () {

                var basePrototype = baseDefine.prototype;
                this.base = basePrototype.base;//将base设置为父层base
                //如果没有初始方法， 初始base
                if (basePrototype.___Initialization__ == bingo.noop) {
                    this.base.apply(this, arguments);
                } else {
                    basePrototype.___Initialization__.apply(this, arguments);
                }
            };
        },
        Define: function (o) {
            _extendDefine(this._define, o);
            return this;
        },
        Initialization: function (callback) {
            this._define.prototype.___Initialization__ = callback;
            return this;
        },
        Static: function (o) {
            bingo.extend(this._define, o);
            return this;
        },
        Prop: function (o) {
            _extendProp(this._define, o);
            return this;
        }
    });

    bingo.isClassObject = function (obj) {
        return obj && obj.__bg_isObject__ === true;
    };
    bingo.isClass = function (cls) {
        return cls && cls.__bg_isClass__ === true;
    };
    bingo.Class = function () {
        var defineName, baseDefine, func;
        var argItem = null;
        for (var i = 0, len = arguments.length; i < len; i++) {
            argItem = arguments[i];
            if (argItem) {
                if (bingo.isClass(argItem))
                    baseDefine = argItem;
                else if (bingo.isFunction(argItem))
                    func = argItem;
                else if (bingo.isString(argItem))
                    defineName = argItem;
            }
        }
        baseDefine || (baseDefine = bingo.Class.Base);

        var define = function () { if (arguments[0] != _NewObject_define_String) return define.NewObject.apply(window, arguments); };
        define.__bg_isClass__ = true;
        define.prototype.___Initialization__ = bingo.noop;
        define.prototype.base = bingo.noop;

        define.extend = function (obj) {
            _extendDefine(define, obj);
        };
        define.extendProp = function (obj) {
            _extendProp(define, obj);
        };
        define.NewObject = function () {
            var obj = new define(_NewObject_define_String);

            //分离object
            if (obj.__bg_property__) {
                var propertys = bingo.clone(obj.__bg_property__);
                bingo.extend(obj, propertys);
            }

            //如果没有初始方法， 初始base
            if (obj.___Initialization__ == bingo.noop) {
                obj.base && obj.base.apply(obj, arguments);
            } else {
                obj.___Initialization__.apply(obj, arguments);
            }
            obj.___Initialization__ = bingo.noop;
            obj.base = bingo.noop;

            define._onInit_ && define._onInit_.trigger([obj]);

            define._onDispose_ && obj.onDispose(function () { define._onDispose_.trigger([obj]) });

            return obj;
        };
        define.onInit = _onInit;
        define.onDispose = _onDispose;

        var defineObj = new _defineClass(define, baseDefine);

        func && func.call(defineObj);
        defineObj = null;

        if (!bingo.isNullEmpty(defineName))
            _makeDefine(defineName, define);

        return define;
    };

    var _onInit = function (callback) {
        if (callback) {
            this._onInit_ || (this._onInit_ = bingo.Event());
            this._onInit_.on(callback);
        }
        return this;
    }, _onDispose = function (callback) {
        if (callback) {
            this._onDispose_ || (this._onDispose_ = bingo.Event());
            this._onDispose_.on(callback);
        }
        return this;
    };


    //生成名字空间=============

    var _makeDefine = function (defineName, define) {
        var list = defineName.split('.');
        var ot = window;
        var n = "";
        var len = list.length - 1;
        for (var i = 0; i < len; i++) {
            n = list[i];
            if (!bingo.isNullEmpty(n)) {
                if (bingo.isNull(ot[n]))
                    ot[n] = {};
                ot = ot[n];
            }
        }

        //将原来的了级定义复制到新
        if (ot[list[len]])
            _copyDefine(ot[list[len]], define);

        return ot[list[len]] = define;
    },
    _copyDefine = function (source, target) {
        bingo.eachProp(source, function (item, n) {
            if (!bingo.hasOwnProp(target, n))
                target[n] = item;
        });
    };
    bingo.Class.makeDefine = function (defineName, define) { _makeDefine(defineName, define); };

    //定义基础类
    bingo.Class.Base = bingo.Class(function () {

        //this.Initialization(function () {
        //    //用于clone
        //    this.__init_args__ = bingo.sliceArray(arguments, 0);
        //});

        this.Define({
            __bg_isObject__: true,
            isDisposed: false,
            //释放状态, 0:未释放, 1:释放中, 2:已释放
            disposeStatus: 0,
            dispose: function () {
                if (this.disposeStatus === 0) {
                    try {
                        this.disposeStatus = 1;
                        this.trigger('$dispose');
                    } finally {
                        bingo.clearObject(this);
                        this.disposeStatus = 2;
                        this.isDisposed = true;
                        this.dispose = bingo.noop;
                    }
                }
            },
            onDispose: function (callback) {
                return this.on('$dispose', callback);
            },
            disposeByOther: function (obj) {
                if (obj && obj.dispose && !obj.isDisposed) {
                    var fn = bingo.proxy(this, function () {
                        this.dispose();
                    });

                    obj.onDispose(fn);
                    this.onDispose(function () {
                        obj.isDisposed || obj.onDispose().off(fn);
                    });
                }
                return this;
            },
            $prop: function (o) {
                var propNames = this[_proName];
                if (bingo.isNullEmpty(propNames))
                    return arguments.length == 0 ? null : this;
                propNames = propNames.split(',');
                var $this = this;
                if (arguments.length == 0) {
                    o = {};
                    bingo.each(propNames, function (item) {
                        o[item] = $this[item]();
                    });
                    return o;
                } else {
                    bingo.eachProp(o, function (item, name) {
                        if (bingo.inArray(name, propNames) >= 0)
                            $this[name](o[name]);
                    });
                    return this;
                }
            }
        });

        this.Define({
            getEvent: function (name) {
                if (name) {
                    this.__events__ || (this.__events__ = {});
                    var events = this.__events__;
                    return events[name] || (events[name] = bingo.Event(this));
                }
                return null;
            },
            hasEvent: function (name) {
                return this.__events__ && this.__events__[name] && this.__events__[name].size() > 0;
            },
            on: function (name, callback) {
                if (name && callback) {
                    this.getEvent(name).on(callback);
                }
                return this;
            },
            one: function (name, callback) {
                if (name && callback) {
                    this.getEvent(name).one(callback);
                }
                return this;
            },
            off: function (name, callback) {
                if (this.hasEvent(name)) {
                    this.getEvent(name).off(callback);
                }
                return this;
            },
            end: function (name, args) {
                if (name) {
                    this.getEvent(name).end(args);
                }
                return this;
            },
            trigger: function (name) {
                if (this.hasEvent(name)) {
                    var argLists = arguments.length > 1 ? arguments[1] : [];
                    return this.getEvent(name).trigger(argLists);
                }
            },
            triggerHandler: function (name) {
                if (this.hasEvent(name)) {
                    var argLists = arguments.length > 1 ? arguments[1] : [];
                    return this.getEvent(name).triggerHandler(argLists);
                }
            }
        });
    });


    bingo.Class.Define = function (define) {
        if (bingo.isObject(define)) {
            var baseDefine = define.$base;
            var init = define.$init;
            var dispose = define.$dispose;
            var $static = define.$static;
            var $prop = define.$prop;

            baseDefine && (delete define.$base);
            init && (delete define.$init);
            dispose && (delete define.$dispose);
            $static && (delete define.$static);
            $prop && (delete define.$prop);


            return bingo.Class(baseDefine || bingo.Class.Base, function () {

                $prop && this.Prop($prop);

                this.Define(define);

                if (init || dispose) {
                    this.Initialization(function () {

                        if (dispose)
                            this.onDispose(dispose);

                        if (init)
                            init.apply(this, arguments);

                    });
                }

                $static && this.Static($static);

            });

        }
    };


})(bingo);
﻿//todo:_linqClass的edit等

(function (bingo) {
    //version 1.0.1
    "use strict";

    var _linqClass = bingo.linqClass = bingo.Class(function () {

        this.Define({
            concat: function (p, isBegin) {
                this._doLastWhere();
                isBegin = (isBegin === true);
                !bingo.isArray(p) && (p = [p]);
                var list1 = isBegin ? p : this._datas;
                var list2 = isBegin ? this._datas : p;
                this._datas = list1.concat(list2);
                return this;
            },
            _backup:null,
            backup: function () {
                this._doLastWhere();
                this._backup = this._datas;
                return this;
            },
            restore: function (isNotExsit) {
                if (isNotExsit === true) {
                    var list = this.toArray();
                    if (list.length == 0)
                        this._datas = this._backup;
                } else
                    this._datas = this._backup;
                return this;
            },
            each: function (fn, index, rever) {
                this._doLastWhere();
                bingo.each(this._datas, fn, index, rever);
                return this;
            },
            where: function (fn, index, count, rever) {
                /// <summary>
                /// 过滤<br />
                /// where('id', '1');
                /// where(function(item, index){ return item.max > 0 ;});
                /// </summary>
                /// <param name="fn" type="function(item, index)"></param>
                /// <param name="index" type="Number">开始位置, 如果负数从后面算起</param>
                /// <param name="count" type="Number">数量</param>
                /// <param name="rever" type="Boolean">反向</param>

                if (!bingo.isFunction(fn)) {
                    var name = fn, value = index;
                    fn = function () { return this[name] == value; };
                }
                this._doLastWhere();
                this._lastWhere = {
                    fn: fn, index: index,
                    count: bingo.isNumeric(count) ? count : -1,
                    rever: rever
                };
                return this;
            },
            _lastWhere:null,
            _doLastWhere: function (index, count, rever) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="index" type="Number">开始位置, 如果负数从后面算起</param>
                /// <param name="count" type="Number">数量</param>
                /// <param name="rever" type="Boolean">反向</param>

                var lastWhere = this._lastWhere;
                if (lastWhere) {
                    this._lastWhere = null;
                    var fn = lastWhere.fn,
                        index = bingo.isNumeric(index) ? index : lastWhere.index,
                        count = bingo.isNumeric(count) ? count : lastWhere.count,
                        rever = !bingo.isUndefined(rever) ? rever : lastWhere.rever;

                    var list = [];
                    this.each(function (item, index) {
                        if (fn.call(item, item, index)) {
                            list.push(item);
                            if (count != -1) {
                                count--;
                                if (count == 0) return false;
                            }
                        }
                    }, index, rever);
                    this._datas = list;
                }
                return this;
            },
            select: function (fn, isMerge) {
                /// <summary>
                /// 映射(改造)<br />
                /// select('id');<br />
                /// select('id', true);<br />
                /// select(function(item, index){ return {a:item.__a, b:item.c+item.d} ;});
                /// select(function(item, index){ return {a:item.__a, b:item.c+item.d} ;}, true);
                /// </summary>
                /// <param name="fn" type="function(item, index)"></param>
                /// <param name="isMerge">是否合并数组</param>

                if (!bingo.isFunction(fn)) {
                    var name = fn;
                    fn = function () { return this[name]; };
                }

                this._doLastWhere();
                var list = [];
                this.each(function (item, index) {
                    if (isMerge === true)
                        list = list.concat(fn.call(item, item, index));
                    else
                        list.push(fn.call(item, item, index));
                });
                this._datas = list;
                return this;
            },
            sort: function (fn) {
                /// <summary>
                /// 排序, sort(function(item1, item2){return item1-item2;})<br />
                /// item1 - item2:从小到大排序<br />
                /// item2 - item1:从大到小排序<br />
                /// item1 大于 item2:从小到大排序<br />
                /// item1 小于 item2:从大到小排序
                /// </summary>
                /// <param name="fn" type="function(item1, item2)"></param>
                this._doLastWhere();
                this._datas = this._datas.sort(function (item1, item2) {
                    var n = fn(item1, item2);
                    return n > 0 || n === true ? 1 : (n < 0 || n === false ? -1 : 0);
                });
                return this;
            },
            sortAsc: function (p) {
                /// <summary>
                /// 从小到大排序<br />
                /// sortAsc()<br />
                /// sortAsc('max')<br />
                /// sortAsc(function(item){ return item.max; })
                /// </summary>
                /// <param name="p">属性名称/function(item)</param>
                var isFn = bingo.isFunction(p);
                return this.sort(function (item1, item2) {
                    if (isFn)
                        return p.call(item1, item1) - p.call(item2, item2);
                    else if (p)
                        return item1[p] - item2[p];
                    else
                        return item1 - item2;
                });
            },
            sortDesc: function (p) {
                /// <summary>
                /// 从大到小排序<br />
                /// sortDesc()<br />
                /// sortDesc('max')<br />
                /// sortDesc(function(item){ return item.max; })
                /// </summary>
                /// <param name="p">属性名称/function(item)</param>
                var isFn = bingo.isFunction(p);
                return this.sort(function (item1, item2) {
                    if (isFn)
                        return p.call(item2, item2) - p.call(item1, item1);
                    else if (p)
                        return item2[p] - item1[p];
                    else
                        return item2 - item1;
                });
            },
            unique: function (fn) {
                /// <summary>
                /// 去除重复<br />
                /// 用法1. unique()<br />
                /// 用法2. unique('prop')<br />
                /// 用法3. unique(function(item, index){ return item.prop; });
                /// </summary>
                /// <param name="fn" type="function(item, index)">可选</param>
                this._doLastWhere();
                var list = [], hasList = [];

                if (!bingo.isFunction(fn)) {
                    if (arguments.length == 0)
                        fn = function (item) { return item; };
                    else {
                        var prop = fn;
                        fn = function (item) { return item[prop]; };
                    }
                }
                this.each(function (item, index) {
                    var o = fn.call(item, item, index);
                    if (bingo.inArray(o, hasList) < 0) {
                        list.push(item);
                        hasList.push(o);
                    }
                });
                this._datas = list;
                return this;
            },
            count: function () { this._doLastWhere(); return this._datas.length; },
            first: function (defaultValue) {
                /// <summary>
                /// 查找第一个数据
                /// </summary>
                /// <param name="defaultValue">可选, 默认值, 如果没有查找到时</param>
                this._doLastWhere(0, 1);
                return this._datas[0] || defaultValue;
            },
            last: function (defaultValue) {
                /// <summary>
                /// 查找最后一个数据
                /// </summary>
                /// <param name="defaultValue">可选, 默认值, 如果没有查找到时</param>
                this._doLastWhere(0, 1, true);
                return this._datas[0] || defaultValue;
            },
            contain: function () {
                /// <summary>
                /// 是否存在数据
                /// </summary>
                this._doLastWhere(0, 1);
                return this.count() > 0;
            },
            index: function () {
                var bl = this._datas;
                var d = this.first();
                return bingo.inArray(d, bl);
            },
            sum: function (callback) {
                this._doLastWhere();
                if (!bingo.isFunction(callback)) {
                    var prop = callback;
                    callback = function (item) { return prop ? item[prop] : item; };
                }
                var n = 0;
                this.each(function (item, index) {
                    n += (callback ? callback.call(item, item, index) : item);
                });
                return n;
            },
            avg: function (callback) {
                this._doLastWhere();
                if (!bingo.isFunction(callback)) {
                    var prop = callback;
                    callback = function (item) { return prop ? item[prop] : item; };
                }
                var n = 0;
                this.each(function (item, index) {
                    n += (callback ? callback.call(item, item, index) : item);
                });
                return (n == 0 ? 0 : n / this._datas.length);
            },
            take: function (pos, count) {
                this._doLastWhere();
                if (isNaN(count) || count < 0)
                    count = this.count();
                return bingo.sliceArray(this._datas, pos, count);
            },
            toArray: function () { this._doLastWhere(); return this._datas;},
            toPage: function (page, pageSize) {
                var list = this.toArray();
                var currentPage = 1, totalPage = 1, pageSize = pageSize, totals = list.length, list = list;
                if (list.length > 0) {
                    totalPage = parseInt(totals / pageSize) + (totals % pageSize != 0 ? 1 : 0);
                    currentPage = page > totalPage ? totalPage : page < 1 ? 1 : page;
                    list = this.take((currentPage - 1) * pageSize, pageSize);
                }
                return {
                    currentPage: currentPage, totalPage: totalPage, pageSize: pageSize,
                    totals: totals, list: list
                };
            },
            _getGroupByValue: function (value, rList, groupName) {
                for (var i = 0, len = rList.length; i < len; i++) {
                    if (rList[i][groupName] == value)
                        return rList[i];
                }
                return null;
            },
            group: function (callback, groupName, itemName) {
                /// <summary>
                /// 用法1. group('type', 'group', 'items')<br />
                /// 用法2. group(function(item, index){ return item.type; }, 'group', 'items');
                /// </summary>
                /// <param name="callback">function(item index){ return item.type;}</param>
                /// <param name="groupName">可选, 分组值, 默认group</param>
                /// <param name="itemName">可选, 分组内容值, 默认items</param>

                groupName || (groupName = 'group');
                itemName || (itemName = 'items');
                if (!bingo.isFunction(callback)) {
                    var prop = callback;
                    callback = function (item) { return item[prop]; };
                }

                this._doLastWhere();
                var rList = [], list = this._datas;
                var len = list.length;
                var iT = null;
                var rT = null;
                var vT = null;
                for (var i = 0; i < len; i++) {
                    iT = list[i];
                    vT = callback.call(iT, iT, i);
                    rT = this._getGroupByValue(vT, rList, groupName);
                    if (rT == null) {
                        rT = {};
                        rT[groupName] = vT;
                        rT[groupName + 'Data'] = vT;
                        rT[itemName] = [iT];
                        rList.push(rT);
                    } else {
                        rT[itemName].push(iT);
                    }
                }
                this._datas = rList;
                return this;
            }
        });

        this.Initialization(function (p) {
            this._datas = p || [];
        });
    });

    bingo.linq = function (list) { return _linqClass.NewObject(list); };

})(bingo);
﻿
; (function (bingo) {
    //version 1.0.1
    "use strict";

    var _equals = function (p1, p2) {
        if (bingo.isNull(p1) || bingo.isNull(p2))
            return p1 === p2;
        if (bingo.isArray(p1)) {
            return _ArrayEquals(p1, p2);
        } else if (p1 instanceof RegExp) {
            return _RegExpEquals(p1, p2);
        } else if (bingo.isFunction(p1)) {
            return (bingo.isFunction(p2) && p1.valueOf() === p2.valueOf());
        } else if (bingo.isObject(p1)) {
            return _ObjectEquals(p1, p2);
        } else {
            return ((typeof (p1) === typeof (p2)) && (p1.valueOf() === p2.valueOf()));
            //return ((typeof (p1) === typeof (p2)) && (p1 === p2));
        }
    };

    var _RegExpEquals = function (reg1, reg2) {
        return (reg2 instanceof RegExp) &&
         (reg1.source === reg2.source) &&
         (reg1.global === reg2.global) &&
         (reg1.ignoreCase === reg2.ignoreCase) &&
         (reg1.multiline === reg2.multiline);
    };

    var _ArrayEquals = function (arr1, arr2) {
        if (arr1 === arr2) { return true; }
        if (!bingo.isArray(arr2) || arr1.length != arr2.length) { return false; } // null is not instanceof Object.
        for (var i = 0, len = arr1.length; i < len; i++) {
            if (!_equals(arr1[i], arr2[i])) return false;
        }
        return true;
    };

    var _ObjectEquals = function (obj1, obj2) {
        if (obj1 === obj2) return true;
        if (!bingo.isObject(obj2)) return false;

        var count = 0;
        for (var n in obj1) {
            count++;
            //不检查原形部分, 认为是相等
            if (bingo.hasOwnProp(obj1, n) && !_equals(obj1[n], obj2[n])) return false;
        }
        for (var nn in obj2) count--;
        return (count === 0);
    };

    bingo.extend({
        equals: function (o1, o2) {
            return _equals(o1, o2);
        }
    });
//    var o = { a: 1, b: 1, c: [1, { a: 22 }, 2], d:1, f:new Date(1, 2, 3), e:/ab/g};
//    var o1 = { a: 1, b: 1, c: [1, { a: 22}, 2], d:1, f:new Date(1, 2,3), e:/a/g};
//    console.log("equals", bingo.equals(o, o1));

})(bingo);
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";

    var doc = window.document;
    var head = doc.head ||
      doc.getElementsByTagName('head')[0] ||
      doc.documentElement;
    var baseElement = head.getElementsByTagName('base')[0];

    var READY_STATE_RE = /loaded|complete|undefined/i;
    var isSCRIPT = /SCRIPT/i;

    var fetch = function (url, callback, id, charset) {

        //如果是css创建节点 link  否则 则创建script节点
        var node = doc.createElement('script');
        node.importurl = url;
        node.imporid = id || bingo.makeAutoId();
        node.async = 'async';
        node.src = url;

        if (charset) {
            var cs = bingo.isFunction(charset) ? charset(url) : charset;
            cs && (node.charset = cs);
        }

        //scriptOnload执行完毕后执行callback ，如果自定义callback为空，则赋予noop 为空函数
        scriptOnload(node, callback || bingo.noop);


        // For some cache cases in IE 6-9, the script executes IMMEDIATELY after
        // the end of the insertBefore execution, so use `currentlyAddingScript`
        // to hold current node, for deriving url in `define`.
        // 之下这些代码都是为了兼容ie 
        // 假如A页面在含有base标签，此时A页面有个按钮具有请求B页面的功能，并且请求过来的内容将插入到A页面的某个div中
        // B页面有一些div，并且包含一个可执行的script
        // 其他浏览器都会在异步请求完毕插入页面后执行该script 但是 ie 不行，必须要插入到base标签前。
        //currentlyAddingScript = node;

        // ref: #185 & http://dev.jquery.com/ticket/2709 
        // 关于base 标签 http://www.w3schools.com/tags/tag_base.asp

        baseElement ?
            head.insertBefore(node, baseElement) :
            head.appendChild(node);

        return id;
    },
    scriptOnload = function (node, callback) {
        // onload为IE6-9/OP下创建CSS的时候，或IE9/OP/FF/Webkit下创建JS的时候  
        // onreadystatechange为IE6-9/OP下创建CSS或JS的时候

        var loadedFun = function () {
            if (!node) return;
            //正则匹配node的状态
            //readyState == "loaded" 为IE/OP下创建JS的时候
            //readyState == "complete" 为IE下创建CSS的时候 -》在js中做这个正则判断略显多余
            //readyState == "undefined" 为除此之外浏览器
            if (READY_STATE_RE.test(node.readyState)) {

                // Ensure only run once and handle memory leak in IE
                // 配合 node = undefined 使用 主要用来确保其只被执行一次 并 处理了IE 可能会导致的内存泄露
                node.onload = node.onerror = node.onreadystatechange = null;

                // Remove the script to reduce memory leak
                // 在存在父节点并出于isDebug移除node节点
                if (!bingo.isDebug && node.parentNode) {
                    node.parentNode.removeChild(node);
                }

                setTimeout(function () {
                    if (!node) return;
                    try {
                        //执行回调
                        callback && callback(node.importurl, node.imporid, node);
                    } finally {

                        // Dereference the node
                        // 废弃节点，这个做法其实有点巧妙，对于某些浏览器可能同时支持onload或者onreadystatechange的情况，只要支持其中一种并执行完一次之后，把node释放，巧妙实现了可能会触发多次回调的情况
                        node = undefined;
                        callback = null;
                    }
                }, 1);
            }
        };

        node.onload = node.onerror = node.onreadystatechange = function () {
            loadedFun();
        };

    };

    bingo.extend({
        fetch: function (url, callback, id, charset) {
            /// <summary>
            /// callback(url, node);
            /// </summary>
            /// <param name="url"></param>
            /// <param name="callback"></param>
            /// <param name="charset"></param>
            return fetch(url, callback, id, charset);
        }
    });

})(bingo);
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";
    var undefined;

    var _loadedJS = [], //已经加载的js
        _loadingJS = [], //加载中的js
        _squareJS = [], //预备的js
        _loadingCallback = [[],[]]; //加载中的callback

    var _inArray = function (element, list) {
        return bingo.inArray(function (item) { return bingo.isStringEquals(item, element); }, list);
    };

    var _hasJS = function (js) {
        return (_inArray(js, _loadedJS) >= 0
            || _inArray(js, _loadingJS) >= 0
            || _inArray(js, _squareJS) >= 0);
    };

    var _loadFun = function (jsList, callback, pos) {
        !bingo.isNumeric(pos) && (pos = bingo.usingPriority.Normal);

        _makeNeedList(jsList);

        _loadingCallback[pos] || (_loadingCallback[pos] = []);

        _loadingCallback[pos].push(callback);
        if (_squareJS.length > 0) {
            _loadJS();
        } else {
            //如果没有js, 或js已经加载
            setTimeout(function () {
                if (_isLoadEnd())
                    _endDone();
            }, 1);
        }
        //callback = jsList = null;
    },
    _makeNeedList = function (jsList) {
        var pathTemp = bingo.stringEmpty;
        bingo.each(jsList, function (pathItem) {
            if (bingo.isNull(pathItem)) return;
            pathTemp = bingo.route(pathItem);

            //路由
            pathTemp = _getMapPath(pathTemp);
            //如里有prdtVersion, 添加prdtVersion, query
            if (!bingo.supportWorkspace && !bingo.isNullEmpty(bingo.prdtVersion))
                pathTemp = [pathTemp, pathTemp.indexOf('?') >= 0 ? '&' : '?', '_version_=', bingo.prdtVersion].join('');

            //js文件是否已经存在
            if (!_hasJS(pathTemp)) {
                _squareJS.push(pathTemp); //加入预备
            }

        });
    };
    //var _isloading = false;
    var _loadJS = function () {
        //console.log("_loadJS", _squareJS, _loadingJS, _loadedJS);
        if (_squareJS.length > 0) {
            var squareJSTemp = _squareJS;
            _squareJS = [];//清空_squareJS
            bingo.each(squareJSTemp, function (path) {
                _loadingJS.push(path);//放入_loadingJS
                bingo.fetch(path, _fetchCallback);
            });
        }
    };
    var _isLoadEnd = function () {
        return (_squareJS.length <= 0 && _loadingJS.length <= 0);
    };
    var _fetchTimeId = undefined;
    var _fetchCallback = function (url, id) {
        _loadedJS.push(url);//放入_loadedJS
        _loadingJS = bingo.removeArrayItem(url, _loadingJS);//从_loadingJS删除

        if (_fetchTimeId != undefined)
            clearTimeout(_fetchTimeId);
        _fetchTimeId = setTimeout(function () {
            _fetchTimeId = undefined;
            if (_isLoadEnd()) {
                _endDone();
            }
        }, 5);

    };
    var _endDone = function () {
        var isAllDone = true;
        bingo.each(_loadingCallback, function (item , pos) {
            var loadingCallbackTemp = _loadingCallback[pos];//.reverse();
            _loadingCallback[pos] = [];
            bingo.each(loadingCallbackTemp, function (callback) {
                if (bingo.isFunction(callback))
                    callback();
            });
            if (_loadingCallback[pos].length > 0) {
                isAllDone = false;
                return false;
            }
        });

        //如果没有全部运行
        if (!isAllDone) {
            //如果加载完成, 没有新的js加载
            if (_isLoadEnd()) {
                _endDone();
            }
        }
    };

    //map========================================
    var _mapList = [],    //{path:"", mapPath:""}
        _createMapItem = function (mapPath, path) {
            return { path: path, mapPath: mapPath, pathReg: _makeRegexMapPath(path) };
        },
        _addMap = function (mapPath, path) {

            mapPath = bingo.route(mapPath);
            path = bingo.route(path);

            var oldmap = _getMap(path);
            if (bingo.isNull(oldmap)) {
                _mapList.push(_createMapItem(mapPath, path));
            } else {
                oldmap.mapPath = mapPath;
            }
        },
        _getMap = function (path, checkReg) {
            var index = bingo.inArray(function (item) {
                if (checkReg === true && item.pathReg) {
                    item.pathReg.lastIndex = 0;
                    return item.pathReg.test(path);
                }
                else
                    return bingo.isStringEquals(item.path, path);
            }, _mapList);
            return index >= 0 ? _mapList[index] : null;
        },
        _getMapPath = function (path) {
            var mapItem = _getMap(path, true);
            return (mapItem && mapItem.mapPath) || path;
        };

    
    //makeRegexMapPath
    var _makeRegexPath = /(\W)/g,
        _makeRegexPathSS = /(\\([?*]))/g,//查找 ?和*符号
        _makeRegexPathAll = /\\\*\\\*/g,//查找 ?和*符号
        _urlQueryPart = /\?[^?=]+\=.*$/,//查找query部分, ?aaa=111&b=222
        _hasRegPath = /[?*]+/,
        _isRegexMapPath = function (path) {
            return (!bingo.isNullEmpty(path)
                    && _hasRegPath.test(path.replace(_urlQueryPart, '')));
        }, _makeRegexMapPath = function (path) {
            if (!_isRegexMapPath(path)) return null;

            //去除query部分/aaa/ssss.?js?aaa=dfsdf  ==结果==> /aa?a/ssss.?js
            var query = path.match(_urlQueryPart);
            if (query) {
                //如果查找到返回数组:[''], 如果没有返回null
                query = query[0];
                path = path.replace(query, '');
                query = query.replace(_makeRegexPath, "\\$1");
            } else
                query = '';

            _makeRegexPath.lastIndex = 0;
            _makeRegexPathSS.lastIndex = 0;
            _makeRegexPathAll.lastIndex = 0;
            var regS = path.replace(_makeRegexPath, "\\$1").replace(_makeRegexPathAll, '.*').replace(_makeRegexPathSS, '[^./\]$2');
            regS = ['^', regS, query, '$'].join('');
            return new RegExp(regS);
        };

    bingo.extend({
        using: function () {
            if (arguments.length <= 0) return;
            var jsList = [];
            var callback = null;
            var pos = 0;

            var item = null;
            for (var i = 0, len = arguments.length; i < len; i++) {
                item = arguments[i];
                if (item) {
                    if (bingo.isFunction(item))
                        callback = item;
                    else if (bingo.isNumeric(item))
                        pos = item;
                    else
                        jsList = jsList.concat(item);
                }
            }
            _loadFun(jsList, function () {
                callback && callback();
            }, pos);
        },
        makeRegexMapPath: _makeRegexMapPath,
        isRegexMapPath: _isRegexMapPath,
        usingMap: function (mapPath, paths) {
            if (bingo.isNullEmpty(mapPath) || !paths || paths.length <= 0) return;

            bingo.each(paths, function (item, index) {
                if (bingo.isNullEmpty(item)) return;
                _addMap(mapPath, item);
            });
        },
        usingPriority: {
            First: 0,
            NormalBefore: 45,
            Normal: 50,
            NormalAfter: 55,
            Last: 100
        },
        path: function (a) {
            if (this.isObject(a)) {
                this.extend(_paths, a);
            } else {
                if (arguments.length > 1) {
                    _paths[arguments[0]] = arguments[1];
                } else {
                    var urls = a.split('?');
                    a = urls[0];
                    a = _makePath(a);
                    if (urls.length > 1)
                        a += ('?' + bingo.sliceArray(urls, 1).join('?'));
                    return a;
                }
            }
        }
    });

    var _paths = {}, _makePathMatch = /%([^%]*)%/i,
    _makePath = function (path) {
        if (bingo.isNullEmpty(path) || path.indexOf("%") < 0) return path;
        var query = '';
        if (path.indexOf('?')) {
            var pList = path.split('?');
            path = pList[0];
            query = pList[1];
        }

        _makePathMatch.lastIndex = 0;
        var pathRegx = path.match(_makePathMatch);
        var pathReturn = bingo.stringEmpty;
        var pathConfig = _paths;
        if (pathRegx) {
            if (pathConfig[pathRegx[1]])
                pathReturn = _makePath(path.replace(pathRegx[0], pathConfig[pathRegx[1]]));
            else
                pathReturn = _makePath(path.replace(pathRegx[0], bingo.stringEmpty));
        }
        pathRegx = null;
        pathConfig = null;
        return !query ? pathReturn : [pathReturn, query].join('?');
    };


})(bingo);
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";

    /*
        //1. 添加或设置路由'view'
        bingo.route('view', {
            //优先级, 越大越前, 默认100
            priority: 100,
            //路由地址
            url: 'view/{module}/{controller}/{action}',
            //路由转发到地址
            toUrl: 'modules/{module}/views/{controller}/{action}.html',
            //默认值
            defaultValue: { module: '', controller: '', action: '' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/system/user/list');
                返回结果==>'modules/system/views/user/list.html'
    */
    //路由
    bingo.route = function (p, context) {
        if (arguments.length == 1)
            return bingo.routeContext(p).toUrl;
        else
            p && context && _routes.add(p, context);
    };

    /*
        //根据url生成routeContext;
        var routeContext = bingo.routeContext('view/system/user/list');
            返回结果==>{
                url:'view/system/user/list',
                toUrl:'modules/system/views/user/list.html',
                params:{ module: 'system', controller: 'user', action: 'list' }
            }
    */
    //
    bingo.routeContext = function (url) {
        return _routes.getRouteByUrl(url);
    };

    /*
        //生成路由地址
        bingo.routeLink('view', { module: 'system', controller: 'user', action: 'list' });
            返回结果==>'view/system/user/list'
    */
    bingo.routeLink = function (name, p) {
        var r = _routes.getRuote(name);
        return r ? _paramToUrl(r.context.url, p, 1) : '';
    };

    /*
        //生成路由地址query
        bingo.routeLinkQuery('view/system/user/list', { id: '1111' });
            返回结果==>'view/system/user/list$id:1111'
    */
    bingo.routeLinkQuery = function (url, p) {
        url || (url = '');
        var urlPath = '';
        if (url.indexOf('$') >= 0 || url.indexOf('?') >= 0) {
            var routeContext = bingo.routeContext(url);
            p = bingo.extend({}, p, routeContext.params.queryParams);
            var sp = url.indexOf('$') >= 0 ? '$' : '?';
            url = url.split(sp)[0];
        }
        bingo.eachProp(p, function (item, n) {
            item = encodeURIComponent(item || '');
            //route参数形式, $aaa:1$bbb=2
            urlPath = [urlPath, '$', n, ':', item].join('');
        });
        return [url, urlPath].join('');
    };

    var _tranAttrRex = /\{([^}]+)\}/gi;
    var _urlToParams = function (url, routeContext) {
        //匹配url, 并生成url参数
        // 如'view/{module}/{contrller}/{action}' ==> {module:'', contrller:'', action:''}
        if (!url || !routeContext.url) return null;
        var matchUrl = routeContext.url;

        //如果包函*符号， 直接认为没有参数， 返回空object
        //if (matchUrl.indexOf('*') >= 0) {
        //    routeContext._reg || (routeContext._reg = new RegExp(matchUrl.replace('*', '.*')));
        //    return routeContext._reg.test(url) ? {} : null;
        //}

        //是否有?*匹配模式
        var isRegMod = bingo.isRegexMapPath(matchUrl);
        if (isRegMod) {
            //去除$后面部分内容, 作为查询条件
            var urlTest = matchUrl.indexOf('$') >= 0 ? matchUrl.split('$')[0] : matchUrl;
            _tranAttrRex.lastIndex = 0;
            urlTest = urlTest.replace(_tranAttrRex, '*');
            routeContext._reg || (routeContext._reg = bingo.makeRegexMapPath(urlTest));
            if (!routeContext._reg.test(url)) return null;
        }

        //url参数部分由$分开， 如aaaa/ssss.html$aaa:1$bb:2
        var urlParams = url.split('$');

        //解释url变量， 如:{module}/{action}/
        var urlList = urlParams[0].split('/'),
            matchUrlList = (routeContext._matchUrlList || (routeContext._matchUrlList = matchUrl.split('/')));
        if (urlList.length != matchUrlList.length) {
            return isRegMod ? {} : null;
        }
        var obj = {},//保存url变量
            isOk = true,//是否全匹配，如果不匹配， 返回null
            sTemp;
        bingo.each(matchUrlList, function (item, index) {
            sTemp = urlList[index];

            //如果没有?和*查询符, 
            if (!(isRegMod && bingo.isRegexMapPath(item))) {
                _tranAttrRex.lastIndex = 0;
                if (_tranAttrRex.test(item)) {
                    obj[item.replace(_tranAttrRex, '$1')] = decodeURIComponent(sTemp || '');
                } else {
                    isOk = (item == sTemp);
                    if (!isOk) return false;
                }

            }
        });

        var queryParams = obj.queryParams = {};

        //如果url匹配， 
        //生成多余参数
        if (isOk && urlParams.length > 1) {
            urlParams = bingo.sliceArray(urlParams, 1);
            bingo.each(urlParams, function (item, index) {
                var list = item.split(':'),
                    name = list[0],
                    val = decodeURIComponent(list[1] || '');
                name && (obj[name] = queryParams[name] = val);
            });
        }

        return isOk ? obj : null;
    }, _getActionContext = function () {
        var context = { app: null, module: null, controller: null, action: null };
        var params = this.params;
        if (params) {
            var appName = params.app;
            var moduleName = params.module;

            var appIn = bingo.isNullEmpty(appName) ? bingo.defaultApp() : bingo.app(appName);
            var moduleIn = bingo.isNullEmpty(moduleName) ? appIn.defaultModule()
                : appIn.module(moduleName);

            var controller = moduleIn ? moduleIn.controller(params.controller) : null;
            var action = controller ? controller.action(params.action) : (moduleIn ? moduleIn.action(params.action) : null);
            context.app = appIn;
            context.module = moduleIn;
            context.controller = controller;
            context.action = action;
        }
        return context;
    }, _makeRouteContext = function (name, url, toUrl, params) {
        //生成 routeContext
        return { name: name, params: params, url: url, toUrl: toUrl, actionContext: _getActionContext };
    }, _paramToUrl = function (url, params, paramType) {
        //_urlToParams反操作, paramType:为0转到普通url参数(?a=1&b=2), 为1转到route参数($a:1$b:2)， 默认为0
        _tranAttrRex.lastIndex = 0;
        if (!url || !params) return bingo.path(url);
        var otherP = '', attr = '', val = '';
        bingo.eachProp(params, function (item, n) {
            attr = ['{', n, '}'].join('');
            val = encodeURIComponent(item || '');

            if (url.indexOf(attr) >= 0) {
                //如果是url变量参数， 如/{module}/{aciont}/aa.txt
                url = bingo.replaceAll(url, attr, val);
            } else if (n != 'module' && n != 'controller' && n != 'action' && n != 'service' && n != 'app' && n != 'queryParams') {
                //如果是其它参数
                if (paramType == 1) {
                    //route参数形式, $aaa:1$bbb=2
                    otherP = [otherP, '$', n, ':', val].join('');
                } else {
                    //普通url参数， ?aaa=1&bbb=2
                    otherP = [otherP, '&', n, '=', val].join('');
                }
            }
        });

        if (otherP) {
            //如果有其它参数， 组装到url参数中
            if (paramType == 1) {
                url = [url, otherP].join('');
            } else {
                if (url.indexOf('?') >= 0)
                    url = [url, otherP].join('');
                else
                    url = [url, otherP.substr(1)].join('?');
            }
        }

        return bingo.path(url);
    };

    var _routes = {
        datas: [],
        defaultRoute: {
            url: '**',
            toUrl: function (url, param) { return url; }
        },
        add: function (name, context) {
            var route = this.getRuote(name);
            if (bingo.isUndefined(context.priority))
                context.priority = 100;
            if (route) {
                route.context = context;
            } else {
                this.datas.push({
                    name: name,
                    context: context
                });
            }
            this.datas = bingo.linq(this.datas).sort(function (item1, item2) { return item2.context.priority - item1.context.priority; }).toArray()
        },
        getRuote: function (name) {
            var item = null;
            bingo.each(this.datas, function () {
                if (this.name == name) { item = this; return false; }
            });
            return item;
        },
        getRouteByUrl: function (url) {
            if (!url) return '';


            var querys = url.split('?');
            if (querys.length > 1) url = querys[0];
            var routeContext = null, name='';
            var params = null;
            bingo.each(this.datas, function () {
                routeContext = this.context;
                params = _urlToParams(url, routeContext);
                //如果params不为null, 认为是要查找的url
                if (params) { name = this.name; return false; }
            });

            //再找组装参数
            if (!params){
                routeContext = _routes.defaultRoute;
                name = 'defaultRoute';
            }
            if (params || routeContext.defaultValue)
                params = bingo.extend({}, routeContext.defaultValue, params);

            if (bingo.isFunction(routeContext.toUrl))
                routeContext.toUrl;


            var toUrl = bingo.isFunction(routeContext.toUrl) ?
                routeContext.toUrl.call(routeContext, url, params)
                : routeContext.toUrl;

            if (querys.length > 1) {
                params || (params = {});
                querys[1].replace(/([^=&]+)\=([^=&]*)/g, function (find, name, value) {
                    params[name] = value;
                });
            }

            var toUrl = _paramToUrl(toUrl, params);

            return _makeRouteContext(name, url,  toUrl, params);
        }
    };

    //设置view资源路由
    bingo.route('view', {
        //优先级, 越大越前, 默认100
        priority: 100,
        //路由url, 如: view/system/user/list
        url: 'view/{module}/{controller}/{action}',
        //路由到目标url, 生成:modules/system/views/user/list.html
        toUrl: 'modules/{module}/views/{controller}/{action}.html',
        //变量默认值, 框架提供内部用的变量: module, controller, action, service
        defaultValue: { module: 'system', controller: 'user', action: 'list' }
    });

    //设置action资源路由
    bingo.route('action', {
        url: 'action/{module}/{controller}/{action}',
        toUrl: 'modules/{module}/controllers/{controller}.js',
        defaultValue: { module: 'system', controller: 'user', action: 'list' }
    });


    //设置viewS资源路由
    bingo.route('viewS', {
        //路由url, 如: view/system/user/list
        url: 'view/{module}/{action}',
        //路由到目标url, 生成:modules/system/views/user/list.html
        toUrl: 'modules/{module}/{action}.html',
        //变量默认值, 框架提供内部用的变量: module, controller, action, service
        defaultValue: { module: 'system', action: 'list' }
    });

    //设置actionS资源路由
    bingo.route('actionS', {
        url: 'action/{module}/{action}',
        toUrl: 'modules/{module}/scripts/{action}.js',
        defaultValue: { module: 'system', action: 'list' }
    });

    //设置service资源路由
    bingo.route('service', {
        url: 'service/{module}/{service}',
        toUrl: 'modules/{module}/services/{service}.js',
        defaultValue: { module: 'system', service: 'user' }
    });

    //设置service资源路由
    bingo.route('serviceS', {
        url: 'service/{service}',
        toUrl: 'modules/services/{service}.js',
        defaultValue: { module: 'system', service: 'user' }
    });

    ////设置src资源路由
    //bingo.route('srv', {
    //    url: 'srv?/{module}/{service}',
    //    defaultValue: { module: 'system', service: 'user' },
    //    toUrl: function (url, params) {
    //        return ['srv', params.module, params.service].join('/');
    //    },
    //});

})(bingo);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    bingo.cacheToObject = function (obj) {
        return obj && obj.__bg_cache__ ?
            obj.__bg_cache__
            : (obj.__bg_cache__ = _cacheClass.NewObject());
    };

    var _get = function (cache, key) {
        var item = bingo.linq(cache._datas).where(function () { return this.key == key; }).first();
        item && (item.t = new Date().valueOf());
        return item;
    }, _add = function (cache, key, value, max) {
        (max > 0) && _checkMax(cache, max);
        var item = {
            t: new Date().valueOf(),
            key: key, value: value
        };
        cache._datas.push(item);
        return item;
    }, _checkMax = function (cache, max) {
        var len = cache._datas.length, perDel = 5;
        if (len >= max + perDel) {
            cache._datas = bingo.linq(cache._datas)
                .sortAsc('t').take(perDel);
        }
    }, _remove = function (cache, key) {
        cache._datas = bingo.linq(cache._datas).where(function () { return this.key !== key; }).toArray();
    }, _has = function (cache, key) {
        return bingo.linq(cache._datas).where(function () { return this.key == key; }).contain();
    };

    var _cacheClass = bingo.Class(function () {

        this.Prop({
            max: 0,
            context:null
        });
        
        this.Define({
            key: function (key) {
                if (arguments.length == 0)
                    return this._key;
                else {
                    this._key = bingo.sliceArray(arguments, 0).join('_');
                    return this;
                }
            },
            _getItem: function () {
                var key = this.key();
                if (key) {
                    var datas = this._datas;
                    var item = _get(this, key);
                    if (item)
                        return item;
                    else {
                        var contextFn = this.context();
                        if (bingo.isFunction(contextFn)) {
                            this.context(null);
                            return _add(this, key, contextFn(), this.max());
                        }
                    }
                }
            },
            'get': function () {
                /// <summary>
                /// bingo.cache(obj).key('bbbb').context(function(){return '2';}).max(2).get();
                /// </summary>
                var item = this._getItem();
                return item && item.value;
            },
            'set': function (value) {
                /// <summary>
                /// bingo.cache(obj).key('bbbb').set('11111');
                /// </summary>
                /// <param name="value">值</param>
                var item = this._getItem();
                if (item)
                    item.value = value;
                else {
                    var key = this.key();
                    key && _add(this, key, value, this.max());
                }
                return this;
            },
            has: function () {
                var key = this.key();
                return key ? _has(this, key) : false;
            },
            clear: function () {
                var key = this.key();
                this.has() && _remove(this, key);
                return this;
            },
            clearAll: function () {
                this._datas = []; return this;
            }
        });

        this.Initialization(function () {
            this._datas = [];
        });

    });

})(bingo);
﻿
(function (bingo, $) {
    //version 1.0.1
    "use strict";
    var _lnkDomEvName = 'bingoLinkToDom';
    bingo.extend({
        linkToDom: function (jSelector, callback) {
            if (jSelector && bingo.isFunction(callback)) {
                var jo = $(jSelector);
                if (jo.size() > 0)
                    jo.one(_lnkDomEvName, callback);
                else
                    callback.call(jo);
            }
            return callback;
        },
        unLinkToDom: function (jSelector, callback) {
            if (jSelector) {
                var jo = $(jSelector);
                if (callback)
                    jo.off(_lnkDomEvName, callback);
                else
                    jo.off(_lnkDomEvName);

            }
        },
        isUnload: false
    });
    bingo.linkToDom.LinkToDomClass = bingo.Class(function () {

        this.Define({
            isDisposeFormDom:false,
            linkToDom: function (jqSelector) {
                this.__linkToDomInit();
                if (jqSelector) {
                    this.unlinkToDom();
                    var jo = this.__bg_lnk_dom = $(jqSelector);
                    this.__bg_lnk_fn = bingo.linkToDom(jo, bingo.proxy(this, function () {
                        //从dom链接中dispose
                        this.isDisposeFormDom = true;
                        this.dispose();
                        this.isDisposeFormDom = true;
                        //已经删除没必要了
                        //this.unlinkToDom();
                    }));
                }
                return this;
            },
            unlinkToDom: function () {
                if (this.__bg_lnk_dom && this.isDisposeFormDom !== true) {
                    bingo.unLinkToDom(this.__bg_lnk_dom, this.__bg_lnk_fn);
                    this.__bg_lnk_dom = null;
                }
                return this;
            },
            __linkToDomInit: function () {
                if (this.__isLinkToDomInit) return;
                this.__isLinkToDomInit = true;
                this.onDispose(function () {
                    this.unlinkToDom();
                });
            }
        });

    });

    var _cleanData = $.cleanData;
    $.cleanData = function (elems) {
        //console.log(elems);
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            try {
                $(elem).triggerHandler(_lnkDomEvName);
            } catch (e) { }
        }
        _cleanData.apply($, arguments);
    };

    $(window).unload(function () {
        bingo.isUnload = true;
        $(document.body).remove();
        $(document.documentElement).remove();
    });

})(bingo, window.jQuery);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    /*

    bingo.app('sip', function(){
    
        //定义system/user/list 和 system/user/form 两个action
        bingo.module('system', function () {
    
            //控制器user
            bingo.controller('user', function () {
    
                //action list
                bingo.action('list', function ($view) {
                    //这里开始写业务代码
                    $view.on('ready', function () {
                    });
    
                });
    
                //action form
                bingo.action('form', function ($view) {
                });
            });

             //定义system 的 userService
            bingo.service('userService', function ($ajax) {
                //这里写服务代码
            });

            //定义system 的 factory1
            bingo.factory('factory1', function($view){});

            //定义system 的 command1
            bingo.command('command1', function(){ return function($view){}});

            //定义system 的 filter1
            bingo.filter('filter1', function($view){ return function(value, params){ return value; }});
    
        });
    
        //定义system/userService服务
        bingo.module('system', function () {
    
            //userService
            bingo.service('userService', function ($ajax) {
                //这里写服务代码
            });
    
        });
    
    });//end app

    */

    var _makeCommandOpt = function (fn) {
        var opt = {
            priority: 50,
            tmpl: '',
            tmplUrl: '',
            replace: false,
            include: false,
            view: false,
            compileChild: true
            //compilePre: null,
            //join: null,
            //action: null,
            //compile: null,
            //link: null
        };
        fn = fn();
        if (bingo.isFunction(fn) || bingo.isArray(fn)) {
            opt.link = fn;
        } else
            opt = bingo.extend(opt, fn);
        return opt;
    }, _commandFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return;
        name = name.toLowerCase();
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_commands', name);
        else {
            return this._commands[name] = _makeCommandOpt(fn);
        }
    }, _filterFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return null;
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_filters', name);
        else
            return this._filters[name] = fn;
    }, _factoryFn = function (name, fn) {
        var len = arguments.length;
        if (len == 0)
            return this._factorys;
        else if (len == 1) {
            //var fn = bingo.isString(name) ? _getModuleValue.call(this, '_factorys', name) : name;
            //if (!fn) return null;
            return bingo.factory.factoryClass.NewObject().module(this).setFactory(name);
        } else {
            //如果fn为true, 获取factory
            return fn === true ? _getModuleValue.call(this, '_factorys', name) : this._factorys[name] = fn;
        }
    }, _factoryExtendFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return;
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_factoryExtends', name);
        else {
            fn.$owner = { module: this };
            return this._factoryExtends[name] = fn;
        }
    }, _serviceFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return;
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_services', name);
        else {
            fn.$owner = { module: this };
            return this._services[name] = fn;
        }
    }, _controllerFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return;
        var conroller = this._controllers[name];
        if (!conroller)
            conroller = this._controllers[name] = {
                module: this,
                name: name, _actions: {},
                action: _actionFn
            };
        if (bingo.isFunction(fn)) {
            var hasLM = _lastModule;
            !hasLM && (_lastModule = this);
            var hasApp = _lastApp;
            !hasApp && (_lastApp = _lastModule.app);

            _lastContoller = conroller;
            fn.call(conroller);
            _lastContoller = null;
            !hasLM && (_lastModule = null);
            !hasApp && (_lastApp = null);
        }
        return conroller;
    }, _actionFn = function (name, fn) {
        if (arguments.length == 1)
            return this._actions[name];
        else {
            fn.$owner = { conroller: this, module: this.module };
            return this._actions[name] = fn;
        }
    }, _actionMDFn = function (name, fn) {
        if (arguments.length == 1)
            return this._actions[name];
        else {
            fn.$owner = { conroller: null, module: this };
            return this._actions[name] = fn;
        }
    }, _getLastModule = function () {
        return _lastModule || bingo.defaultModule(_lastApp);
    }, _getModuleValue = function (prop, name) {
        var val = this[prop][name];
        if (!val) {
            var defaultModule = bingo.defaultModule(this.app);
            if (this != defaultModule)
                val = defaultModule[prop][name]
            if (!val && this.app != _defaultApp) {
                var defaultModule = bingo.defaultModule();
                if (this != defaultModule)
                    val = defaultModule[prop][name]
            }
        }
        return val;
    };

    var _moduleFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return null;

        var module = this._module[name];

        if (!module)
            module = this._module[name] = {
                name: name, _services: {}, _controllers: {},
                _commands: {}, _filters: {}, _factorys: {},
                _actions: {}, action: _actionMDFn,
                service: _serviceFn,
                controller: _controllerFn,
                command: _commandFn,
                filter: _filterFn,
                factory: _factoryFn,
                _factoryExtends: {}, factoryExtend: _factoryExtendFn,
                app:this
            };

        if (bingo.isFunction(fn)) {
            var hasApp = _lastApp;
            !hasApp && (_lastApp = this);
            _lastModule = module;
            fn.call(module);
            _lastModule = null;
            !hasApp && (_lastApp = null);
        }
        return module;

    }, _defaultModuleFn = function () {
        return this.module('_$defaultModule$_');
    };

    var _app = {}, _module = {}, _lastApp = null, _lastModule = null, _lastContoller = null;
    bingo.extend({
        defaultModule: function (app) {
            return app ? app.defaultModule() : _defaultApp.defaultModule();
        },
        getModuleByView: function (view) { return view ? view.$getModule() : bingo.defaultModule(); },
        //定义或获取模块
        module: function (name, fn) {
            var app = _lastApp || _defaultApp;
            return app.module.apply(app, arguments);
        },
        defaultApp: function () {
            return _defaultApp;
        },
        getAppByView: function (view) { return this.getModuleByView(view).app; },
        //定义或获取app
        app: function (name, fn) {
            if (this.isNullEmpty(name)) return null;
            //if (arguments.length == 1)
            //    return _module[name];

            var app = _app[name];

            if (!app) {
                app = _app[name] = {
                    name: name, _module: {},
                    module: _moduleFn,
                    defaultModule: _defaultModuleFn,
                    action: function (name, fn) {
                        var defaultModule = this.defaultModule();
                        return defaultModule.action.apply(defaultModule, arguments);
                    },
                    service: function (name, fn) {
                        var defaultModule = this.defaultModule();
                        return defaultModule.service.apply(defaultModule, arguments);
                    },
                    controller: function (name, fn) {
                        var defaultModule = this.defaultModule();
                        return defaultModule.controller.apply(defaultModule, arguments);
                    },
                    command: function (name, fn) {
                        var defaultModule = this.defaultModule();
                        return defaultModule.command.apply(defaultModule, arguments);
                    },
                    filter: function (name, fn) {
                        var defaultModule = this.defaultModule();
                        return defaultModule.filter.apply(defaultModule, arguments);
                    },
                    factory: function (name, fn) {
                        var defaultModule = this.defaultModule();
                        return defaultModule.factory.apply(defaultModule, arguments);
                    },
                    factoryExtend: function (name, fn) {
                        var defaultModule = this.defaultModule();
                        return defaultModule.factoryExtend.apply(defaultModule, arguments);
                    }
                };
            }

            if (bingo.isFunction(fn)) {
                _lastApp = app;
                fn.call(app);
                _lastApp = null;
            }
            return app;
        },
        service: function (name, fn) {
            var lm = _getLastModule();
            return lm.service.apply(lm, arguments);
        },
        factoryExtend: function (name, fn) {
            var lm = _getLastModule();
            return lm.factoryExtend.apply(lm, arguments);
        },
        controller: function (name, fn) {
            var lm = _getLastModule();
            return lm.controller.apply(lm, arguments);
        },
        action: function (name, fn) {
            if (bingo.isFunction(name) || bingo.isArray(name)) {
                return name;
            } else if (_lastContoller)
                return _lastContoller.action.apply(_lastContoller, arguments);
            else {
                var lm = _getLastModule();
                return lm.action.apply(lm, arguments);
            }

        },
        command: function (name, fn) {
            var lm = _getLastModule();
            return lm.command.apply(lm, arguments);
        },
        filter: function (name, fn) {
            var lm = _getLastModule();
            return lm.filter.apply(lm, arguments);
        },
        factory: function (name, fn) {
            var lm = _getLastModule();
            return lm.factory.apply(lm, arguments);
        }
    });

    var _defaultApp = bingo.app('_$defaultApp$_');

})(bingo);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    /*
        //定义factory
        bingo.factory('name', function ($view) {
            return $view;
        });

        //定义factory方法二
        bingo.factory('name', ['$view', function (v) {
            return v;
        }]);


        //factory的注入
        bingo.factory('name').view(view).inject();

        //factory的注入方法二
        bingo.factory(function($view){ return $view;}).view(view).inject();

         //factory的注入方法三
        bingo.factory(['$view', function(v){ return v;}]).view(view).inject();
  
    */

    var _factoryClass = bingo.Class(function () {

        this.Prop({
            name: '',
            view: null,
            viewnode: null,
            viewnodeAttr:null,
            widthData: null,
            node: null,
            module:null,
            //定义内容
            fn: null,
            //其它参数
            params:null
        });

        this.Define({
            //重置参数
            reset: function () {
               this.view(null).viewnode(null).viewnodeAttr(null)
                    .widthData(null).node(null).params(null);
               return this;
            },
            _newInjectObj: function () {
                //新建一个InjectObj
                var attr = this.viewnodeAttr(),
                    viewnode = this.viewnode() || (attr && attr.viewnode()),
                    view = this.view() || (viewnode && viewnode.view()) || bingo.rootView(),
                    node = this.node() || (viewnode && viewnode.node() )|| view.$node(),
                    withData = this.widthData() || (viewnode && viewnode.getWithData());
                return {
                    node: node,
                    $view: view,
                    $viewnode: viewnode,
                    $attr: attr,
                    $withData: withData,
                    $command: attr && attr.command,
                    $injectParam:this.params()
                };
            },
            //注入
            inject: function (owner, retAll) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="owner">默认attr||viewnode||view</param>
                var fn = this.fn();
                var $injects = fn.$injects;
                var injectObj = $injects && $injects.length > 0 ? this._newInjectObj() : {};
                var ret = this._inject(owner || this.viewnodeAttr() || this.viewnode() || this.view(),
                    this.name(), injectObj, {}, true);
                return retAll === true ? injectObj : ret;
            },
            //注入
            _inject: function (owner, name, injectObj, exObject, isFirst) {
                var fn = this.fn();
                if (!fn) throw new Error('not find factory: ' + name);
                var $injects = fn.$injects;
                var $extendFn = null;
                var injectParams = [], $this = this;
                if ($injects && $injects.length > 0) {
                    var pTemp = null;
                    bingo.each($injects, function (item) {
                        if (item in injectObj) {
                            pTemp = injectObj[item];
                        } else {
                            //注意, 有循环引用问题
                            pTemp = injectObj[item] = $this.setFactory(item)._inject(owner, item, injectObj, exObject, false);
                        }
                        injectParams.push(pTemp);

                        $this._doExtend(owner, item, injectObj, exObject);

                    });
                }

                var ret = fn.apply(fn.$owner || owner, injectParams) || {};
                if (bingo.isString(name) && name) {
                    injectObj[name] = ret;
                    if (isFirst)
                        this._doExtend(owner, name, injectObj, exObject);
                }


                return ret;
            },
            _doExtend: function (owner, name, injectObj, exObject) {
                if (exObject[name] !== true) {
                    exObject[name] = true;
                    var $extendFn = this._getExtendFn(name);
                    if ($extendFn) {
                        this.setFactory($extendFn)._inject(owner, '', injectObj, exObject, false);
                    }
                }
            },
            _getParams: function (name) {
                var appI, moduleI;

                var hasMN = name.indexOf('$') > 0, moduleName = '', nameT = name;
                if (hasMN) {
                    moduleName = name.split('$');
                    nameT = moduleName[1];
                    moduleName = moduleName[0];
                }
                if (this.view()) {
                    appI = bingo.getAppByView(this.view());
                    moduleI = hasMN ? appI.module(moduleName) : bingo.getModuleByView(this.view());
                } else {
                    moduleI = this.module();
                    appI = moduleI.app;
                    if (hasMN) moduleI = appI.module(moduleName);
                }
                return { app: appI, module: moduleI, name: nameT };
            },
            _getExtendFn: function (name) {
                var p = this._getParams(name);
                var exFn = p.module.factoryExtend(p.name);
                return exFn ? _makeInjectAttrs(exFn) : null;
            },
            _getFactoryFn: function (name) {
                var p = this._getParams(name);
                var moduleI = p.module, nameT = p.name;
                var fn = moduleI.factory(nameT, true) || moduleI.service(nameT);
                return fn ? _makeInjectAttrs(fn) : null;
            },
            setFactory: function (name) {
                var fn = null, exFn = null;
                if (bingo.isFunction(name) || bingo.isArray(name)) {
                    //支持用法：factory(function(){})
                    fn = _makeInjectAttrs(name);
                    name = '';
                }
                else {
                    fn = this._getFactoryFn(name);
                }
                return this.name(name).fn(fn);
            }
        });

    });


    bingo.factory.factoryClass = _factoryClass;

    var _injectNoop = function () { };
    _injectNoop.$injects = [];

    var _makeInjectAttrRegx = /^\s*function[^(]*?\(([^)]+?)\)/i,
    _makeInjectAttrs = function (p) {
        if (p && (p.$injects || p.$fn)) return p.$fn || p;

        var fn = _injectNoop;
        if (bingo.isArray(p)) {
            var list = bingo.clone(p, false);
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

})(bingo);
﻿//todo:
(function (bingo) {
    //version 1.1.0
    "use strict";

    var _isModel_ = 'isModel1212';
    bingo.isModel = function (p) { return p && p._isModel_ == _isModel_; };
    bingo.modelOf = function (p) { p = bingo.variableOf(p); return bingo.isModel(p) ? p.toObject() : p; };

    var _toObject = function (obj) {
        var o = obj || {}, val;
        bingo.eachProp(this, function (item, n) {
            if (bingo.isVariable(o[n]))
                o[n](item);
            else if (n != '_isModel_' && n != 'toObject' && n != 'fromObject' && n != 'toDefault' && n != '_p_')
                o[n] = bingo.variableOf(item);
        });
        return o;

    }, _fromObject = function (obj, extend) {
        if (obj) {
            bingo.eachProp(obj, bingo.proxy(this, function (item, n) {
                if (n in this) {
                    if (bingo.isVariable(this[n])) {
                        this[n](item);
                    } else
                        this[n] = bingo.variableOf(item);
                } else if (extend) {
                    this[n] = bingo.variable(item);
                }
            }));
        }
        return this;
    }, _toDefault = function () {
        this.fromObject(this._p_);
    };
    bingo.model = function (p, view) {
        p = bingo.modelOf(p);
        var o = {}, item;
        bingo.eachProp(p, function (item, n) {
            o[n] = bingo.variable(item, o, view);
        });

        o._isModel_ = _isModel_;
        o._p_ = p;
        o.toObject = _toObject;
        o.fromObject = _fromObject;
        o.toDefault = _toDefault;
        return o;
    };

})(bingo);
﻿//todo:
(function (bingo) {
    //version 1.1.0
    "use strict";

    /*
        观察模式类
    */
    var _observerClass = bingo.Class(function () {
        var _newItem = function (watch, context, callback, deep, disposer, priority) {
            priority || (priority = 50);
            var _isFn = bingo.isFunction(context),
                //取值
                _getValue = function () {
                    var val;
                    if (_isFn) {
                        //如果是function
                        //if (disposer && disposer.isDisposed) { setTimeout(function () { item.dispose(); }); return; }
                        val = context.call(item);
                    }
                    else {
                        var scope = watch._view;
                        val = bingo.datavalue(scope, context);
                        if (bingo.isUndefined(val))
                            val = bingo.datavalue(window, context);
                    }
                    return bingo.isModel(val) ? bingo.modelOf(val) : val;
                },
                _oldValue = _getValue();
            var item = {
                _callback: callback,
                dispose: _dispose,
                _priority: priority
            };

            if (bingo.isVariable(_oldValue)) {
                item.check = _varSub;
                item.isChange = false;
                var view = watch._view;
                item.varo = _oldValue;
                _oldValue.$subs(function (value) {
                    callback.call(item, value);
                    watch.publishAsync();
                }, disposer || view, priority);
            } else {
                if (deep) _oldValue = bingo.clone(_oldValue);
                item.check = function () {
                    if (disposer && disposer.isDisposed) { item.dispose && item.dispose(); return; }
                    var newValue = _getValue(),
                        isChange = deep ? (!bingo.equals(newValue, _oldValue)) : (newValue != _oldValue);
                    if (isChange) {
                        _oldValue = deep ? bingo.clone(newValue) : newValue;
                        callback.call(this, newValue);
                        return true;
                    }
                    return false;
                };
            }
            return item;
        };

        var _varSub = function () {
            return false;
        }, _dispose = function () { bingo.clearObject(this); };

        this.Define({
            unSubscribe: function (callback) {
                /// <summary>
                /// 取消订阅
                /// </summary>
                /// <param name="callback">可选, 不传则取消全部订阅</param>
                if (arguments.length > 0)
                    this._subscribes = bingo.linq(this._subscribes)
                        .where(function () {
                            if (this._callback == callback) {
                                this.dispose();
                                return false;
                            } else
                                return true;
                        }).toArray();
                else {
                    bingo.each(this._subscribes, function () {
                        this.dispose();
                    });
                    this._subscribes = [];
                }
                return this;
            },
            subscribe: function (context, callback, deep, disposer, priority) {
                /// <summary>
                /// 订阅
                /// </summary>
                /// <param name="context">
                ///     观察内容:
                ///         $view的属性, 如, $view.title = '标题', subscribe('title'....
                ///         方法如果subscribe(function(){ return $view.title;}, .....
                /// </param>
                /// <param name="callback">
                ///     观察到改变后执行的内容
                /// </param>
                /// <param name="deep">是否深层比较, 默认简单引用比较</param>
                /// <param name="disposer">自动释放对象, 必须是bingo.Class定义对象</param>
                /// <returns value='{check:function(){}, dispose:function(){}}'></returns>
                var item = _newItem(this, context, callback, deep, disposer, priority);
                this._subscribes.push(item);
                this._subscribes = bingo.linq(this._subscribes).sortDesc('_priority').toArray();
                return item;
            },
            //发布信息
            publish: function () {
                //计数清0
                this._publishTime = 0;
                this._publish && this._publish();
                return this;
            },
            publishAsync: function () {
                if (!this._pbAsync_) {
                    var $this = this;
                    this._pbAsync_ = setTimeout(function () {
                        $this._pbAsync_ = null; $this.publish();
                    }, 5);
                }
                return this;
            },
            _publishTime: 0,//发布计数
            _publish: function () {
                var isChange = false, hasRm = false;
                bingo.each(this._subscribes, function () {
                    if (!this.check) {
                        hasRm = true; return;
                    }
                    if (this.check())
                        isChange = true;
                });
                if (hasRm) {
                    this._subscribes = bingo.linq(this._subscribes)
                        .where(function () { return this.check; }).toArray();
                }
                if (isChange) {
                    if (this._publishTime < 10) {
                        //最多连接10次, 防止一直发布
                        this._publishTime++;
                        var $this = this;
                        setTimeout(function () { $this.isDisposed || $this._publish(); }, 5);
                    }
                } else
                    this._publishTime = 0;
            }
        });

        this.Initialization(function (view) {
            this._view = view,
            this._subscribes = [];

            this.disposeByOther(view);
            this.onDispose(function () {
                bingo.each(this._subscribes, function () {
                    this.dispose();
                });
            });
        });

    });

    bingo.observer = function (view) {
        return view && (view.__observer__ || (view.__observer__ = _observerClass.NewObject(view)));
    };
    bingo.observer.observerClass = _observerClass;

})(bingo);
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";

    /*
        bingo.ajax(url, $view)
            .async(true).dataType('json').cache(false)
            .param({})
            .success(function(rs){})
            .error(function(rs){})
            .alway(function(rs){})
            .post() //.get()
    */

    bingo.ajax = function (url, view) {
        return _ajaxClass.NewObject(url).view(view);
    };
    bingo.ajaxSync = function (view) {
        /// <summary>
        /// 
        /// </summary>
        return _ajaxSyncClass.NewObject().view(view).dependent(bingo.noop);
    };
    bingo.ajaxSyncAll = function (p, view) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="p">可以是function, ajax, ajaxSync</param>
        return _syncAll(p, view);
    };

    var _ajaxBaseClass = bingo.ajax.ajaxBaseClass = bingo.Class(function () {

        var _makeCallFn = function (cType, callback) {
            var fn = function (type, args, context) {
                if (type == cType || cType == 'alway') {
                    callback.apply(context, args);
                }
            };
            return fn;
        };

        this.Define({
            view: function (v) {
                if (arguments.length == 0) return this._view;
                this._view = v;
                //this.disposeByOther(v);
                return this;
            },
            _callbacks: function () {
                this._calls || (this._calls = $.Callbacks('stopOnFalse'));
                return this._calls;
            },
            //拒绝
            _reject: function (args) {
                this._calls && this._callbacks().fire('fail', args || [], this);
            },
            //解决
            _resolve: function (args) {
                this._calls && this._callbacks().fire('done', args || [], this);
            },
            success: function (callback) {
                if (callback) this._callbacks().add(_makeCallFn('done', callback));
                return this;
            },
            error: function (callback) {
                if (callback) this._callbacks().add(_makeCallFn('fail', callback));
                return this;
            },
            alway: function (callback) {
                if (callback) this._callbacks().add(_makeCallFn('alway', callback));
                return this;
            },
            fromOther: function (ajax) {
                if (ajax instanceof _ajaxBaseClass) {
                    this._view = ajax._view;
                    this._calls = ajax._calls;
                    var p = ajax.$prop();
                    this.$prop(p);
                }
                return this;
            }
        });

    });

    var _ajaxClass = bingo.ajax.ajaxClass = bingo.Class(_ajaxBaseClass, function () {

        this.Static({
            holdServer: function (ajax, response, isSuccess, xhr) {
                return [response, isSuccess, xhr];
            }
        });

        var _disposeEnd = function (servers) {
            if (servers.isDisposed) return;
            setTimeout(function () {
                servers.dispose();
            }, 1);
        };

        var _loadServer = function (servers, type) {
            /// <param name="servers" value='_ajaxClass.NewObject()'></param>
            var view = servers.view();
            if (servers.isDisposed || (view && view.isDisposed)) { _disposeEnd(servers); return; }
            var holdParams = servers.holdParams();
            var datas = bingo.clone(holdParams ? holdParams.call(servers) : (servers.param() || {}));

            var holdServer = servers.holdServer() || _ajaxClass.holdServer;

            var cacheMG = null,
                url = servers.url(),
                cKey = '';
            var cacheTo = servers.cacheTo();
            if (cacheTo) {
                cKey = servers.cacheKey() || (servers.cacheQurey() ? url : url.split('?')[0]);
                if (!bingo.equals(datas, {}))
                    cKey = [cKey, window.JSON ? JSON.stringify(datas) : $.getJSON(datas)].join('_');
                cKey = cKey.toLowerCase();
                cacheMG = bingo.cacheToObject(cacheTo).max(servers.cacheMax()).key(cKey);
                if (cacheMG.has()) {
                    var cacheData = cacheMG.get();
                    if (bingo.isObject(cacheData)) cacheData = bingo.clone(cacheData);
                    servers.isCacheData = true;
                    if (servers.async())
                        setTimeout(function () {
                            if (!servers.isDisposed) {
                                (view && view.isDisposed) || servers._resolve([cacheData]);
                                _disposeEnd(servers);
                            }
                        });
                    else
                        servers._resolve([cacheData]);
                    _disposeEnd(servers);
                    return;
                }
            }

            var _hold = function (response, status, xhr) {
                if (!servers.isDisposed) {
                    if (!(view && view.isDisposed)) {
                        try {
                            var hL = holdServer(servers, response, status, xhr);
                            response = hL[0], status = hL[1], xhr = hL[2];

                            if (status === true) {
                                cacheMG && cacheMG.key(cKey).set(response)
                                servers._resolve([response]);
                            } else
                                servers._reject([response, false, xhr]);
                        } catch (e) {
                            bingo.trace(e);
                        }
                    }
                    _disposeEnd(servers);
                }
            };

            if (!bingo.supportWorkspace && !bingo.isNullEmpty(bingo.prdtVersion))
                url = [url, url.indexOf('?') >= 0 ? '&' : '?', '_version_=', bingo.prdtVersion].join('');

            $.ajax({
                type: type,
                url: url,
                data: datas,
                async: servers.async(),
                cache: servers._ajaxCache(),
                dataType: servers.dataType(),
                success: function (response, status, xhr) {
                    _hold(response, true, xhr);
                },
                error: function (xhr, status, response) {
                    _hold(response, false, xhr);
                }
            });
        };

        this.Prop({
            url: { $set: function (value) { this.value = bingo.route(value); } },
            async: true,
            dataType: 'json',
            _ajaxCache:false,
            param: {},
            //缓存到
            cacheTo: null,
            //缓存数量， 小于等于0, 不限制数据
            cacheMax: -1,
            //是否包函url query部分作为key 缓存数据, 默认true
            cacheQurey: true,
            //自定义cache key, 默认为null, 以url为key
            cacheKey:null,
            holdServer: null,
            holdParams: null
        });

        this.Define({
            isCacheData: false,
            addToAjaxSync: function (ajaxSync) {
                /// <summary>
                /// 添加到ajaxSync同步
                /// </summary>
                /// <param name="ajaxSync">可选， 如果空， 添加全局同步</param>
                ajaxSync || (ajaxSync = _ajaxSyncClass.lastSync(this.view()));
                if (ajaxSync) {
                    ajaxSync.dependent(this);
                }
                return this;
            },
            post: function () {
                if (this.async()) this.addToAjaxSync();
                _loadServer(this, 'post');
                this.post = bingo.noop;
                return this;
            },
            'get': function () {
                if (this.async()) this.addToAjaxSync();
                _loadServer(this, 'get');
                this.get = bingo.noop;
                return this;
            }
        });

        this.Initialization(function (url) {
            this.url(url);
        });
    });

    var _ajaxSyncClass = bingo.ajax.ajaxaSyncClass = bingo.Class(_ajaxBaseClass, function () {

        this.Static({
            _syncList: [],
            getSyncList: function (view) {
                return (view && view.__syncList_ && (view.__syncList_ = [])) || this._syncList;
            },
            lastSync: function (view) {
                var syncList = this.getSyncList(view);
                var len = syncList.length;
                return len > 0 ? syncList[len - 1] : null;
            }
        });

        this.Define({
            //解决, 马上成功
            resolve: function () {
                this._count = 0;
                this._resolve();
                this.dispose();
            },
            //拒绝, 马上失败
            reject: function () {
                this._count = 0;
                this._reject();
                this.dispose();
            },
            dependent: function (p) {
                /// <summary>
                /// 依赖
                /// </summary>
                /// <param name="p">可以是function, ajax, ajaxSync</param>
                this.addCount();
                var $this = this;
                if (bingo.isFunction(p)) {
                    try {
                        p.call(this);
                        setTimeout(function () { !$this.isDisposed && $this.decCount(); }, 1);
                    } catch (e) {
                        bingo.trace(e);
                        this.reject();
                    }
                } else {

                    this.view() || p.view() || p.view(this.view());
                    p.view() || this.view() || this.view(p.view());

                    p.error(function () {
                        setTimeout(function () { !$this.isDisposed && $this.reject(); }, 1);
                    }).success(function () {
                        setTimeout(function () { !$this.isDisposed && $this.decCount(); }, 1);
                    });
                }
                return this;
            },
            _count: 0,
            //计数加一
            addCount: function (n) {
                this._count += arguments.length == 0 ? 1 : n;
                return this;
            },
            //计数减一, 计数为0时, 解决所有
            decCount: function () {
                this._count--;
                this._checkResolve();
                return this;
            },
            _checkResolve: function () {
                if (this._count <= 0) { this.resolve(); }
            }
        });

    });

    var _syncAll = function (p, view) {
        if (!p) return null;
        var syncList = _ajaxSyncClass.getSyncList(view);
        var lastSync = _ajaxSyncClass.lastSync(view);
        var syncObj = _ajaxSyncClass.NewObject();

        lastSync && lastSync.dependent(syncObj);

        syncList.push(syncObj);
        syncObj.view(view).dependent(p);
        syncList.pop();

        return syncObj;
    };

})(bingo);
﻿
(function (bingo, $) {
    //version 1.1.0
    "use strict";

    bingo.extend({
        compile: function (view) {
            return _compileClass.NewObject().view(view);
        },
        tmpl: function (url, view) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="url"></param>
            /// <param name="view">可选</param>
            return _tmplClass.NewObject(url).view(view);
        },
        _startMvc: function () {

            //等待动态加载js完成后开始
            bingo.using(function () {
                var view = bingo.rootView(), node = view.$node();
                view.onReadyAll(function () {
                    bingo.__readyE.end();
                });
                bingo.compile(view).fromNode(node).compile();
            }, bingo.usingPriority.NormalAfter);
        },
        __readyE:bingo.Event(),
        ready: function (fn) {
            this.__readyE.on(fn);
        }
    });

    var _injectTmplWithDataIndex = bingo.compile.injectTmplWithDataIndex = function (html, index, pIndex) {
        /// <summary>
        /// 注入withDataList html
        /// </summary>
        return ['<!--bingo_cmpwith_', index, '-->', html, '<!--bingo_cmpwith_', pIndex, '-->'].join('');
    };

    bingo.compile.getNodeContentTmpl = function (jqSelector) {
        var $node = $(jqSelector), html = '';
        var jChild = $node.children();
        if (jChild.size() === 1 && jChild.is('script'))
            html = jChild.html();
        else
            html = $node.html();
        return html;
    };

    var _removeJo = null, _removeNode = bingo.compile.removeNode = function (jqSelector) {
        _removeJo.append(jqSelector);
        _removeJo.html('');
    };

    var _compiles = {
        compiledAttrName: ['_bg_cpl', bingo.makeAutoId()].join('_'),
        isCompileNode: function (node) {
            return node[this.compiledAttrName] == "1";
        },
        setCompileNode: function (node) {
            node[this.compiledAttrName] = "1";
        },
        _makeCommand: function (command, view, node, as) {
            
            var opt = command;

            if (!bingo.isNullEmpty(opt.tmplUrl)) {
                bingo.tmpl(opt.tmplUrl, view).cacheQurey(true).async(false).success(function (tmpl) { opt.tmpl = tmpl; }).get();
            }

            if (opt.compilePre)
                bingo.factory(opt.compilePre).view(view).node(node).inject();

            if (opt.as) {
                var alist = bingo.factory(opt.as).view(view).node(node).inject();
                if (alist && alist.length > 0)
                    as.list = (as.list || []).concat(alist);
            }

            return opt;
        },
        newTraverseParams: function () {
            //参数可以向下级传参数, 同级要备份
            return { node: null, parentViewnode: null, view: null, data: null, withData:null, action:null, withDataList:null };
        },
        //hasAttr: function (node, attrName) { return node.hasAttribute ? node.hasAttribute(attrName) : !bingo.isNullEmpty(node.getAttribute(attrName)); },
        traverseNodes: function (p) {
            /// <summary>
            /// 遍历node
            /// </summary>
            /// <param name="p" value='_compiles.newTraverseParams()'></param>
            
            //元素element 1
            //属性attr 2
            //文本text 3
            //注释comments 8
            //文档document 9

            var node = p.node;
            if (node.nodeType === 1) {

                if (!this.isCompileNode(node)) {
                    this.setCompileNode(node);

                    //解析节点， 如果不编译下级, 退出
                    if (!this.analyzeNode(node, p)) return;

                }
                var next = node.firstChild;
                if (next) {
                    var childNodes = [];
                    do {
                        childNodes.push(next);
                    } while (next = next.nextSibling);
                    this.traverseChildrenNodes(childNodes, p);
                }

            } else if (node.nodeType === 3) {

                if (!p.parentViewnode._isCompileText(node)) {
                    var _viewST = bingo.view;
                    p.parentViewnode._setCompileText(node);
                    
                    //收集textNode
                    var text = node.nodeValue;
                    if (_viewST.textTagClass.hasTag(text)) {
                        _viewST.textTagClass.NewObject(p.view, p.parentViewnode, node, node.nodeName, text, p.withData);
                    }
                }
            }
            node = p = null;
        },
        traverseChildrenNodes: function (nodes, p) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="nodes"></param>
            /// <param name="p" value="_compiles.newTraverseParams()"></param>
            /// <param name="withDataList"></param>

            var injectTmplWithList = [], commentList =[],
                withDataList = p.withDataList,
                withData = p.withData;

            var node, pBak = bingo.clone(p, false, true);
            var tmplIndex = -1;
            for (var i = 0, len = nodes.length; i < len; i++) {
                node = nodes[i];
                if (this.isComment(node)) {
                    //console.log('comment', node);
                    commentList.push(node);
                } else {
                    tmplIndex = withDataList ? this.getTmplWithdataIndex(node) : -1;
                    //tmplIndex > 0 && console.log('tmplIndex', tmplIndex);
                    if (tmplIndex == -1) {
                        //如果没有找到injectTmplWithDataIndex的index, 按正常处理
                        if (node.nodeType === 1 || node.nodeType === 3) {
                            p.node = node, p.withData = withData;
                            this.traverseNodes(p);
                            p = bingo.clone(pBak, false, true);
                        }
                    } else {
                        //如果找到injectTmplWithDataIndex的index, 取得index值为当前值, 添加injectTmplWithDataIndex节点到list
                        withData = p.withData = withDataList[tmplIndex];
                        //console.log('p.withData', tmplIndex, p.withData);
                        injectTmplWithList.push(node);
                    }
                }
            }

            //删除injectTmplWithDataIndex注释节点
            if (commentList.length > 0 || injectTmplWithList.length > 0) {
                _removeNode(commentList.concat(injectTmplWithList));
            }
        },
        commentTest: /^\s*#/,
        isComment: function (node) {
            return node.nodeType == 8 && this.commentTest.test(node.nodeValue)
        },
        //取得注入的withDataList的index
        getTmplWithdataIndex: function (node) {
            if (node.nodeType == 8) {
                var nodeValue = node.nodeValue;
                if (!bingo.isNullEmpty(nodeValue) && nodeValue.indexOf('bingo_cmpwith_') >= 0) {
                    var index = parseInt(nodeValue.replace('bingo_cmpwith_', ''), 10);
                    return (index < 0) ? -2 : index;//-2, 0及以上

                }
            }
            return -1;//-1没有找到
        },
        isTmplWithdataNode: function (node) {
            if (node.nodeType == 8) {
                var nodeValue = node.nodeValue;
                return (!bingo.isNullEmpty(nodeValue) && nodeValue.indexOf('bingo_cmpwith_') >= 0);
            }
            return false;
        },
        checkTmplWithdataNode: function (jo) {
            //return jo;
            var list = [], wList = [];
            jo.each(function () {
                if (_compiles.isTmplWithdataNode(this))
                    wList.push(this);
                else
                    list.push(this);
            });
            if (wList.length > 0) {
                _removeNode(wList);
            }
            return $(list);
        },
        analyzeNode: function (node, p) {
            /// <summary>
            /// 分析node
            /// </summary>
            /// <param name="node" value='document.body'></param>
            /// <param name="p" value='_compiles.newTraverseParams()'></param>
            var tagName = node.tagName, command = null;
            if (bingo.isNullEmpty(tagName)) return false;
            tagName = tagName.toLowerCase();

            var moduleI = p.view.$getModule();

            command = moduleI.command(tagName);
            var attrList = [], textTagList = [], compileChild = true;
            var tmpl = null, replace = false, include = false, isNewView = false;
            var isScriptNode = (tagName == 'script');
            if (isScriptNode) compileChild = false;

            var addAttr = function (attrList, command, attrName, attrVal, attrType) {
                replace = command.replace;
                include = command.include;
                tmpl = command.tmpl;
                isNewView || (isNewView = command.view);
                (!compileChild) || (compileChild = command.compileChild);
                attrList.push({ aName: attrName, aVal: attrVal, type: attrType, command: command });
            };

            var as = {}, attrTL = [], aVal = null, aName = null;

            if (command) {
                //node
                command = _compiles._makeCommand(command, p.view, node, as);
                addAttr(attrList, command, tagName, '', 'node');
            } else {
                //attr


                //在 IE 8 以及更早的版本中，attributes 属性会返回元素所有可能属性的集合。
                var attributes = node.attributes;
                if (attributes && attributes.length > 0) {

                    var aT = null, attrL;
                    do {
                        attrL = attributes.length;
                        for (var i = 0, len = attrL; i < len; i++) {
                            aT = attributes[i];
                            aName = aT && aT.nodeName;

                            if (bingo.inArray(aName, attrTL) < 0) {
                                attrTL.push(aName);

                                aVal = aT && aT.nodeValue;
                                //如果是script节点，将type内容识别模板指令
                                if (isScriptNode && aName == 'type') {
                                    aName = aVal;
                                }
                                command = moduleI.command(aName);
                                //if (aName.indexOf('frame')>=0) console.log(aName);
                                if (command) {
                                    command = _compiles._makeCommand(command, p.view, node, as);
                                    if (command.compilePre)
                                        aVal = aT && aT.nodeValue;//compilePre有可能重写attr

                                    addAttr(attrList, command, aName, aVal, 'attr');
                                    if (replace || include) break;
                                } else if (aVal) {
                                    //是否有text标签{{text}}
                                    if (bingo.view.textTagClass.hasTag(aVal)) {
                                        textTagList.push({ node: aT, aName: aName, aVal: aVal });
                                    }
                                }
                            }
                        }
                    } while (attrL != attributes.length);
                }

            }

            if (as.list) {
                bingo.each(as.list, function () {
                    var aName = this.name;
                    if (bingo.inArray(aName, attrTL) < 0) {
                        attrTL.push(aName);
                        command = moduleI.command(aName);
                        addAttr(attrList, command, aName, this.value, 'attr');
                        if (replace || include) return false;
                    }
                });
            }



            var viewnode = null,
                _viewST = bingo.view;
            if (attrList.length > 0) {

                //替换 或 include
                if (replace || include) {
                    var jNode = $(node);
                    //replace || include, 必须有tmpl
                    if (!bingo.isNullEmpty(tmpl)) {

                        //$.parseHTML解释所有类型html包括text node
                        var jNewNode = $($.parseHTML(tmpl));

                        //如果include 将本节插入到有bg-include属性(并属性值为空)的节点里
                        //如:<div bg-include></div>
                        if (include && tmpl.indexOf('bg-include') >= 0) {
                            //将现在的node include到每个bg-include节点处
                            jNewNode.find('[bg-include]').add(jNewNode.filter('[bg-include]')).each(function () {
                                var jo = $(this);
                                //bg-include, 如果空才执行, 如果不是空会解释bg-include command
                                if (bingo.isNullEmpty(jo.attr('bg-include'))) {
                                    //将node复制一份， 这里不复制事件和相关数据
                                    //认为是临时的, 还没有事件和其它数据
                                    var jT = jNode.clone(false);
                                    _compiles.setCompileNode(jT[0]);

                                    //删除bg-include, 防止死循环
                                    jo.removeAttr('bg-include');
                                    jo.append(jT);
                                }
                            });
                        }

                        var pView = p.view, pViewnode = p.parentViewnode,
                            //备份p数据
                            pBak = bingo.clone(p, false, true);

                        jNewNode.each(function () {
                            if (this.nodeType === 1) {
                                //_compiles.setCompileNode(this);
                                //新view
                                if (isNewView) {
                                    p.view = _viewST.viewClass.NewObject(this, pView);
                                    if (p.action) {
                                        p.view.$addAction(p.action);
                                        p.action = null;
                                    }
                                    //清空p.withData
                                    p.withData = null;
                                }
                                //本节点
                                viewnode = _viewST.viewnodeClass.NewObject(p.view, this, isNewView ? null : pViewnode, p.withData);
                                //设置父节点
                                p.parentViewnode = viewnode;
                                //连接node
                                //_compiles.setViewnode(this, viewnode);

                                //只要最后一个attr
                                var attr = attrList[attrList.length - 1];
                                _viewST.viewnodeAttrClass.NewObject(p.view, viewnode, attr.type, attr.aName, attr.aVal, attr.command);
                            }
                            if (compileChild) {
                                p.node = this;
                                _compiles.traverseNodes(p);
                            }
                            p = bingo.clone(pBak, false, true);
                        }).insertBefore(jNode);
                    }
                    //删除本节点
                    //jNode.remove();
                    _removeNode(jNode);

                    //不编译子级
                    compileChild = false;
                } else {

                    if (!bingo.isNullEmpty(tmpl))
                        $(node).html(tmpl);

                    //新view
                    if (isNewView) {
                        p.view = _viewST.viewClass.NewObject(node, p.view);
                        if (p.action) {
                            p.view.$addAction(p.action);
                            p.action = null;
                        }
                        //清空p.withData
                        p.withData = null;
                    }
                    //父节点
                    var parentViewnode = p.parentViewnode;
                    //本节点
                    viewnode = _viewST.viewnodeClass.NewObject(p.view, node, isNewView ? null : parentViewnode, p.withData);
                    //设置父节点
                    p.parentViewnode = viewnode;
                    //连接node
                    //this.setViewnode(node, viewnode);

                    //处理attrList
                    var attrItem = null;
                    bingo.each(attrList, function () {
                        attrItem = _viewST.viewnodeAttrClass.NewObject(p.view, viewnode, this.type, this.aName, this.aVal, this.command);
                    });
                }
            }

            if (!(replace || include) && textTagList.length > 0) {
                var textItem = null;
                bingo.each(textTagList, function () {
                    textItem = _viewST.textTagClass.NewObject(p.view, viewnode || p.parentViewnode, this.node, this.aName, this.aVal, null, node);
                });
            }
            

            return compileChild;
            //return attrList;
        }
    };

    var _tmplClass = bingo.compile.tmplClass = bingo.Class(bingo.ajax.ajaxClass, function () {


        var _base = bingo.ajax.ajaxClass.prototype;

        var _cache = {};

        this.Define({
            _initAjax: function () {
                if (this._init_tmpl_ === true) return;
                this._init_tmpl_ = true;
                var view = this.view();
                view && !view.isDisposed && view._addReadyDep();

                this.onDispose(function () {
                    view && !view.isDisposed && view._decReadyDep();
                })
                .dataType('text');

                if (bingo.compile.tmplCacheMetas.test(this.url())) {
                    this.cacheTo(this.cacheTo() || _cache)
                    .cacheMax(this.cacheMax() <= 0 ? 350 : this.cacheMax());
                }

                this._ajaxCache(bingo.supportWorkspace);
            },
            'get': function () {
                this._initAjax();
                _base['get'].call(this);
            },
            post: function () {
                this._initAjax();
                _base['post'].call(this);
            }
        });

        this.Initialization(function (url) {
            this.base(url);
        });
    });
    bingo.compile.tmplCacheMetas = /\.(htm|html|tmpl|txt)(\?.*)*$/i;

    //模板==负责编译======================
    var _compileClass = bingo.compile.templateClass = bingo.Class(function () {

        var _traverseChildrenNodes = function (nodes, parentViewnode, view, withDataList, action) {
            //编译一组nodes.
            _compiles.traverseChildrenNodes(nodes, { node: null, parentViewnode: parentViewnode, view: view, withData: null, action: action, withDataList: withDataList });
        };

        var _cache = {};
        this.Static({
            cacheMax:100
        });

        this.Prop({
            //给下一级新的View注入action
            action: null,
            async: true,
            fromUrl: '',
            //withData作用空间, 单个时用
            withData: null,
            //作用空间， 批量时用
            withDataList: null,
            //是否停止
            stop: false,
            view:null
        });

        this.Define({
            fromJquery: function (jqSelector) {
                this._jo = $(jqSelector); return this;
            },
            appendTo: function (jqSelector) { this._parentNode = $(jqSelector)[0]; return this; },
            fromNode: function (node) { return this.fromJquery(node); },
            fromHtml: function (html) { return this.fromJquery($.parseHTML(html, true)); },// this.fromJquery(html); },
            _isEnd: function () {
                return this.isDisposed
                    || this.stop()
                    || (this.view() && this.view().isDisposed);
            },
            //编译前执行， function
            onCompilePre: function (callback) {
                return this.on('compilePre', callback);
            },
            //编译前执行， function
            onCompiled: function (callback) {
                return this.on('compiled', callback);
            },
            _compile: function () {
                var jo = this._jo;
                var parentNode = this._parentNode || (jo && jo.parent()[0]);
                if (!parentNode) return;

                //如果没有传parentNode认为是已经在document树里
                var isInDoc = !this._parentNode;

                try {
                    this.trigger('compilePre', [jo]);

                    var view = this.view(),
                        parentViewnode = bingo.view.viewnodeClass.getViewnode(parentNode);

                    if (view) {
                        //检查parentViewnode, view不等于parentViewnode.view
                        //node上下关系并不与viewnode上下关系对应
                        if (parentViewnode.view() != view)
                            parentViewnode = view.$viewnode();

                    } else {
                        //检查view, 如果没有view, view取parentViewnode.view
                        view = bingo.view(parentNode) || parentViewnode.view();
                    }

                    //初始withData
                    var withData = this.withData();
                    var withDataList = this.withDataList();
                    var action = this.action();


                    //var timeId = bingo.makeAutoId();
                    //console.time(timeId);
                    _traverseChildrenNodes(jo, parentViewnode, view, withDataList, action);
                    //console.timeEnd(timeId);

                    ////删除TmplWithdataNode
                    //withDataList && withDataList.length > 0 && (jo = _compiles.checkTmplWithdataNode(jo));
                    //if (!isInDoc) {
                    //    jo.appendTo(parentNode);
                    //}

                    //删除TmplWithdataNode
                    withDataList && withDataList.length > 0 && (jo = _compiles.checkTmplWithdataNode(jo));
                    if (!isInDoc) {
                        jo.appendTo(parentNode);
                    }

                    //处理
                    view._handel();
                } catch (e) {
                    bingo.trace(e);
                }
                this.trigger('compiled', [jo]);
                this.dispose();
            },
            compile: function () {
                if (this._isEnd()) return this;

                if (this._jo) {

                    this._compile();

                } else if (this._parentNode && this.fromUrl()) {
                    //以url方式加载, 必须先指parentNode;
                    var $this = this;
                    var view = this.view();
                    //view && !view.isDisposed && view._addReadyDep();
                    bingo.tmpl(this.fromUrl(), view).success(function (html) {
                        if ($this._isEnd()) { return; }
                        $this.fromHtml(html).compile();
                    }).async(this.async()).onDispose(function () {
                        $this.dispose();
                        //view && !view.isDisposed && view._decReadyDep();
                    }).get();
                }
                return this;
            }
        });

    });

    //绑定内容解释器==========================
    var _bindClass = bingo.compile.bindClass = bingo.Class(function () {

        var _priS = {
            _cacheName: '__contextFun__',
            resetContextFun: function (attr) {
                attr[_priS._cacheName] = {};
            },
            evalScriptContextFun: function (attr, hasReturn, view, node, withData) {
                hasReturn = (hasReturn !== false);

                var cacheName = ['content', hasReturn].join('_');
                var contextCache = attr[_priS._cacheName];
                if (contextCache[cacheName]) return contextCache[cacheName];

                var attrValue = attr.$attrValue();
                try {
                    var retScript = [hasReturn ? 'return ' : '', attrValue, ';'].join('');
                    return contextCache[cacheName] = (new Function('$view', 'node', '$withData', 'bingo', [
                        'with ($view) {',
                            //如果有withData, 影响性能
                            withData ? 'with ($withData) {' : '',
                                //this为$node
                                'return bingo.proxy(node, function (event) {',
                                    //如果有返回值, 启动try..catch, 影响性能
                                    hasReturn ? [
                                    'try {',
                                        retScript,
                                    '} catch (e) {',
                                        'if (bingo.isDebug) bingo.trace(e);',
                                    '}'].join('') : retScript,
                                '});',
                            withData ? '}' : '',
                        '}'].join('')))(view, node, withData, bingo);//bingo(多版本共存)
                } catch (e) {
                    console.warn(['evalScriptContextFun: ', retScript].join(''));
                    bingo.trace(e);
                    return attr[cacheName] = function () { return attrValue; };
                }
            }
        };


        //viewnode, viewnodeAttr
        this.Prop({
            view: null,
            node: null,
            viewnode:null,
            //设置为字串： _filter('region.id | eq:1')
            //获取为$filter对象
            _filter: {
                $get: function () {
                    var value = this.value;
                    if (!bingo.isNullEmpty(value)) {
                        this.value = '';
                        var owner = this.owner;
                        this.filter = bingo.filter.createFilter(value,
                            owner.view(),
                            owner.node(),
                            owner.getWithData());
                    }
                    return this.filter;
                }
            },
            //属性原值
            $attrValue: {
                $get: function () {
                    var ft = this.owner._filter();
                    return ft ? ft.content : this.value;
                },
                $set: function (value) {
                    if (this.value != value) {
                        this.value = value;
                        var owner = this.owner;
                        owner._filter(value);
                        _priS.resetContextFun(owner);
                    }
                }
            }
        });

        this.Define({
            $eval: function (event) {
                /// <summary>
                /// 执行内容, 根据执行返回结果, 会报出错误
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var withData = this.getWithData();
                var fn = _priS.evalScriptContextFun(this, false, this.view(), this.node(), withData);
                return fn(event);
            },
            $resultsNoFilter: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误, 没有经过过滤器
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var withData = this.getWithData();
                var fn = _priS.evalScriptContextFun(this, true, this.view(), this.node(), withData);
                return fn(event);
            },
            $results: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误
                /// </summary>
                /// <param name="event">可选, 事件</param>
               
                var res = this.$resultsNoFilter(event);
                return this.$filter(res);
            },
            $getValNoFilter: function () {
                var name = this.$attrValue();
                var tname = name, tobj = this.getWithData();
                var val;
                if (tobj) {
                    val = bingo.datavalue(tobj, tname);
                }
                if (bingo.isUndefined(val)) {
                    tobj = this.view();
                    val = bingo.datavalue(tobj, tname);
                }
                if (bingo.isUndefined(val)) {
                    tobj = window;
                    val = bingo.datavalue(tobj, tname);
                }
                return val;
            },
            //返回withData/$view/window属性值
            $value: function (value) {
                var name = this.$attrValue();
                var tname = name, tobj = this.getWithData();
                var val;
                if (tobj) {
                    val = bingo.datavalue(tobj, tname);
                }
                if (bingo.isUndefined(val)) {
                    tobj = this.view();
                    val = bingo.datavalue(tobj, tname);
                }
                if (bingo.isUndefined(val)) {
                    tobj = window;
                    val = bingo.datavalue(tobj, tname);
                }

                if (arguments.length > 0) {
                    if (bingo.isVariable(val))
                        val(value);
                    else if (bingo.isUndefined(val))
                        bingo.datavalue(this.getWithData() || this.view(), tname, value);
                    else
                        bingo.datavalue(tobj, tname, value);
                    return this;
                } else {
                    return this.$filter(val);
                }

            },
            $filter: function (val) {
                var ft = this._filter();
                return ft ? ft.filter(val) : val;
            },
            getWithData: function () {
                /// <summary>
                /// withData只在编译时能设置, 之后不能变动<br />
                /// 只有一个withData, 如果要多层， 请用{item:{}, item2:{}}这种方式
                /// </summary>
                return this._withData;
            }
        });

        this.Initialization(function (view, node, content, withData) {
            /// <param name="view"></param>
            /// <param name="node"></param>
            /// <param name="content"></param>
            /// <param name="withData">可选</param>

            this._withData = withData;
            this.view(view).node(node);
            this.content = content;
            this.$attrValue(content);

        });
    });

    bingo.compile.bind = function (view, node, content, withData) {
        return _bindClass.NewObject(view, node, content, withData);
    };


    //node绑定内容解释器==========================
    var _nodeBindClass = bingo.compile.nodeBindClass = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Define({
            $getAttr: function (name) {
                if (!bingo.hasOwnProp(this._attrs, name)) {
                    var attrTemp = this.node().attributes[name];
                    attrTemp = attrTemp ? attrTemp.nodeValue : '';
                    this._attrs[name] = !bingo.isNullEmpty(attrTemp)
                        ? _bindClass.NewObject(this.view(), this.node(), attrTemp, this.withData())
                        : null;
                }
                return this._attrs[name];
            },
            $attrValue: function (name, p) {
                if (arguments.length == 1) {
                    var attr = this.node().attributes[name];
                    return attr ? this.$getAttr(name).$attrValue() : '';
                } else {
                    var attr = this.$getAttr(name);
                    attr && attr.$attrValue(p);
                    return this;
                }
            },
            //执行内容, 不会报出错误
            $eval: function (name, event) {
                var attr = this.$getAttr(name);
                return attr && attr.$eval(event);
            },
            //执行内容, 并返回结果, 不会报出错误
            $results: function (name, event) {
                var attr = this.$getAttr(name);
                return attr && attr.$results(event);
            },
            //返回withData/$view/window属性值
            $value: function (name, value) {
                var attr = this.$getAttr(name);
                if (!attr) return;
                if (arguments.length == 1)
                    return attr.$value();
                else {
                    attr.$value(value);
                    return this;
                }
            }
        });

        this.Prop({
            view: null,
            node: null,
            withData:null
        });

        this.Initialization(function (view, node, withData) {
            /// <param name="view"></param>
            /// <param name="node"></param>
            /// <param name="withData可选</param>
            this.base();
            this.withData(withData).view(view).node(node);
            this.linkToDom(node);

            this._attrs = {};
            this.onDispose(function () {
                var attrs = this._attrs;
                bingo.eachProp(attrs, function (item, n) {
                    item.dispose && item.dispose();
                });
            });
        });
    });

    bingo.compile.bindNode = function (view, node, withData) {
        return _nodeBindClass.NewObject(view, node, withData);
    };

    //启动
    $(function () {
        _removeJo = $('<div></div>');
        bingo._startMvc();
    });
})(bingo, window.jQuery);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    bingo.view = function (jqSelector) {
        /// <summary>
        /// 获取view
        /// </summary>
        /// <param name="jqSelector"></param>
        var jo = $(jqSelector);
        if (jo.size() == 0)
            return null;
        else {
            var viewnode = _viewnodeClass.getViewnode(jo[0]);
            return viewnode ? viewnode.view() : null;
        }
    };

    var _rootView = null;
    bingo.rootView = function () { return _rootView; };

    //view==提供视图==================
    var _viewClass = bingo.view.viewClass = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Define({
            _setParent: function (view) {
                if (view) {
                    this.$parentView(view);
                    view._addChild(this);
                }
            },
            _addChild: function (view) {
                this.$children.push(view);
            },
            _removeChild: function (view) {
                var list = this.$children;
                list = bingo.removeArrayItem(view, list);
                this.$children = list;
            },
            _compile: function () {
                var viewnode = this.$viewnode();
                if (!viewnode.isDisposed)
                    viewnode._compile();
            },
            _action: function () {
                var $this = this;
                if (this._actions.length > 0) {
                    this.end('_actionBefore_');
                    var actionList = this._actions;
                    this._actions = [];

                    bingo.each(actionList, function () {
                        bingo.factory(this).view($this).inject();
                    });
                }

                var viewnode = this.$viewnode();
                if (!viewnode.isDisposed)
                    viewnode._action();

               
                if (!this.isDisposed && this._isReadyDec_ !== true) {
                    this._isReadyDec_ = true;
                    setTimeout(function () { $this._decReadyDep(); }, 10);
                }

            },
            _link: function () {
                var viewnode = this.$viewnode();
                if (!viewnode.isDisposed)
                    viewnode._link();
            },
            _handel: function () {

                this._action();//根据action做初始
                this._compile();//编译指令
                this._link();//连接指令

                this._handleChild();//处理子级
            },
            _handleChild: function () {
                bingo.each(this.$children, function () {
                    if (!this.isDisposed) {
                        this._handel();
                    }
                });
            },
            $isReady: false,
            _sendReady: function () {
                this._sendReady = bingo.noop;
                var $this = this;
                bingo.ajaxSyncAll(function () {

                    $this.end('_initdatasrv_');

                }, this).alway(function () {
                    bingo.ajaxSyncAll(function () {
                        $this.end('_initdata_');
                    }, $this).alway(function () {
                        //所有$axaj加载成功
                        $this.end('_ready_');
                        $this.$isReady = true;
                        $this._decReadyParentDep();
                        $this.$update();
                    });
                });

            },
            onActionBefore: function (callback) {
                return this.on('_actionBefore_', callback);
            },
            onInitDataSrv: function (callback) {
                return this.on('_initdatasrv_', callback);
            },
            onInitData: function (callback) {
                return this.on('_initdata_', callback);
            },
            onReady: function (callback) {
                return this.on('_ready_', callback);
            },
            //处理readyAll
            onReadyAll: function (callback) {
                return this.on('_readyAll_', callback);
            },
            _addReadyDep: function () {
                var readySync = this.__readySync;
                if (!readySync) {
                    readySync = this.__readySync = bingo.ajaxSync(this).success(bingo.proxy(this, function () {
                        if (this.isDisposed) return;
                        this._sendReady();
                    }));
                }
                !readySync.isDisposed && readySync.addCount();
                return this;
            },
            _decReadyDep: function () {
                var readySync = this.__readySync;
                readySync && !readySync.isDisposed && readySync.decCount();
                return this;
            },
            _addReadyParentDep: function () {
                var sync = this.__readyParentSync;
                if (!sync) {
                    sync = this.__readyParentSync = bingo.ajaxSync(this).success(bingo.proxy(this, function () {
                        if (this.isDisposed) return;
                        this.end('_readyAll_');
                        var parentView = this.$parentView();
                        parentView && parentView.disposeStatus == 0 && parentView._decReadyParentDep();
                    }));
                }
                !sync.isDisposed && sync.addCount();
                return this;
            },
            _decReadyParentDep: function () {
                var sync = this.__readyParentSync;
                sync && !sync.isDisposed && sync.decCount();
                return this;
            },
            //end--处理readyAll

            //设置module_app
            $setModule: function (module) {
                module && (this._module = module);
                return this;
            },
            $getModule: function () {
                return this._module || bingo.defaultModule(this.$getApp());
            },
            $setApp: function (app) {
                app && (this._app = app);
                return this;
            },
            $getApp: function () {
                return this._app || (this._module ? this._module.app : bingo.defaultApp());
            },
            $addAction: function (action) {
                action && this._actions.push(action);
                return this;
            },
            $getViewnode: function (node) {
                //node可选, 要原型node
                return _viewnodeClass.getViewnode(node || this.$node());
            },
            $getNode: function (jqSelector) {
                var jo = this.__$node || (this.__$node = $(this.$node()));
                return jqSelector ?  jo.find(jqSelector) : jo;
            },
            $update: function () { return this.$publish(); },
            $updateAsync: function () {
                if (this.$isReady === true) {
                    this.$observer().publishAsync();
                }
                return this;
            },
            $apply: function (callback, thisArg) {
                if (callback) {
                    this.$update();
                    callback.apply(thisArg || this);
                    this.$updateAsync();
                }
                return this;
            },
            $proxy: function (callback, thisArg) {
                var $view = this;
                return function () {
                    $view.$update();
                    callback.apply(thisArg || this, arguments);
                    $view.$updateAsync();
                };
            },
            $publish: function () {
                if (this.$isReady) {
                    this.$observer().publish();
                }
                return this;
            },
            $observer: function () {
                return bingo.observer(this);
            },
            $subscribe: function (p, callback, deep, disposer, priority) {
                return this.$observer().subscribe(p, callback, deep, disposer, priority);
            },
            $subs: function (p, callback, deep, disposer, priority) {
                return this.$subscribe.apply(this, arguments);
            },
            $using: function (js, callback) {
                this._addReadyDep();
                var $this = this;
                bingo.using(js, function () {
                    if ($this.isDisposed) return;
                    callback && callback();
                    $this._decReadyDep();
                }, bingo.usingPriority.NormalAfter);
                return this;
            },
            $timeout: function (callback, time) {
                this._addReadyDep();
                var $this = this;
                return setTimeout(function () {
                    if (!$this.isDisposed) {
                        callback && callback();
                        $this.$updateAsync()._decReadyDep();
                    }
                }, time || 1);
            }
        });

        this.Prop({
            $parentView: null,
            //view必须只对应一个node
            $node: null,
            //只有一个viewnode
            $viewnode:null
        });

        this.Initialization(function (node, parentView) {
            this.base();
            this.linkToDom(node);

            bingo.extend(this, {
                $children: [],
                _module: null,
                _app:null,
                _actions: []
            });

            this.$node(node);
            if (parentView) {
                this._setParent(parentView);
                parentView._addReadyParentDep();
            }

            this._addReadyDep();
            this._addReadyParentDep();

            this.onDispose(function () {
                //console.log('dispose view');

                //处理父子
                var parentView = this.$parentView();
                if (parentView && parentView.disposeStatus == 0)
                    parentView._removeChild(this);

                //不是从dom删除
                if (!this.isDisposeFormDom) {
                    if (!this.$viewnode().isDisposed)
                        this.$viewnode().dispose();

                    bingo.each(this.$children, function (item) {
                        if (item) item.dispose();
                    });
                }

            });

        });
    });

    //viewnode==管理与node节点连接====================
    var _viewnodeClass = bingo.view.viewnodeClass = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Static({
            vnName: ['bg_cpl_node', bingo.makeAutoId()].join('_'),
            vnDataName: ['bg_domnode', bingo.makeAutoId()].join('_'),
            //向node及node的父层搜索viewnode, node必须原生node
            getViewnode: function (node) {
                if (node) {
                    if (this.isViewnode(node))
                        return $(node).data(this.vnDataName);
                    return this.getViewnode(node.parentNode || document.documentElement);
                } else {
                    return null;
                }
            },
            setViewnode: function (node, viewnode) {
                node[this.vnName] = "1";
                $(node).data(this.vnDataName, viewnode);
            },
            removeViewnode: function (viewnode) {
                var node = viewnode.node;
                node[this.vnName] == "0";
                $(node).removeData(this.vnDataName);
            },
            isViewnode: function (node) {
                return node[this.vnName] == "1";
            }
        });

        this.Define({
            _setParent: function (viewnode) {
                if (viewnode) {
                    this.parentViewnode(viewnode);
                    viewnode._addChild(this);
                } else {
                    //如果没有父节点时, 添加到view
                    this.view().$viewnode(this);
                }
            },
            _addChild: function (viewnode) {
                this.children.push(viewnode);
            },
            _removeChild: function (viewnode) {
                var list = this.children;
                list = bingo.removeArrayItem(viewnode, list);
                this.children = list;
            },
            _sortAttrs: function () {
                if (this.attrList.length > 1) {
                    // 根据优先级(priority)排序， 越大越前,
                    this.attrList = bingo.linq(this.attrList).sortDesc('_priority').toArray();
                }
            },
            _compile: function () {
                if (!this._isCompiled) {
                    this._isCompiled = true;
                    this._sortAttrs();

                    bingo.each(this.attrList, function () {
                        if (!this.isDisposed) {
                            this._compile();
                        }
                    });
                }
                bingo.each(this.children, function () {
                    if (!this.isDisposed) {
                        this._compile();
                    }
                });
                this._resetCmpText();
            },
            _action: function () {
                if (!this._isAction) {
                    this._isAction = true;
                    bingo.each(this.attrList, function () {
                        if (!this.isDisposed) {
                            this._action();
                        }
                    });
                }
                bingo.each(this.children, function () {
                    if (!this.isDisposed) {
                        this._action();
                    }
                });
            },
            _link: function () {
                if (!this._isLinked) {
                    this._isLinked = true;
                    bingo.each(this.attrList, function () {
                        if (!this.isDisposed) {
                            this._link();
                        }
                    });
                }
                bingo.each(this.textList, function () {
                    if (!this.isDisposed) {
                        this._link();
                    }
                });
                bingo.each(this.children, function () {
                    if (!this.isDisposed) {
                        this._link();
                    }
                });
            },
            $getAttr: function (name) {
                name = name.toLowerCase();
                var item = null;
                bingo.each(this.attrList, function () {
                    if (this.attrName == name) { item = this; return false; }
                });
                return item;
            },
            $html: function (html) {
                var node = this.node();
                if (arguments.length > 0) {
                    $(node).html('');
                    bingo.compile(this.view()).fromHtml(html).appendTo(node).compile();
                    return this;
                } else
                    return $(node).html();
            },
            getWithData: function () {
                /// <summary>
                /// withData只在编译时能设置, 之后不能变动
                /// </summary>
                return this._withData;
            },
            _isCompileText: function (node) {
                return node ? bingo.inArray(node, this._textNodes) >= 0 : false;
            },
            _setCompileText: function (node) {
                this._textNodes.push(node);
            },
            _rmCompileText: function (node) {
                this._textNodes = bingo.removeArrayItem(node, this._textNodes);
            },
            _resetCmpText: function () {
                this._textNodes = bingo.linq(this._textNodes)
                    .where(function () { return !_isRmTxNode(this); }).toArray();

                var rootviewnode = bingo.rootView().$viewnode();
                this != rootviewnode && rootviewnode._resetCmpText();
            }
        });

        this.Prop({
            view: null,
            node: null,
            parentViewnode: null
        });

        this.Initialization(function (view, node, parentViewnode, withData) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="view">_viewClass</param>
            /// <param name="node">dom element</param>
            /// <param name="parentViewnode">父节点_viewnodeClass</param>
            /// <param name="withData">withData</param>
            this.base();
            this.linkToDom(node);
            //连接node
            _viewnodeClass.setViewnode(node, this);

            bingo.extend(this, {
                attrList: [],//command属性
                textList: [],
                children: [],
                _isCompiled: false,
                _isLinked: false,
                _isAction: false,
                _textNodes:[]
            });

            this._withData = withData || (parentViewnode && parentViewnode.getWithData());

            this.view(view).node(node)._setParent(parentViewnode);

            this.onDispose(function () {

                //不是从dom删除
                if (!this.isDisposeFormDom) {
                    _viewnodeClass.removeViewnode(this);

                    bingo.each(this.children, function (item) {
                        if (item) item.dispose();
                    });
                }

                //释放attrLst
                bingo.each(this.attrList, function (item) {
                    if (item) item.dispose();
                });

                //释放textList
                bingo.each(this.textList, function (item) {
                    if (item) item.dispose();
                });

                //处理父子
                var parentViewnode = this.parentViewnode();
                if (parentViewnode) {
                    (parentViewnode.disposeStatus == 0) && parentViewnode._removeChild(this);
                }

                this.attrList = this.children = this.textList = this._textNodes = [];
                //console.log('dispose viewnode');
            });

        });
    });

    //viewnode attr====管理与指令连接================
    var _viewnodeAttrClass = bingo.view.viewnodeAttrClass = bingo.Class(bingo.compile.bindClass, function () {

        this.Define({
            _priority: 50,
            _compile: function () {
                var command = this.command;
                var compile = command.compile;
                if (compile) {
                    bingo.factory(compile).viewnodeAttr(this).widthData(this.getWithData()).inject();
                }
            },
            _action: function () {
                var command = this.command;
                var action = command.action;
                if (action) {
                    bingo.factory(action).viewnodeAttr(this).widthData(this.getWithData()).inject();
                }
            },
            _link: function () {
                var command = this.command;
                var link = command.link;
                if (link) {
                    bingo.factory(link).viewnodeAttr(this).widthData(this.getWithData()).inject();
                }
                this._init();
            },
            onChange: function (callback) { return this.on('onChange', callback); },
            onInit: function (callback) { return this.on('onInit', callback); },
            $subs: function (p, p1, deep) {
                if (arguments.length == 1) {
                    p1 = p;
                    var $this = this;
                    p = function () { return $this.$results(); };
                }
                var fn = p1;
                var $this = this;
                p1 = function (val) { var r = fn.apply(this, arguments); $this.trigger('onChange', [val]); return r; };
                this.view().$subs(p, p1, deep, this, 100);
                return this;
            },
            $subsResults: function (p, deep) {
                var isV = false;
                return this.$subs(bingo.proxy(this, function () {
                    var res = this.$resultsNoFilter();
                    isV = bingo.isVariable(res);
                    return isV ? res : this.$filter(res);
                }), bingo.proxy(this,function (value) {
                    p && (p.call(this, isV ? this.$filter(value) : value));
                }), deep);
            },
            $subsValue: function (p, deep) {
                var isV = false;
                return this.$subs(bingo.proxy(this, function () {
                    var res = this.$getValNoFilter();
                    isV = bingo.isVariable(res);
                    return isV ? res : this.$filter(res);
                }), bingo.proxy(this, function (value) {
                    p && (p.call(this, isV ? this.$filter(value) : value));
                }), deep);
            },
            _init: function () {
                this.__isinit = true;
                var para = this.__initParam;
                if (para) {
                    var p = para.p, p1 = para.p1;
                    this.__initParam = null;
                    var val = bingo.isFunction(p) ? p.call(this) : p;
                    val = bingo.variableOf(val);
                    p1.call(this, val);
                    this.trigger('onInit', [val]);
                }
            },
            $init: function (p, p1) {
                if (arguments.length == 1) {
                    p1 = p;
                    var $this = this;
                    p = function () { return $this.$attrValue(); };
                }
                this.__initParam = { p: p, p1: p1 };
                if (this.__isinit)
                    this._init();
                return this;
            },
            $initResults: function (p) {
                return this.$init(bingo.proxy(this, function () {
                    return this.$results();
                }), p);
            },
            $initValue: function (p) {
                return this.$init(bingo.proxy(this, function () {
                    return this.$value();
                }), p);
            }
        });

        this.Initialization(function (view, viewnode, type, attrName, attrValue, command) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="viewnode">属性名称</param>
            /// <param name="attrName">属性名称</param>
            /// <param name="attrValue">属性名称</param>
            /// <param name="command">指令定义</param>

            //认为viewnode widthData只在编译时设置
            this.base(view, viewnode.node(), attrValue, viewnode.getWithData());

            this.viewnode(viewnode);
            viewnode.attrList.push(this);

            this.type = type;
            this.attrName = attrName.toLowerCase();

            this.command = command;
            this._priority = command.priority || 50;

        });
    });

    var _isRmTxNode = function (node) {
        try {
            return !node || !node.parentNode
                        || !node.parentNode.parentNode
                        || !node.parentNode.parentElement;
        } catch (e) { return true; }
    };
    //标签==========================
    var _textTagClass = bingo.view.textTagClass = bingo.Class(function () {

        this.Static({
            _regex: /\{\{(.+?)\}\}/gi,
            _regexRead: /^\s*:\s*/,
            hasTag: function (text) {
                this._regex.lastIndex = 0;
                return this._regex.test(text);
            }
        });

        this.Define({
            _link: function () {
                if (!this._isLinked) {
                    this._isLinked = true;

                    var nodeValue = this.attrValue;
                    var tagList = [],
                        $this = this,
                        node = this.node(),
                        nodeType = node.nodeType,
                        attrName = this.attrName,
                        view = this.view(),
                        parentNode = this.parentNode(),
                        hasSub = false;//是否要绑定(不只读)


                    var _nodes = null, _serValue = function (value) {
                        //node.nodeValue = value;
                        //return;
                        if (nodeType != 3) {
                            node.nodeValue = value;
                            //parentNode.setAttribute(attrName, value);
                        } else {
                            _removeValue();
                            _nodes = $.parseHTML(value);
                            $(_nodes).insertAfter(node);
                        }
                    }, _removeValue = function () {
                        if (_nodes) {
                            bingo.compile.removeNode(_nodes);
                        }
                        _nodes = null;
                    };

                    //解释内容, afasdf{{test | val:'sdf'}}
                    var s = nodeValue.replace(_textTagClass._regex, function (findText, textTagContain, findPos, allText) {
                        var item = {};

                        if (_textTagClass._regexRead.test(textTagContain)) {
                            textTagContain = textTagContain.replace(_textTagClass._regexRead, '');
                        } else
                            hasSub = true;

                        var context = bingo.compile.bind(view, node,
                            textTagContain, $this.getWithData());

                        item.text = findText, item.context = context;
                        tagList.push(item);

                        var value = context.$results();
                        return item.value = bingo.toStr(bingo.variableOf(value));
                    });
                    _serValue(s); s = '';

                    if (hasSub) {
                        //console.log('tagList', tagList);
                        bingo.each(tagList, function (item) {
                            var context = item.context, text = item.text;

                            //检查是否删除
                            view.$subs(function () { return $this._isRemvoe() ? bingo.makeAutoId() : context.$results(); }, function (newValue) {
                                if ($this._isRemvoe()) {
                                    $this.dispose();
                                    return;
                                }
                                item.value = bingo.toStr(newValue);
                                changeValue();
                            }, false, $this, 100);
                        });
                        var changeValue = function () {
                            var allValue = nodeValue;
                            bingo.each(tagList, function (item) {
                                var text = item.text;
                                var value = item.value;
                                allValue = allValue.replace(text, value);
                            });
                            //node.nodeValue = allValue;
                            _serValue(allValue);
                        };
                    }

                    var _dispose = function () {
                        _removeValue();
                        bingo.each(tagList, function (item) {
                            item.context && item.context.dispose();
                        });
                        tagList = null;
                    };

                    this.onDispose(function () {
                        //console.log('onDispose=====', attrName);
                        $this = _nodes = node = view = parentNode = null;
                        _dispose();
                    });

                    if (!hasSub) setTimeout(bingo.proxy(this, function () { this.dispose();}), 1);
                }
            },
            _isRemvoe: function () {
                var node = this.node && this.node();
                return  this.isDisposed || _isRmTxNode(this.parentNode() || node);
            },
            getWithData: function () {
                return this._withData;
            }
        });

        this.Prop({
            view: null,
            node: null,//为text node
            parentNode:null,//所有的节点， 属性节点时用, text节点时为空
            viewnode:null
        });

        this.Initialization(function (view, viewnode, node, attrName, attrValue, withData, parentNode) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="viewnode">属性名称</param>
            /// <param name="attrName">属性名称</param>
            /// <param name="attrValue">属性名称</param>
            /// <param name="command">指令定义</param>
            //console.log('textTag', node.nodeType);

            this._withData = withData || viewnode.getWithData();

            this.view(view).viewnode(viewnode).node(node).parentNode(parentNode);

            viewnode.textList.push(this);

            this.attrName = attrName && attrName.toLowerCase();
            this.attrValue = attrValue;
            node.nodeValue = '';
            //console.log('attrValue', attrValue);

            this.onDispose(function () {
                //var viewnode = this.viewnode();
                //console.log('dispose textTaag', viewnode.disposeStatus, viewnode.isDisposed);

                //处理text node
                if (this.node().nodeType == 3) {
                    var viewnode = this.viewnode();
                    if (viewnode && viewnode.disposeStatus == 0) {
                        viewnode.textList = bingo.removeArrayItem(this, viewnode.textList);
                        viewnode._rmCompileText(this.node());
                    }
                }
            });
        });
    });


    (function () {
        var node = document.documentElement,
        _viewST = bingo.view;

        _rootView = _viewST.viewClass.NewObject(node);

        _viewST.viewnodeClass.NewObject(_rootView, node, null, null);
    })();

})(bingo);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    //var _filter = {};
    //bingo.filter = function (name, fn) {
    //    if (this.isNullEmpty(name)) return null;
    //    if (arguments.length == 1)
    //        return _filter[name];
    //    else
    //        _filter[name] = fn;
    //};

    bingo.filter.createFilter = function (content, view, node, withData) {
        /// <summary>
        /// 创建Filter
        /// </summary>
        /// <param name="content">filter内容, 如: "reiongId | eq:'dev' | len"</param>
        /// <param name="view">可选, 需注入时用</param>
        /// <param name="node">可选, 原生node, 需注入时用</param>
        /// <param name="withData">可选, withData</param>
        return _filter.createFilter(content, view, node, withData);
    };

    bingo.filter.regex = /[|]+[ ]?([^|]+)/g;

    var _filter = {
        hasFilter: function (s) {
            bingo.filter.regex.lastIndex = 0;
            return bingo.filter.regex.test(s);
        },
        //将filte内容删除
        removerFilterString: function (s) {
            if (bingo.isNullEmpty(s) || !this.hasFilter(s)) return s;
            bingo.filter.regex.lastIndex = 0;
            var str = s.replace(bingo.filter.regex, function (find, content) { if (find.indexOf('||') == 0) return find; else return ''; });
            return bingo.trim(str);
        },
        getFilterStringList: function (s) {
            if (bingo.isNullEmpty(s) || !this.hasFilter(s)) return [];
            var filterList = [];
            bingo.filter.regex.lastIndex = 0;
            s.replace(bingo.filter.regex, function (find, content) {
                if (find.indexOf('||') != 0) filterList.push(content);
            });
            return filterList;
        },
        //取得filter参数, 'date:"yyyyMMdd"' 或 filter:{p1:1, p2:'aaa'}
        getScriptContextFun: function (obj, attrValue, view, node, withData) {
            var ca = obj._ca || (obj._ca = {});
            var cn = 'cont';
            if (ca[cn]) return ca[cn];

            var attT = ['{', attrValue, '}'].join('');
            var retScript = ['return ', attT, ';'].join('');

            try {
                return ca[cn] = (new Function('$view', '$node', '$withData', 'bingo', [
                    'with ($view) {',
                        //如果有withData, 影响性能
                        withData ? 'with ($withData) {' : '',
                            //this为$data
                            'return function ($data) {',
                                'try {',
                                    retScript,
                                '} catch (e) {',
                                    'if (bingo.isDebug) bingo.trace(e);',
                                '}',
                            '};',
                        withData ? '}' : '',
                    '}'].join('')))(view, node, withData, bingo);//bingo(多版本共存)
            } catch (e) {
                bingo.trace(e);
                return ca[cn] = function () { return attrValue; };
            }

        },
        //是否有参数
        hasFilterParam: function (s) { return (s.indexOf(':') >= 0); },
        //如果有参数, 取得参数名称
        getFilterParamName: function (s) {
            var sL = s.split(':');
            return bingo.trim(sL[0]);
        },
        //根据view取得filter器
        getFilterByView: function (view, name) {
            var filter = view ? view.$getModule(name).filter(name) : bingo.filter(name);
            return filter;
        },
        paramFn: function (obj, item, view, node, withData) {
            return _filter.getScriptContextFun(obj, item, view, node, withData);
            //return function (withData) {
            //    return _filter.getScriptContextFun(this, item, withData.length);
            //};
        },
        //生成filter对象
        getFilterObjList: function (view, node, s, withData) {
            var sList = this.getFilterStringList(s);
            if (sList.length == 0) return [];
            var list = [];
            bingo.each(sList, function (item) {
                item = bingo.trim(item);
                if (bingo.isNullEmpty(item)) return;
                var obj = {
                    name: null, paramFn: null, fitlerFn: null
                };
                var ftO = null;
                if (_filter.hasFilterParam(item)) {
                    obj.name = _filter.getFilterParamName(item);
                    ftO = _filter.getFilterByView(view, obj.name);
                    if (!ftO) return;
                    ftO = view ? bingo.factory(ftO).view(view).node(node).inject() : ftO();
                    //view && (ftO = bingo.factory(ftO).view(view).node(node).inject());
                    obj.paramFn = _filter.paramFn(obj, item, view, node, withData);
                } else {
                    obj.name = item;
                    ftO = _filter.getFilterByView(view, obj.name);
                    if (!ftO) return;
                    //view && (ftO = bingo.factory(ftO).view(view).node(node).inject());
                    ftO = view ? bingo.factory(ftO).view(view).node(node).inject() : ftO();
                }
                obj.fitlerFn = ftO;
                obj.fitlerVal = function (val) {
                    if (!this.fitlerFn) return val;
                    var para = null;
                    if (this.paramFn) {
                        para = this.paramFn(val);
                        para && (para = para[this.name]);
                    }
                    return this.fitlerFn(val, para);
                };
                list.push(obj);
            });
            return list;
        },
        createFilter: function (content, view, node, withData) {
            var filter = { contentOrg: content };
            var hasFilter = _filter.hasFilter(content);
            filter._filters = hasFilter ? _filter.getFilterObjList(view, node, content, withData) : [];
            filter.content = _filter.removerFilterString(content);
            filter.contentFT = content.replace(filter.content, '');
            //console.log('contentFT', filter.contentFT, filter);
            if (filter._filters.length > 0) {
                filter.filter = function (value) {
                    /// <summary>
                    /// 
                    /// </summary>
                    /// <param name="value"></param>
                    var res = bingo.variableOf(value);
                    bingo.each(this._filters, function () {
                        res = this.fitlerVal(res);
                    });
                    return res;
                };
            } else {
                filter.filter = function (value) { return value; };
            }
            return filter;
        }
    };

})(bingo);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    bingo.render = function (tmpl, view, node, tmplObj) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="tmpl">render 模板</param>
        /// <param name="view">可选, 需注入时用</param>
        /// <param name="node">可选, 原生node, 需注入时用</param>
        bingo.render.regex.lastIndex = 0;
        _commentRegx.lastIndex = 0;
        tmpl = tmpl.replace(_commentRegx, '');

        if (tmpl.indexOf('#') == 0 && tmpl.indexOf('{') < 0) {
            if (view.__render_tmpls__$) {
                tmpl = view.__render_tmpls__$[tmpl];
            }
            if (tmpl.indexOf('#') == 0 && tmpl.indexOf('{') < 0)
                tmpl = $(tmpl).html();
        }
        var compileData = null;
        if (!bingo.isNullEmpty(tmpl)) {

            compileData = bingo.render.regex.test(tmpl) ? _compile(tmpl, view, node) : null;

            if (compileData) {

                //tmplObj为转入tmpl == > {'#001':'{{: item.count}}'}

                compileData = _makeForCompile(compileData);
                var allTmpls = null;
                if (view && !view.isDisposed) {
                    allTmpls = (view.__render_tmpls__$ || (view.__render_tmpls__$ = {}));
                    compileData.tmpls && bingo.extend(allTmpls, compileData.tmpls);
                } else
                    allTmpls = (compileData.tmpls || {});

                tmplObj && (allTmpls != tmplObj) && bingo.extend(allTmpls, tmplObj);
                compileData.tmpls = allTmpls;


                if (view && compileData.tmpls) {
                    view.__render_tmpls__$ = bingo.extend({}, view.__render_tmpls__$, compileData.tmpls);
                }

            }
        }

        //console.log('compileData', compileData);
        return {
            //renderItem: function (data, itemName, itemIndex, count, parentData, parentWithIndex, outWithDataList) {
            //    /// <summary>
            //    /// 
            //    /// </summary>
            //    /// <param name="data">数据项</param>
            //    /// <param name="itemName">item名称</param>
            //    /// <param name="itemIndex">item index</param>
            //    /// <param name="count">数据数组数量</param>
            //    /// <param name="parentData">可选, 上级数据</param>
            //    /// <param name="parentWithIndex">可选, 上级withindex, 如果没有应该为 -1</param>
            //    /// <param name="outWithDataList">可选, 数组， 收集withDataList</param>
            //    if (!compileList) return tmpl;
            //    return _renderItem(compileList, view, node, data, itemName, itemIndex, count, parentData, parentWithIndex, outWithDataList);
            //},
            render: function (list, itemName, parentData, parentWithIndex, outWithDataList, formatter) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="list">数据源</param>
                /// <param name="itemName">可选, item名称</param>
                /// <param name="parentData">可选, 上级数据</param>
                /// <param name="parentWithIndex">可选, 上级withindex, 如果没有应该为 -1</param>
                /// <param name="outWithDataList">可选, 数组， 收集withDataList</param>
                /// <param name="formatter" type="function(s, role, item)">可选, 格式化</param>
                if (!compileData) return tmpl;
                return _render(compileData, view, node, list, itemName, parentData, parentWithIndex, outWithDataList, formatter);
            }
        };
    };

    bingo.render.regex = /\{\{\s*(\/?)(\:|if|else|for|tmpl|header|footer|empty|loading)(.*?)\}\}/g;   //如果要扩展标签, 请在(if )里扩展如(if |for ), 保留以后扩展


    /*
        支持js语句, 如: {{: item.name}} {{document.body.childNodes[0].nodeName}}
        支持if语句, 如: {{if item.isLogin} 已登录 {{else}} 未登录 {{/if}}
        支持for, 如: {{for item in list tmpl=#idAAA}} {{: item_index}}| {{: item.id}}|{{: item_count}}|{{: item_first}}|{{: item_last}} {{/for}}
        支持tmpl(注释)语句, 如 {{tmpl}} {{: item.text}} {{tmpl}}
        支持过滤器, 如: {{: item.name | text}}, 请参考过滤器
    */

    var _renderForeachRegx = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)[/]|(.+))*/g;//for 内容分析
    var _endForRegx = /\/\s*$/; //是否单行for, {{for item in list tmpl=$aaaa /}}
    var _commentRegx = /<!--\s*\#(?:.|\n)*?-->/g;//去除注释<!--# asdfasdf-->
    var _newItem = function (content, isIf, isEnd, isTag, view, node, isElse, isForeach, role) {
        var item = {
            isIf: isIf === true,
            ifReturn: true,
            isElse: isElse === true,
            isForeach: isForeach === true,
            isEnd: isEnd === true,
            isTag: isTag === true,
            role: bingo.isUndefined(role) ? 0 : role, //header:1|footer:2|empty:3|loading:4
            content: content,
            forParam: null,
            filterContext: null,
            fn: bingo.noop,
            flt: null,
            children: [],
            //用于存放{{tmpl #001}}的#001值
            tmplId:''
        };
        if (item.isTag) {
            if (!item.isEnd) {
                item.filterContext = content;


                if (item.isForeach) {
                    var code = item.content;
                    _renderForeachRegx.lastIndex = 0;
                    code.replace(_renderForeachRegx, function () {
                        //console.log('code', arguments);
                        var params = item.forParam = {};
                        params.itemName = arguments[1];
                        var dataName = arguments[2];
                        params.tmpl = bingo.trim(arguments[3]);

                        if (bingo.isNullEmpty(dataName))
                            dataName = arguments[4]

                        dataName = bingo.trim(dataName);
                        var flt = bingo.filter.createFilter(dataName, view, node);
                        item.content = flt.content;
                        item.flt = flt;
                        params.dataName = item.content = flt.content;
                        //console.log('render tmpl:', params);
                        //console.log('render tmpl:', arguments);
                    });
                    //console.log('forParam', item.forParam);
                } else {
                    var flt = bingo.filter.createFilter(content, view, node);
                    item.content = flt.content;
                    item.flt = flt;
                }

                var fnTT = _getScriptContextFn(item.content, view)

                item.fn = function (view, data) { return fnTT(view, data, bingo); };//bingo(多版本共存)
            }
        }
        return item;
    };
    var _getScriptContextFn = function (evaltext, view) {
        if (bingo.isNullEmpty(evaltext)) return bingo.noop;
        var oldEvalText = evaltext;
        try {
            return new Function('$view', '$data', 'bingo', [
                'try {',
                    view ? 'with ($view) {' : '',
                        'with ($data || {}) {',
                            'return ' + evaltext + ';',
                        '}',
                    view ? '}' : '',
                '} catch (e) {',
                    'return bingo.isDebug ? ("Error: " + (e.message || e)) : e.message;',
                '} finally {',
                    '$data = null;',
                '}'].join(''));
        } catch (e) {
            if (bingo.isDebug) {
                var errorM = ['Error:', e.message || e, ' render:', oldEvalText].join('');
                throw new Error(errorM);
            } else {
                return function () { return e.message; };
            }
        }
    };

    var _compile = function (s, view, node) {
        var list = [],
            pos = 0, parents = [], _isTmpl = false, tmplCount = 0, _tmplContext = '', _tmplItem = null,
            _last = function (len) { return (len > 0) ? parents[len - 1].children : list; },
            _parent = function (len) { return (len > 0) ? parents.pop().children : list; };
        s.replace(bingo.render.regex, function (findText, f1, f2, f3, findPos, allText) {
            //console.log(findText, 'f1:' + f1, 'f2:' + f2, 'f3:' + f3, findPos);
            //return;

            //收集之前的文本
            var textTemp = allText.slice(pos, findPos);
            var textItem = bingo.isNullEmpty(textTemp) ? null : _newItem(textTemp);
            //console.log(arguments);

            var len = parents.length;
            //取当前列表
            var curList = _last(len);
            var isEnd = (f1 == '/');
            var isTmpl = (f2 == 'tmpl');

            //处理tmpl标签
            if (!_isTmpl) {
                _isTmpl = isTmpl;
                //curList.push(textItem);
                if (isTmpl) {
                    //处理{{tmpl}}
                    textItem && curList.push(textItem);
                    pos = findPos + findText.length;

                    tmplCount = 1;
                    _tmplContext = bingo.trim(f3);

                    //新建一个tmplItem, 累加tmpl的所有内容
                    _tmplItem = _newItem('');

                    if (!bingo.isNullEmpty(_tmplContext)) {
                        if (_tmplContext.indexOf('#') == 0) {
                            //处理{{tmpl #001}}
                            list.push(_tmplItem);//添加到根， 不添加到当前范围
                            _tmplItem.tmplId = _tmplContext;
                            _tmplContext = '';
                        } else {
                            curList.push(_tmplItem);
                            //处理{{tmpl text/html}}
                            _tmplItem.content = [_tmplItem.content, '<script type="', _tmplContext, '">'].join('');
                        }
                    }
                    return;
                }
            } else {
                //_isTmpl != (isEnd && isTmpl);

                if (isTmpl) {
                    if (isEnd) {
                        tmplCount--;
                        _isTmpl = tmplCount > 0;
                    } else
                        tmplCount++;
                }

                //添加之前文本
                _tmplItem.content = [_tmplItem.content, textTemp].join('');

                if (_isTmpl) {
                    //添加文本
                    _tmplItem.content = [_tmplItem.content, findText].join('');
                } else {
                    //退出tmpl, 处理{{/tmpl}}
                    if (!bingo.isNullEmpty(_tmplContext)) {
                        _tmplItem.content = [_tmplItem.content, '</script>'].join('');
                        _tmplContext = '', _tmplItem = null;
                    }
                }
                pos = findPos + findText.length;
                return;
            }
            //end 处理tmpl标签

            var isSpace = (f3.indexOf(' ') == 0); //第一个是否为空格, 语法空格符
            !bingo.isNullEmpty(f3) && (f3 = bingo.trim(f3));

            //else
            var isElse = (f2 == 'else');
            if (isElse) {
                if (!bingo.isNullEmpty(f3)) {
                    //如果else 有条件内容
                    if (!isSpace)
                        isElse = false;//如果没有空格, 不是else
                    else {
                        f3 = bingo.trim(f3);
                        f3 = bingo.isNullEmpty(f3) ? 'true' : f3;
                    }
                } else
                    f3 = 'true';
            }

            //if
            var isIf = (f2 == 'if' || isElse);
            //for
            var isForeach = (f2 == 'for');
            //是否单行for
            var isEndFor = false;
            if (isForeach) {
                isEndFor = _endForRegx.test(f3);
            }

            //header:1|footer:2|empty:3|loading:4|其它:0
            var role = 0;
            switch (f2) {
                case 'header':
                    role = 1;
                    break;
                case 'footer':
                    role = 2;
                    break;
                case 'empty':
                    role = 3;
                    break;
                case 'loading':
                    role = 4;
                    break;
            }
            var item = _newItem(f3, isIf, isEnd, true, view, node, isElse, isForeach, role);


            if (isElse) {
                //返回上一级
                curList = _parent(len);
                //插入之前文本
                textItem && curList.push(textItem);
                len = parents.length;
                //取当前列表
                curList = _last(len);
                //插入项
                curList.push(item);
                //设置为父项
                parents.push(item);
            } else if (isEnd) {
                //返回上一级
                curList = _parent(len);
                //插入之前文本
                textItem && curList.push(textItem);

                if (isIf) {
                    len = parents.length;
                    //取当前列表
                    curList = _last(len);
                    //插入项
                    curList.push(item);
                }
            } else {
                //取当前列表
                curList = _last(len);
                //插入之前文本
                textItem && curList.push(textItem);
                //插入项
                curList.push(item);
                //如果是if, for, role>0, 设置为父项
                (isIf || (isForeach && !isEndFor) || role > 0) && parents.push(item);
            }

            pos = findPos + findText.length;
        });
        if (pos < s.length) {
            list.push(_newItem(s.slice(pos)));
        }
        //console.log(JSON.stringify(list));
        //console.log(list);
        return list;
    }, _makeForCompile = function (list) {
        //header:1|footer:2|empty:3|loading:4
        var obj = {
            header: null,
            footer: null,
            empty: null,
            loading: null,
            tmpls:null,
            body: []
        };
        bingo.each(list, function () {
            if (!bingo.isNullEmpty(this.tmplId)) {
                obj.tmpls || (obj.tmpls = {});
                obj.tmpls[this.tmplId] = this.content;
            } else {
                switch (this.role) {
                    case 1:
                        obj.header = this;
                        break;
                    case 2:
                        obj.footer = this;
                        break;
                    case 3:
                        obj.empty = this;
                        break;
                    case 4:
                        obj.loading = this;
                        break;
                    default:
                        obj.body.push(this);
                        break;
                }
            }
        });
        return obj;
    }, _calcIfReturn = function (compileList, index) {
        var item;
        for (var i = index; i >= 0; i--) {
            item = compileList[i];
            if (item.isEnd && item.isIf) break;
            if (item.isIf && item.ifReturn) {
                return true;
            }
        }
        return false;
    }, _renderCompile = function (compileList, view, node, data, dataWithIndex, outWithDataList, compileData) {
        var list = [], perReturn = [];
        bingo.each(compileList, function (item, index) {
            if (!item.isTag)
                //text
                list.push(item.content);
            else if (!item.isEnd) {
                if (item.isForeach) {
                    var forParam = item.forParam;
                    if (!forParam) return;
                    var tmplId = forParam.tmpl;
                    var dataList = item.flt.filter(item.fn(view, data), data);
                    //if (!dataList) return;
                    var html = '';
                    if (bingo.isNullEmpty(tmplId)) {
                        var compileDataTmpl = item.compileData;
                        if (!compileDataTmpl) {
                            compileDataTmpl = item.compileData = _makeForCompile(item.children);
                            compileDataTmpl.tmpls = compileData.tmpls;
                            item.children = [];
                        }
                        html = _render(compileDataTmpl, view, node, dataList, forParam.itemName, data, dataWithIndex, outWithDataList);
                    } else {
                        if (!item.__renderObj) {
                            var isPath = (tmplId.indexOf('#') != 0);//如果有#开头, 认为ID, 如:'$div1; 否则认为url, 如:tmpl/add.html
                            if (!isPath) {
                                if (compileData.tmpls && compileData.tmpls[tmplId])
                                    html = compileData.tmpls[tmplId]
                                else
                                    html = $(tmplId).html();
                            } else {
                                bingo.tmpl(tmplId, view).success(function (rs) {
                                    html = rs;
                                }).cacheQurey(true).async(false).get();
                            }
                            if (bingo.isNullEmpty(html)) return;
                            item.__renderObj = bingo.render(html, view, node, compileData.tmpls);
                        }
                        html = item.__renderObj.render(dataList, forParam.itemName, data, dataWithIndex, outWithDataList);
                    }
                    list.push(html);
                } else if (item.isIf) {
                    //if
                    //console.log('if------------', item.fn(view, data));
                    if (item.isElse) {
                        //如果上一结果成功或执行条件失败跳过children, 并保存条件结果
                        if (_calcIfReturn(compileList, index - 1) || !(item.ifReturn = item.flt.filter(item.fn(view, data), data)))
                            return;
                    } else {
                        //如果执行条件失败跳过children, 并保存条件结果
                        if (!(item.ifReturn = item.flt.filter(item.fn(view, data), data))) return;
                    }
                    var str = _renderCompile(item.children, view, node, data, dataWithIndex, outWithDataList, compileData);
                    list.push(str);
                } else {
                    //tag
                    var val = item.flt.filter(item.fn(view, data), data);
                    list.push(val);
                }
            }
        });
        return list.join('');
    }, _renderItem = function (compileList, view, node, data, itemName, itemIndex, count, parentData, parentWithIndex, outWithDataList, compileData) {
        var obj = parentData ? bingo.clone(parentData, false) : {};
        obj.$parent = parentData;
        obj.itemName = itemName;
        obj[[itemName, 'index'].join('_')] = obj.$index = itemIndex;
        obj[[itemName, 'count'].join('_')] = obj.$count = count;
        obj[[itemName, 'first'].join('_')] = obj.$first = (itemIndex == 0);
        obj[[itemName, 'last'].join('_')] = obj.$last = (itemIndex == count - 1);
        var isOdd = (itemIndex % 2 == 0);//单
        obj[[itemName, 'odd'].join('_')] = obj.$odd = isOdd;
        obj[[itemName, 'even'].join('_')] = obj.$even = !isOdd;
        obj[itemName] = data;


        //console.log('_renderItem outWithDataList', parentWithIndex);
        outWithDataList && outWithDataList.push(obj);
        var injectIndex = outWithDataList ? outWithDataList.length - 1 : -1;

        var str = _renderCompile(compileList, view, node, obj, itemIndex, outWithDataList, compileData);

        return outWithDataList ? bingo.compile.injectTmplWithDataIndex(str, injectIndex, parentWithIndex) : str;

    }, _render = function (compileData, view, node, list, itemName, parentData, parentWithIndex, outWithDataList, formatter) {
        bingo.isString(itemName) || (itemName = 'item');
        var htmls = [], hT = '';
        var withLen = outWithDataList ? outWithDataList.length : -1, withHtml = null;
        if (withLen >= 0) {
            withHtml = bingo.compile.injectTmplWithDataIndex('', -1, withLen - 1);
            htmls.push(withHtml);
        }
        var isArray = bingo.isArray(list);
        var count = isArray ? list.length : 0;

        //header
        if (compileData.header) {
            hT = _renderItem(compileData.header.children, view, node, null, itemName, -1, count, parentData, parentWithIndex, outWithDataList, compileData);
            formatter && (hT = formatter(hT, 'header', null, -1));
            htmls.push(hT);
        }

        if (bingo.isNull(list)) {
            //null, loading或empty
            var cT = compileData.loading || compileData.empty;
            if (cT) {
                hT = _renderItem(cT.children, view, node, null, itemName, -1, count, parentData, parentWithIndex, outWithDataList, compileData);
                formatter && (hT = formatter(hT, compileData.loading === cT ? 'loading' : 'empty', null, -1));
                htmls.push(hT);
            }
        } else {

            if (!isArray) list = [list];

            if (list.length == 0) {
                //empty
                var cT = compileData.empty || compileData.loading;
                if (cT) {
                    hT = _renderItem(cT.children, view, node, null, itemName, -1, count, parentData, parentWithIndex, outWithDataList, compileData);
                    formatter && (hT = formatter(hT, compileData.loading === cT ? 'loading' : 'empty', null, -1));
                    htmls.push(hT);
                }
            } else {
                //body
                var compileList = compileData.body;
                bingo.each(list, function (item, index) {
                    hT = _renderItem(compileList, view, node, item, itemName, index, count, parentData, parentWithIndex, outWithDataList, compileData);
                    formatter && (hT = formatter(hT, 'body', item, index));
                    htmls.push(hT);
                });
            }
        }

        //footer
        if (compileData.footer) {
            hT = _renderItem(compileData.footer.children, view, node, null, itemName, -1, count, parentData, parentWithIndex, outWithDataList, compileData);
            formatter && (hT = formatter(hT, 'footer', null, -1));
            htmls.push(hT);
        }

        if (withLen >= 0) {
            htmls.push(withHtml);
        }

        return htmls.join('');
    };

})(bingo);
﻿
(function (bingo, $) {
    //version 1.0.1
    "use strict";

    bingo.factory('$rootView', function () {
        return bingo.rootView();
    });

    bingo.factory('$compile', ['$view', function (view) {
        return function () { return bingo.compile(view); };
    }]);

    bingo.factory('$tmpl', ['$view', function (view) {
        return function (url) { return bingo.tmpl(url, view); };
    }]);

    bingo.factory('$node', ['node', function (node) {
        return $(node);
    }]);

    bingo.factory('$factory', ['$view', function (view) {
        return function (fn) {
            return bingo.factory(fn).view(view);
        };
    }]);

    /*
        //同步syncAll
        $ajax.syncAll(function(){
            
            //第一个请求
            $ajax(url).post()
            //第二个请求, 或更多
            $ajax(url).post()
            .......

        }).success(function(){
	        //所有请求成功后, 
        });
    */

    bingo.factory('$ajax', ['$view', function ($view) {
        var fn = function (url) {
            return bingo.ajax(url, $view);
        };
        fn.syncAll = function (callback) { return bingo.ajaxSyncAll(callback, $view); };
        return fn;
    }]);

    bingo.factory('$filter', ['$view', 'node', '$withData', function ($view, node, $withData) {
        return function (content, withData) {
            return bingo.filter.createFilter(content, $view, node, withData || $withData);
        };
    }]);


    /*
        $view.datas = {
	        userList:$var([{name:'张三'}, {name:'李四'}])
        };

        var list = $view.datas.userList();
        list.push([{name:'王五'}]);
        $view.datas.userList(list);//重新赋值, 会自动更新到$view
        // $view.datas.userList.$setChange();//或调用$setChange强制更新

        //可以观察值(改变时)
        $view.data.userList.onChange(function(value){ console.log('change:', value); });

        //可以观察值(无论有没改变)
        $view.data.userList.onSubs(function(value){ console.log('change:', value); });

    */
    bingo.factory('$var', ['$view', function ($view) {
        return function (p, owner) { return bingo.variable(p, owner, $view); };
    }]);

    /*
        $view.datas = $model({
	        id:'1111',
            name:'张三'
        });

        //设置值, 可以使用链式写法, 并会自动更新到$view
        $view.datas.id('2222').name('张三');
        //获取值
        var id = $view.data.id();

        //可以观察值(改变时)
        $view.data.id.onChange(function(value){ console.log('change:', value); });

        //可以观察值(无论有没改变)
        $view.data.id.onSubs(function(value){ console.log('change:', value); });
    */
    bingo.factory('$model', ['$view', function ($view) {
        return function (p) { return bingo.model(p, $view); };
    }]);


    //绑定内容解释器, var bind = $bindContext('user.id == "1"', document.body); var val = bind.getContext();
    bingo.factory('$bindContext', ['$view', 'node', '$withData', function ($view, pNode, $withData) {
        return function (bindText, node, withData) {
            //node, withData可选
            node || (node = pNode);
            withData || (withData = $withData);
            return bingo.compile.bind($view, node, bindText, withData);
        };
    }]);


    //绑定属性解释器
    bingo.factory('$nodeContext', ['$view', 'node', '$withData', function ($view, pNode, $withData) {
        return function (node, withData) {
            //withData可选
            node || (node = pNode);
            withData || (withData = $withData);
            return bingo.compile.bindNode($view, node, withData);
        };
    }]);


    bingo.factory('$observer', ['$view', function ($view) {
        return bingo.observer($view);
    }]);

    /*
        $view.title = '标题';
        $view.text = '';

        $subs('title', function(newValue){
	        $view.text = newValue + '_text';
        });

        ........
        $view.title = '我的标题';
        $view.$update();
    */
    bingo.each(['$subscribe', '$subs'], function (name) {
        bingo.factory(name, ['$observer', '$attr', function ($observer, $attr) {
            return function (p, callback, deep) {
                return $observer.subscribe(p, callback, deep, $attr);
            };
        }]);
    });

    bingo.factory('$module', ['$view', function ($view) {
        return function (name) {
            var module = arguments.length == 0 ? $view.$getModule() : $view.$getApp().module(name);
            return !module ? null : {
                $service: function (name) {
                    var service = module.service(name);
                    return !service ? null : bingo.factory(name).view($view).inject();
                },
                $controller: function (name) {
                    var controller = module.controller(name);
                    return !controller ? null : {
                        $action: function (name) {
                            var action = controller.action(name);
                            return !action ? null : bingo.factory(action).view($view).inject();
                        }
                    };
                }
            };
        };
    }]);


    /*
        //1. 添加或设置路由'view'
        bingo.route('view', {
            //路由地址
            url: 'view/{module}/{controller}/{action}',
            //路由转发到地址
            toUrl: 'modules/{module}/views/{controller}/{action}.html',
            //默认值
            defaultValue: { module: '', controller: '', action: '' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/system/user/list');
                返回结果==>'modules/system/views/user/list.html'
    */
    bingo.factory('$route', function () {
        return function (url) {
            return bingo.route(url);
        };
    });

    /*
        //根据url生成routeContext;
        var routeContext = bingo.routeContext('view/system/user/list');
            返回结果==>{
                name:'view',
                url:'view/system/user/list',
                toUrl:'modules/system/views/user/list.html',
                params:{ module: 'system', controller: 'user', action: 'list' },
                actionContext:function(){...}
            }
    */
    bingo.factory('$routeContext', function () {
        return function (url) {
            return bingo.routeContext(url);
        };
    });

    var _cacheObj = {},
        _cacheM = bingo.cacheToObject(_cacheObj).max(100);
    bingo.factory('$cache', function () {
        return _cacheM;
    });


    //参数，使用后，自动清除
    var _paramObj = {},
        _paramM = bingo.cacheToObject(_paramObj).max(20);
    bingo.factory('$param', ['$view', function ($view) {
        return function (key, value) {
            _paramM.key(key);
            if (arguments.length <= 1) {
                var p = _paramM.get();
                _paramM.clear();
                return p;
            }
            else
                _paramM.set(value);
        };
    }]);



})(bingo, window.jQuery);
﻿
(function (bingo) {

    bingo.factory('$linq', function () {
        return function (p) { return bingo.linq(p); };
    });

})(bingo);
﻿
(function (bingo) {

    /*
        与bg-route同用, 取bg-route的url等相关
        $location.href('view/system/user/list');
        var href = $location.href();
        var params = $location.params();
    
    
        $location.onChange请参考bg-route定义
    */
    var _routeCmdName = 'bg-route',
        _dataKey = '_bg_location_';

    //bingo.location('main') 或 bingo.location($('#id')) 或 bingo.location(docuemnt.body)

    bingo.location = function (p) {
        /// <summary>
        /// location 没有给删除如果dom在一直共用一个
        /// </summary>
        /// <param name="p">可选，可以是字串、jquery和dom node, 默认document.documentElement</param>
        /// <returns value='_locationClass.NewObject()'></returns>
        bingo.isString(p) && (p = '[bg-name="' + p + '"]');
        var $node = null;
        if (bingo.isString(p))
            $node = $(p);
        else if (p)
            $node = $(p).closest('[' + _routeCmdName + ']')

        var isRoute = $node && $node.size() > 0 ? true : false;
        if (!isRoute)
            $node = $(document.documentElement);

        var o = $node.data(_dataKey);
        if (!o) {
            o = _locationClass.NewObject().ownerNode($node).linkToDom($node).isRoute(isRoute).name($node.attr('bg-name')||'');
            $node.data(_dataKey, o);
        }
        return o;
    };

    bingo.location.onHref = bingo.Event();
    bingo.location.onLoaded = bingo.Event();

    var _locationClass = bingo.location.Class = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Prop({
            ownerNode: null,
            //是否路由出来的
            isRoute: false,
            name:''
        });

        this.Define({
            //路由query部分参数
            queryParams: function () {
                return this.routeParams().queryParams
            },
            //路由参数
            routeParams: function () {
                var url = this.url();
                var routeContext = bingo.routeContext(url);
                return routeContext.params;
            },
            href: function (url, target) {
                var frame = bingo.isNullEmpty(target) ? (this.isRoute() ? this.ownerNode() : null) : $('[' + _routeCmdName + '][bg-name="' + target + '"]');
                if (frame && frame.size() > 0) {
                    frame.attr(_routeCmdName, url).trigger('bg-location-change', [url]);
                }
                return this;
            },
            reload: function (target) {
                return this.href(this.url(), target);
            },
            onChange: function (callback) {
                var $this = this;
                this.isRoute() && callback && this.ownerNode().on('bg-location-change', function (e, url) {
                    e.stopPropagation();
                    e.preventDefault();
                    callback.call($this, url);
                    return false;
                });
            },
            onLoaded: function (callback) {
                var $this = this;
                this.isRoute() && callback && this.ownerNode().on('bg-location-loaded', function (e, url) {
                    e.stopPropagation();
                    e.preventDefault();
                    callback.call($this, url);
                    bingo.location.onLoaded.trigger([$this]);
                    return false;
                });
            },
            url: function () {
                if (this.isRoute())
                    return this.ownerNode().attr(_routeCmdName);
                else
                    return window.location + '';
            },
            toString: function () {
                return this.url();
            },
            views: function () {
                return bingo.view(this.ownerNode()).$children;
            },
            close: function () {
                if (!this.isRoute()) return;
                if (this.trigger('onCloseBefore') === false) return;
                this.ownerNode().remove();
            },
            onCloseBefore: function (callback) {
                return this.on('onCloseBefore', callback);
            },
            onClosed: function (callback) {
                if (this.__closeed !== true) {
                    this.__closeed = true;
                    this.onDispose(function () {
                        this.trigger('onClosed');
                    });
                }
                return this.on('onClosed', callback);
            }
        });

    });

    bingo.factory('$location', ['node', function (node) {

        return bingo.location(node);

    }]);

})(bingo);
﻿
(function (bingo) {

    /*
        var rd = $render('<div>{{: item.name}}</div>');
        var html = rd.render([{name:'张三'}, {name:'李四'}], 'item');
        var html2 = rd.render([{name:'王五'}, {name:'小六'}], 'item');
    */
    bingo.factory('$render', ['$view', 'node', function ($view, node) {
        /// <param name="$view" value="bingo.view.viewClass()"></param>
        /// <param name="node" value="document.body"></param>

        return function (tmpl) {
            return bingo.render(tmpl, $view, node);
        };

    }]);

})(bingo);
﻿
(function (bingo) {

    /*
        //异步执行内容, 并自动同步view数据
        $timeout(function(){
            $view.title = '我的标题';
        }, 100);
    */
    bingo.factory('$timeout', ['$view', function ($view) {
        /// <param name="$view" value="bingo.view.viewClass()"></param>

        return function (callback, time) {
            return $view.$timeout(function () {
                callback && callback();
            }, time);
        };
    }]);

})(bingo);
﻿
(function (bingo) {
    /*
        使用方法:
        bg-action="function($view){}"   //直接绑定一个function
        bg-action="ctrl/system/user"    //绑定到一个url
    */

    bingo.each(['bg-action', 'bg-action-add'], function (cmdName) {
        var _isAdd = cmdName == 'bg-action-add';

        bingo.command(cmdName, function () {

            return {
                //优先级, 越大越前, 默认50
                priority: _isAdd ? 995 : 1000,
                //模板
                tmpl: '',
                //外部模板
                tmplUrl: '',
                //是否替换节点, 默认为false
                replace: false,
                //是否indclude, 默认为false, 模板内容要包函bg-include
                include: false,
                //是否新view, 默认为false
                view: !_isAdd,
                //是否编译子节点, 默认为true
                compileChild: _isAdd,
                //编译前, 没有$viewnode和$attr注入, 即可以用不依懒$domnode和$attr的所有注入, 如$view/node/$node/$ajax...
                //如果view == true , 注入的view属于上层, 原因是新view还没解释出来, 还处于分析
                compilePre: null,
                //引用其它模板指令, 没有$viewnode和$attr注入, 即可以用不依懒$domnode和$attr的所有注入, 如$view/node/$node/$ajax...
                //如果view == true , 注入的view属于上层, 原因是新view还没解释出来, 还处于分析
                //as: ['$node', function ($node) {
                //    return [{ name: 'bg-model', value: 'user.name' }];
                //}],
                //action
                action: null,
                //link
                link: null,
                //编译, (compilePre编译前-->action初始数据-->compile编译-->link连接command)
                compile: ['$view', '$compile', '$node', '$attr', function ($view, $compile, $node, $attr) {
                    /// <param name="$view" value="bingo.view.viewClass()"></param>
                    /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                    /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                    /// <param name="$node" value="$([])"></param>

                    var attrVal = $attr.$attrValue(), val = null;
                    if (!bingo.isNullEmpty(attrVal)) {
                        val = $attr.$results();
                        //如果没有取父域
                        if (!val) val = bingo.datavalue($view.$parentView(), attrVal);
                    }

                    if (bingo.isNullEmpty(attrVal)
                        || bingo.isFunction(val) || bingo.isArray(val)) {
                        //如果是function或数组, 直接当action, 或是空值时

                        //添加action
                        val && $view.$addAction(val);
                        //编译
                        !_isAdd && $view.$using([], function () { $compile().fromNode($node[0].childNodes).compile(); });
                    } else {
                        //使用url方式, 异步加载action, 走mvc开发模式
                        var url = attrVal;

                        var routeContext = bingo.routeContext(url);
                        var actionContext = routeContext.actionContext();

                        if (actionContext.action) {
                            //如果acion不为空, 即已经定义action

                            //设置app
                            $view.$setApp(actionContext.app);
                            //设置module
                            $view.$setModule(actionContext.module);
                            //添加action
                            $view.$addAction(actionContext.action);
                            //编译
                            !_isAdd && $view.$using([], function () { $compile().fromNode($node[0].childNodes).compile(); });
                        } else {
                            //如果找不到acion, 加载js

                            //加载js后再断续解释
                            //$using有同步view启动作用, ready之后， 没有作用
                            $view.$using(url, function () {

                                var actionContext = routeContext.actionContext();
                                if (actionContext.action) {
                                    //设置app
                                    $view.$setApp(actionContext.app);
                                    //设置module
                                    $view.$setModule(actionContext.module);
                                    //添加action
                                    $view.$addAction(actionContext.action);
                                    //编译
                                    !_isAdd && $view.$using([], function () { $compile().fromNode($node[0].childNodes).compile(); });
                                }
                            });
                        }
                    }
                }]
            };
        });
    });

})(bingo);
﻿
(function (bingo) {
    /*
        使用方法:
        bg-attr="{src:'text.html', value:'ddd'}"
        bg-prop="{disabled:false, checked:true}"
        bg-checked="true" //直接表达式
        bg-checked="helper.checked" //绑定到变量, 双向绑定
    */
    bingo.each('attr,prop,src,checked,unchecked,disabled,enabled,readonly,class'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return ['$view', '$attr', '$node', function ($view, $attr, $node) {
                /// <param name="$view" value="bingo.view.viewClass()"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$node" value="$([])"></param>

                var _set = function (val) {
                    switch (attrName) {
                        case 'attr':
                            //bg-attr="{src:'text.html', value:'ddd'}"
                            $node.attr(val);
                            break;
                        case 'prop':
                            $node.prop(val);
                            break;
                        case 'enabled':
                            $node.prop('disabled', !val);
                            break;
                        case 'unchecked':
                            $node.prop('checked', !val);
                            break;
                        case 'disabled':
                        case 'readonly':
                        case 'checked':
                            $node.prop(attrName, val);
                            break;
                        default:
                            $node.attr(attrName, val);
                            break;
                    }

                };

                $attr.$subsResults(function (newValue) {
                    _set(newValue);
                }, (attrName == 'attr' || attrName == 'prop'));

                $attr.$initResults(function (value) {
                    _set(value);
                });

                if (attrName == 'checked' || attrName == 'unchecked') {
                    //如果是checked, 双向绑定
                    $node.click(function () {
                        var value = $node.prop('checked');
                        $attr.$value(attrName == 'checked' ? value : !value);
                        $view.$update();
                    });
                }

            }];

        });
    });

})(bingo);
﻿
(function (bingo) {
    /*
        使用方法:
        bg-event="{click:function(e){}, dblclick:helper.dblclick, change:['input', helper.dblclick]}"
        bg-click="helper.click"     //绑定到方法
        bg-click="['input', helper.click]"     //绑定到数组, 等效于$().on('click', 'input', helper.click)
        bg-click="helper.click()"   //直接执行方法
    */
    bingo.each('event,click,blur,change,dblclick,focus,focusin,focusout,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,resize,scroll,select,submit,contextmenu'.split(','), function (eventName) {
        bingo.command('bg-' + eventName, function () {

            return ['$view', '$node', '$attr', function ($view, $node, $attr) {
                /// <param name="$view" value="bingo.view.viewClass()"></param>
                /// <param name="$node" value="$([])"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>

                var bind = function (evName, callback) {
                    if (bingo.isArray(callback))
                        $node.on.apply($node, [].concat(evName, callback));
                    else {
                        $node.on(evName, function () {
                            //console.log(eventName);
                            var r = callback.apply(this, arguments);
                            $view.$update();
                            return r;
                        });
                    }
                };

                if (eventName != 'event') {
                    var fn = /^\s*\[(.|\n)*\]\s*$/g.test($attr.$attrValue()) ? $attr.$results() : $attr.$value();
                    if (!bingo.isFunction(fn) && !bingo.isArray(fn))
                        fn = function (e) { return $attr.$eval(e); };
                    bind(eventName, fn);
                } else {
                    var evObj = $attr.$results();
                    if (bingo.isObject(evObj)) {
                        var fn = null;
                        for (var n in evObj) {
                            if (bingo.hasOwnProp(evObj, n)) {
                                fn = evObj[n];
                                if (bingo.isFunction(fn) || bingo.isArray(fn))
                                    bind(n, fn);
                            }
                        }
                    }
                }

            }];

        });
    });

})(bingo);
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";

    //var _renderReg = /[ ]*([^ ]+)[ ]+in[ ]+([^ ]+)(?:[ ]+tmpl=([^ ]+))*/g;
    var _renderReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/;

    /*
        使用方法:
        bg-render="item in user.list"

        例:
        <select bg-render="item in list">
            ${if item.id == 1}
            <option value="${item.id}">text_${item.text}</option>
            ${else}
            <option value="${item.id}">text_${item.text}eee</option>
            ${/if}
        </select>
    */

    //bg-render
    //bg-render="datas"  ==等效==> bg-render="item in datas"
    //bg-render="item in datas"
    //bg-render="item in datas tmpl=#tmplid"    //tmpl以#开头认为ID
    //bg-render="item in datas tmpl=view/user/listtmpl"  //tmpl不以#开头认为url, 将会异步加载
    //bg-render="item in datas | asc"
    //bg-render="item in datas | asc tmpl=#tmplid"
    bingo.each(['bg-for', 'bg-render'], function (cmdName) {

        bingo.command(cmdName, function () {
            return {
                priority: 100,
                compileChild: false,
                link: ['$view', '$compile', '$node', '$attr', '$render', '$tmpl', function ($view, $compile, $node, $attr, $render, $tmpl) {
                    /// <param name="$view" value="bingo.view.viewClass()"></param>
                    /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                    /// <param name="$node" value="$([])"></param>
                    /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                    /// <param name="$render" value="function(html){return  bingo.render('');}"></param>

                    var attrData = _makeBindContext($node, $attr);
                    $node.html('');
                    //console.log(attrData);

                    if (!attrData) return;
                    var _itemName = attrData.itemName,
                        _tmpl = attrData.tmpl;

                    var _renderSimple = function (datas) {

                        var jElement = $node;
                        var html = '';
                        jElement.html('');
                        //if (!bingo.isArray(datas)) datas = bingo.isNull(datas) ? [] : [datas];
                        var withDataList = [];//收集数据
                        var parenData = $attr.getWithData();
                        var parenDataIndex = parenData ? parenData.$index : -1;
                        html = renderObj.render(datas, _itemName, parenData, parenDataIndex, withDataList);
                        //console.log(withDataList);
                        //使用withDataList进行数组批量编译
                        bingo.isNullEmpty(html) || $compile().fromHtml(html).withDataList(withDataList).appendTo(jElement).compile();
                    };


                    var initTmpl = function (tmpl) {
                        renderObj = $render(tmpl);
                        $attr.$subsResults(function (newValue) {
                            _renderSimple(newValue);
                        }, true);
                        $attr.$initResults(function (value) {
                            _renderSimple(value);
                        });
                    };


                    var html = '', renderObj = null;

                    if (bingo.isNullEmpty(_tmpl)) {
                        html = attrData.html;
                    } else {
                        var isPath = (_tmpl.indexOf('#') != 0);
                        if (isPath) {
                            //从url加载
                            $tmpl(_tmpl).success(function (html) {
                                if (!bingo.isNullEmpty(html)) {
                                    initTmpl(html);
                                }
                            }).get();
                        } else
                            html = _tmpl;
                    }

                    if (!bingo.isNullEmpty(html)) {
                        initTmpl(html);
                    }

                }]
            };

        });

    });

    var _makeBindContext = function ($node, $attr) {
        var code = $attr.content;
        if (bingo.isNullEmpty(code))
            code = 'item in {}';
        if (!_renderReg.test(code)) {
            code = ['item in ', code].join('');
        }
        var _itemName = '', _dataName = '', _tmpl = '';
        //分析item名称, 和数据名称
        code.replace(_renderReg, function () {
            _itemName = arguments[1];
            _dataName = arguments[2];
            _tmpl = bingo.trim(arguments[3]);

            if (bingo.isNullEmpty(_dataName))
                _dataName = arguments[4];

            //console.log('render tmpl:', arguments);
        });

        $attr.$attrValue(_dataName);

        return {
            itemName: _itemName,
            dataName: _dataName,
            tmpl: _tmpl,
            html: _tmpl ? '' : bingo.compile.getNodeContentTmpl($node)
        }
    };
})(bingo);

﻿
(function (bingo) {

    /*
        使用方法:
        bg-route="view/system/user/list"
    
        连接到view/system/user/list, 目标:main
        <a href="#view/system/user/list" bg-target="main">在main加载连接</a>
        设置frame:'main'
        <div bg-route="" bg-name="main"></div>
    */
    bingo.command('bg-route', function () {
        return {
            priority: 1000,
            replace: false,
            view: true,
            compileChild: false,
            compile: ['$compile', '$node', '$attr', '$location', function ($compile, $node, $attr, $location) {
                /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$node" value="$([])"></param>

                //只要最后一次，防止连续点击链接
                var _last = null;
                $location.onChange(function (url) {
                    _last && _last.stop();
                    _last = $compile().fromUrl(url).appendTo($node).onCompilePre(function () {
                        $node.html('');
                    }).onCompiled(function () {
                        _last = null;
                        $node.trigger('bg-location-loaded', [url]);
                    }).compile();
                });

                $attr.$init(function () {
                    var value = $attr.$attrValue();
                    var pview = $attr.view().$parentView();
                    var url = bingo.datavalue(pview, value);
                    if (bingo.isUndefined(bingo.isUndefined(url)))
                        url = bingo.datavalue(window, value);

                    if (bingo.isUndefined(url)) {
                        return value;
                    } else {
                        pview.$subs('url', function (value) {
                            if ($attr.isDisposed) return;
                            value && $location.href(value);
                        });
                        return url;
                    }
                }, function (value) {
                    value && $location.href(value);
                });
            }]
        };
    });

    bingo.command('bg-route-load', function () {
        return ['$location', '$attr', function ($location, $attr) {

                $attr.$initResults(function (value) {
                    bingo.isFunction(value) && $location.onLoaded(function(url){ value.call($location, url); });
                });
            }];
    });

    $(function () {
        $(document.documentElement).on('click', '[href]', function () {
            var jo = $(this);
            var href = jo.attr('href');
            if (href.indexOf('#') >= 0) {
                href = href.split('#');
                href = href[href.length - 1].replace(/^[#\s]+/, '');
                if (!bingo.isNullEmpty(href)) {
                    var target = jo.attr('bg-target');
                    if (bingo.location.onHref.trigger([jo, href, target]) === false) return;
                    var $loc = bingo.location(this);
                    $loc.href(href, target);
                }
            }
        });
    });

})(bingo);
﻿
(function (bingo) {

    //bg-html="'<br />'" | bg-html="datas.html"
    bingo.command('bg-html', function () {
        return ['$attr', '$node', '$compile', function ($attr, $node, $compile) {
            /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
            /// <param name="$node" value="$([])"></param>
            var _set = function (val) {
                $node.html(bingo.toStr(val));
                $compile().fromJquery($node).compile();
            };
            $attr.$subsResults(function (newValue) {
                _set(newValue);
            });
            $attr.$initResults(function (value) {
                _set(value);
            });

        }];
    });

})(bingo);
﻿(function (bingo) {

    var _renderItem = '_tif_' + bingo.makeAutoId();

    bingo.each(['bg-if', 'bg-render-if'], function (cmdName) {
        var _isRender = cmdName == 'bg-render-if';
        bingo.command(cmdName, function () {
            return {
                compileChild: false,
                compile: ['$attr', '$node', '$compile', '$render', function ($attr, $node, $compile, $render) {
                    /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                    /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                    /// <param name="$node" value="$([])"></param>

                    var html = bingo.compile.getNodeContentTmpl($node),
                        _render = _isRender ? $render(html) : null;

                    var _set = function (value) {
                        $node.html('');
                        if (value) {
                            $node.show();
                            $compile().fromHtml(_isRender ? _render.render({}, _renderItem) : html).appendTo($node).compile();
                        } else
                            $node.hide();
                    };

                    $attr.$subsResults(function (newValue) {
                        _set(newValue);
                    });

                    $attr.$initResults(function (value) {
                        _set(value);
                    });

                }]
            };
        });
    });

})(bingo);
﻿
(function (bingo) {
    /*
    使用方法:
    bg-include="helper.url"   //与变量绑定
    bg-include="#nodeid"   //以#开始, $('#nodeid').html()为内容
    bg-include="view/system/user/list"   //从url加载内容
*/
    var _renderItem = '_tinc_' + bingo.makeAutoId();
    bingo.each(['bg-include', 'bg-render-include'], function (cmdName) {
        var _isRender = cmdName == 'bg-render-include';
        bingo.command(cmdName, function () {
            return ['$view', '$attr', '$viewnode', '$tmpl', '$render', function ($view, $attr, $viewnode, $tmpl, $render) {
                /// <param name="$view" value="bingo.view.viewClass()"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$viewnode" value="bingo.view.viewnodeClass()"></param>
                /// <param name="$tmpl" value="function(url){ return bingo.tmpl('', $view);}"></param>

                var _prop = $attr.$attrValue();
                //如果值为空不处理
                if (bingo.isNullEmpty(_prop)) return;

                //是否绑定变量
                var _html = function (src) {
                    //src如果有#开头, 认为ID, 如:'$div1; 否则认为url, 如:tmpl/add.html
                    var isPath = (src.indexOf('#') != 0);
                    var html = '';
                    if (isPath)
                        $tmpl(src).success(function (rs) {
                            html = rs;
                            $viewnode.$html(_isRender ? $render(html).render({}, _renderItem) : html);
                        }).get();
                    else {
                        html = $(src).html();
                        $viewnode.$html(_isRender ? $render(html).render({}, _renderItem) : html);
                    }

                    //用$html方法, 设置html, 并自动编译
                };


                $attr.$initResults(function (value) {
                    var isLinkVal = !bingo.isUndefined(value);
                    if (isLinkVal) {
                        //如果绑定变量, 观察变量变化
                        $attr.$subsResults(function (newValue) {
                            _html(newValue);
                        });
                        _html(value);
                    } else
                        _html(_prop);//如果没有绑定变量,直接取文本
                });

            }];
        });
    });

})(bingo);
﻿(function (bingo) {

    bingo.command('bg-model', function () {

        return ['$view', '$node', '$attr', function ($view, $node, $attr) {
            /// <param name="$view" value="bingo.view.viewClass()"></param>
            /// <param name="$node" value="$([])"></param>
            /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>

            var _isRadio = $node.is(":radio");
            var _isCheckbox = $node.is(":checkbox");
            _isCheckbox && $node.data("checkbox_value_02", $node.val());

            var _getElementValue = function () {
                var jT = $node;
                return _isCheckbox ? (jT.prop("checked") ? jT.data("checkbox_value_02") : '') : jT.val();
            }, _setElementValue = function (value) {
                var jo = $node;
                value = bingo.toStr(value);
                if (_isCheckbox) {
                    //jo.data("checkbox_value_02", value);
                    jo.prop("checked", (jo.val() == value));
                } else if (_isRadio) {
                    jo.prop("checked", (jo.val() == value));
                } else
                    jo.val(value);

            };

            if (_isRadio) {
                $node.click(function () {
                    var value = _getElementValue();
                    $attr.$value(value);
                    $view.$update();
                });
            } else {
                $node.on('change', function () {
                    var value = _getElementValue();
                    $attr.$value(value);
                    $view.$update();
                });
            }


            $attr.$subsValue(function (newValue) {
                _setElementValue(newValue);
            });

            $attr.$initValue(function (value) {
                _setElementValue(value);
            });

        }];

    });

})(bingo);
﻿
(function (bingo) {

    /*
        使用方法:
        bg-style="{display:'none', width:'100px'}"
        bg-show="true"
        bg-show="res.show"
    */
    bingo.each('style,show,hide,visible'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return ['$attr', '$node', function ($attr, $node) {
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$node" value="$([])"></param>

                var _set = function (val) {

                    switch (attrName) {
                        case 'style':
                            //bg-style="{display:'none', width:'100px'}"
                            $node.css(val);
                            break;
                        case 'hide':
                            val = !val;
                        case 'show':
                            if (val) $node.show(); else $node.hide();
                            break;
                        case 'visible':
                            val = val ? 'visible' : 'hidden';
                            $node.css('visibility', val);
                            break;
                        default:
                            $node.css(attrName, val);
                            break;
                    }
                };

                $attr.$subsResults(function (newValue) {
                    _set(newValue);
                }, (attrName == 'style'));

                $attr.$initResults(function (value) {
                    _set(value);
                });

            }];

        });
    });

})(bingo);
﻿
(function (bingo) {

    bingo.command('bg-text', function () {

        return ['$attr', '$node', function ($attr, $node) {
            /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
            /// <param name="$node" value="$([])"></param>

            var _set = function (val) {
                $node.text(bingo.toStr(val));
            };

            //订阅执行结果， 如果执行结果改变时，同步数据
            $attr.$subsResults(function (newValue) {
                _set(newValue);
            });

            //根据执行结果初始结果
            $attr.$initResults(function (value) {
                _set(value);
            });

        }];
    });

})(bingo);
﻿
(function (bingo) {
    /*
    使用方法:
    bg-include="helper.url"   //与变量绑定
    bg-include="#nodeid"   //以#开始, $('#nodeid').html()为内容
    bg-include="view/system/user/list"   //从url加载内容
*/
    var _renderItem = '_tinc_' + bingo.makeAutoId();
    bingo.each(['bg-include', 'bg-render-include'], function (cmdName) {
        var _isRender = cmdName == 'bg-render-include';
        bingo.command(cmdName, function () {
            return ['$view', '$attr', '$viewnode', '$tmpl', '$render', function ($view, $attr, $viewnode, $tmpl, $render) {
                /// <param name="$view" value="bingo.view.viewClass()"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$viewnode" value="bingo.view.viewnodeClass()"></param>
                /// <param name="$tmpl" value="function(url){ return bingo.tmpl('', $view);}"></param>

                var _prop = $attr.$attrValue();
                //如果值为空不处理
                if (bingo.isNullEmpty(_prop)) return;

                //是否绑定变量
                var _html = function (src) {
                    //src如果有#开头, 认为ID, 如:'$div1; 否则认为url, 如:tmpl/add.html
                    var isPath = (src.indexOf('#') != 0);
                    var html = '';
                    if (isPath)
                        $tmpl(src).success(function (rs) {
                            html = rs;
                            $viewnode.$html(_isRender ? $render(html).render({}, _renderItem) : html);
                        }).get();
                    else {
                        html = $(src).html();
                        $viewnode.$html(_isRender ? $render(html).render({}, _renderItem) : html);
                    }

                    //用$html方法, 设置html, 并自动编译
                };


                $attr.$initResults(function (value) {
                    var isLinkVal = !bingo.isUndefined(value);
                    if (isLinkVal) {
                        //如果绑定变量, 观察变量变化
                        $attr.$subsResults(function (newValue) {
                            _html(newValue);
                        });
                        _html(value);
                    } else
                        _html(_prop);//如果没有绑定变量,直接取文本
                });

            }];
        });
    });

})(bingo);
﻿
(function (bingo) {

    bingo.command('bg-node', function () {

        return ['$attr', 'node', function ($attr, node) {
            $attr.$value(node);
        }];
    });

})(bingo);
﻿
(function (bingo) {

    bingo.command('text/bg-script', function () {

        return {
            //优先级, 越大越前, 默认50
            priority: 300,
            //是否编译子节点, 默认为true
            compileChild: false,
            //编译, (compilePre编译前-->action初始数据-->compile编译-->link连接command)
            compile: ['$attr', '$node', '$bindContext', function ($attr, $node, $bindContext) {

                $attr.$init(function () { return $node.html(); }, function (value) {
                    if (!bingo.isNullEmpty(value)) {
                        var bindContext = $bindContext(value);
                        bindContext.$eval();
                        bindContext.dispose();
                    }
                });

            }]
        };
    });

    bingo.command('bg-not-compile', function () {

        return {
            //是否编译子节点, 默认为true
            compileChild: false
        };
    });

    bingo.command('bg-loaded', function () {

        return {
            //优先级, 越大越前, 默认50
            priority: 5,
            link: ['$attr', function ($attr) {

                $attr.$init(function () {
                    return 1;
                }, function (value) {
                    $attr.$eval();
                });

            }]
        };
    });

})(bingo);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    ////支持注入$view与node
    //bingo.filter('eq', function ($view, node) {
    //    return function (value, para) {
    //        return value == para;
    //    };
    //});

    //等于, datas.n | eq:1
    bingo.filter('eq', function () {
        return function (value, para) {
            return value == para;
        };
    });

    //不等于, datas.n | neq:1
    bingo.filter('neq', function () {
        return function (value, para) {
            return value != para;
        };
    });

    //取反, datas.n | not:1
    bingo.filter('not', function () {
        return function (value, para) {
            return !value;
        };
    });

    //大于, datas.n | gt:1
    bingo.filter('gt', function () {
        return function (value, para) {
            return value > para;
        };
    });

    //大于等于, datas.n | gte:1
    bingo.filter('gte', function () {
        return function (value, para) {
            return value >= para;
        };
    });

    //小于, datas.n | lt:1
    bingo.filter('lt', function () {
        return function (value, para) {
            return value < para;
        };
    });

    //小于等于, datas.n | lte:1
    bingo.filter('lte', function () {
        return function (value, para) {
            return value <= para;
        };
    });

    //长度, datas.n | len:1
    bingo.filter('len', function () {
        return function (value, para) {
            return value ? bingo.isUndefined(value.length) ? 0 : value.length : 0;
        };
    });

    //将html转成文本, data.html | text
    bingo.filter('text', function () {
        return function (value, para) {
            return bingo.htmlEncode(value);
        };
    });

    //将文本转成html, data.text | html
    bingo.filter('html', function () {
        return function (value, para) {
            return bingo.htmlDecode(value);
        };
    });

    //输出新值, data.text | val:$data+ '1111'
    bingo.filter('val', function () {
        return function (value, para) {
            return para;
        };
    });

    //长度, data.text | len | eq:0
    bingo.filter('len', function () {
        return function (value, para) {
            return value && value.length ? value.length : 0
        };
    });

    //多元操作， data.status | sw:[0, 'active', ''] //true?'active':''
    bingo.filter('sw', function () {
        return function (value, para) {

            var len = para.length;
            var hasElse = (len % 2) == 1; //如果单数, 有else值
            var elseVal = hasElse ? para[len - 1] : '';
            hasElse && (len--);

            //sw:[1, '男', 2, '女', '保密'], '保密'为else值
            var r = null, ok = false, item;
            for (var i = 0; i < len; i += 2) {
                item = para[i];
                if (value == item) {
                    r = para[i + 1], ok = true;
                    break;
                }
            }
            return ok ? r : elseVal;
        };
    });

    //获取数组指定部分数据:[开始位置，数量], 数量为可选, data.list | take:[1, 3] | take:[1]
    bingo.filter('take', function () {
        return function (value, para) {
            return bingo.linq(value).take(para[0], para[1]);;
        };
    });


    //升序排序:'属性名称'，可选, data.list | asc:'n' | asc
    bingo.filter('asc', function () {
        return function (value, para) {
            var data = bingo.linq(value);
            if (!bingo.isNullEmpty(para))
                data.sortAsc(para);
            else
                data.sortAsc();
            return data.toArray();
        };
    });

    //降序排序:'属性名称'，可选, data.list | desc:'n' | desc
    bingo.filter('desc', function () {
        return function (value, para) {
            var data = bingo.linq(value);
            if (!bingo.isNullEmpty(para))
                data.sortDesc(para);
            else
                data.sortDesc();
            return data.toArray();
        };
    });

})(bingo);
