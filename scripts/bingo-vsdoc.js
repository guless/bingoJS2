/// <reference path="../jquery/jquery-1.8.1.js" />
window.console || (window.console = { log: function () { }, error: function () { }, info: function () { }, table: function () { } });

window.intellisenseAnnotate = function (obj, objDoc) {
	/// <summary>
	/// 对像添加注释
	/// </summary>
    /// <param name="obj"></param>
    /// <param name="objDoc"></param>
    window.intellisense && intellisense.annotate(obj, objDoc);
};

window.intellisenseSetCallContext = function (func, thisArg, args) {
    /// <summary>
    /// 设置方法上下文
    /// </summary>
    /// <param name="func" type="function">要设置方法</param>
    /// <param name="thisArg">设置方法this对象</param>
    /// <param name="args">设置方法参数, 数组(多个参数)或单个参数</param>
    if (!window.intellisense) return;
    var context = { thisArg: thisArg };
    if (arguments.length > 2)
        context.args = pxj.isArray(args) ? args : [args];

    intellisense.setCallContext(func, context);
};

window.intellisenseRedirectDefinition = function (item, defintion) {
    /// <summary>
    /// 设置定义引用
    /// </summary>
    /// <param name="item">要设置变量</param>
    /// <param name="defintion">定义变量</param>

    window.intellisense && intellisense.redirectDefinition(item, defintion);
};
window.intellisenseLogMessage = function (msg) {
    /// <summary>
    /// 打印信息
    /// </summary>
    var list = [];
    for (var i = 0, len = arguments.length; i < len; i++) {
        list.push(arguments[i]);
    }

    window.intellisense && intellisense.logMessage(list.join(','));
};
﻿
;(function () {

    var stringEmpty = "",
        toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty,
        noop = function () { },
        undefined;

    var _makeAutoIdTemp = 0, _makeAutoIdTempPointer = 0;

    var bingo = window.bingo = window.bingo = {
        //主版本号.子版本号.修正版本号.编译版本号(日期)
        version: { major: 1, minor: 2, rev: 1, build: 151016, toString: function () { return [this.major, this.minor, this.rev, this.build].join('.'); } },
        ///<field>调试开关, 默认false</field>
        isDebug: false,
        ///<field>产品版本号</field>
        prdtVersion: '',
        ///<field>支持chorme workspace开发, 默认false</field>
        supportWorkspace: false,
        ///<field>空串</field>
        stringEmpty: stringEmpty,
        ///<field>空方法</field>
        noop: noop,
        ///<field>换行符</field>
        newLine: "\r\n",
        hasOwnProp: function (obj, prop) {
            /// <summary>
            /// hasOwnProperty
            /// </summary>
            /// <param name="obj"></param>
            /// <param name="prop"></param>
            return core_hasOwn.call(obj, prop);
        },
        trace: function (e) {
            /// <summary>
            /// 处理出错信息
            /// </summary>
            /// <param name="e"></param>
        },
        isType: function (typename, value) {
        	/// <summary>
            /// String, Array, Boolean, Object, RegExp, Date, Function,Number, 兼容
            /// Null, Undefined,Arguments, IE不兼容
        	/// </summary>
        	/// <param name="typename"></param>
        	/// <param name="value"></param>
            return toString.apply(value) === '[object ' + typename + ']';
        },
        isUndefined: function (obj) {
        	/// <summary>
            /// 是否定义
        	/// </summary>
        	/// <param name="obj"></param>
            return (typeof (obj) === "undefined" || obj === undefined);
        },
        isNull: function (obj) {
        	/// <summary>
            /// 是否Null
        	/// </summary>
        	/// <param name="obj"></param>
            return (obj == null || this.isUndefined(obj));
        },
        isBoolean: function (obj) {
        	/// <summary>
            /// 是否Boolean
        	/// </summary>
        	/// <param name="obj"></param>
            return this.isType("Boolean", obj);
        },
        isNullEmpty: function (s) {
            ///<summary>是否空串</summary>
            /// <param name="s"></param>
            return (this.isNull(s) || s == stringEmpty);
        },
        isFunction: function (fun) {
            /// <summary>
            /// 是否为方法
            /// </summary>
            /// <param name="fun"></param>
            return this.isType("Function", fun);
        },
        isNumeric: function (n) {
        	/// <summary>
            /// 是否为数字
            /// </summary>
        	/// <param name="n"></param>
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isString: function (obj) {
        	/// <summary>
            /// 是否为字串
            /// </summary>
        	/// <param name="obj"></param>
            return this.isType("String", obj);
        },
        isObject: function (obj) {
        	/// <summary>
            /// 是否Object
            /// </summary>
        	/// <param name="obj"></param>
            return !this.isNull(obj) && this.isType("Object", obj);
        },
        isPlainObject: function (obj) {
            /// <summary>
            /// 是否{}创建的对象
            /// </summary>
            /// <param name="obj"></param>
            return true;
        },
        isArray: function (value) {
        	/// <summary>
        	/// 是否数组
        	/// </summary>
        	/// <param name="value"></param>
            return Array.isArray ? Array.isArray(value) : this.isType("Array", value);
        },
        isWindow: function (obj) {
        	/// <summary>
        	/// 是否window对象
        	/// </summary>
        	/// <param name="obj"></param>
            return !this.isNull(obj) && obj == obj.window;
        },
        isElement: function (obj) {
        	/// <summary>
        	/// 是否Dom元素
        	/// </summary>
        	/// <param name="obj"></param>
            var t = obj && (obj.ownerDocument || obj).documentElement; return t ? true : false;
        },
        trim: function (str) {
        	/// <summary>
        	/// 去除字串前后空白
        	/// </summary>
        	/// <param name="str"></param>
            return this.isString(str) ? str.replace(/(^\s*)|(\s*$)|(^\u3000*)|(\u3000*$)|(^\ue4c6*)|(\ue4c6*$)/g, '') : this.isNull(str) ? '' : str.toString();
            //return str;
        },
        isStringEquals: function (str1, str2) {
            /// <summary>
            /// 字串是否相等, 不分大小写
            /// </summary>
            /// <param name="str1"></param>
            /// <param name="str2"></param>

            return true;
        },
        replaceAll: function (s, str, repl, flags) {
            /// <summary>
            /// 字串替换, 替换所有匹配内容
            /// </summary>
            /// <param name="s"></param>
            /// <param name="str"></param>
            /// <param name="repl"></param>
            /// <param name="flags">默认g, (gmi)</param>
            return '1';
        },
        inArray: function (element, list, index, rever) {
            /// <signature>
            /// <summary>
            /// 返回在数组里的索引
            /// </summary>
            /// <param name="element"></param>
            /// <param name="list"></param>
            /// <param name="index">开始位置</param>
            /// <param name="rever">反向</param>
            /// </signature>
            /// <signature>
            /// <summary>
            /// 返回在数组里的索引
            /// </summary>
            /// <param name="callback" type="function(item, index)"></param>
            /// <param name="list"></param>
            /// <param name="index">开始位置</param>
            /// <param name="rever">反向</param>
            /// </signature>
            if (this.isFunction(element)) intellisenseSetCallContext(element, list[0], [list[0], 0]);
            return 0;
        },
        toStr: function (p) { return this.isUndefined(p) ? '' : p.toString(); },
        removeArrayItem: function (element, list) {
        	/// <summary>
            /// 删除数组(所有element)元素
        	/// </summary>
        	/// <param name="element"></param>
        	/// <param name="list"></param>
            /// <returns value='list'></returns>
        },
        sliceArray: function (args, pos, count) {
            /// <summary>
            /// 提取数组, 支持arguments
            /// </summary>
            /// <param name="args"></param>
            /// <param name="pos">开始位置, 如果负数从后面算起</param>
            /// <param name="count">可选, 默认所有</param>
            isNaN(pos) && (pos = 0);
            isNaN(count) && (count = args.length);
            if (pos < 0) pos = count + pos;
            if (pos < 0) pos = 0;
            return Array.prototype.slice.call(args, pos, pos + count);
        },
        makeAutoId: function () {
        	/// <summary>
        	/// 随机ID
        	/// </summary>
        	/// <returns value='"0"'></returns>
        },
        each: function (list, callback, index, rever) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="list"></param>
            /// <param name="callback" type="function(item, index)"></param>
            /// <param name="index">开始位置, 如果负数从后面算起</param>
            /// <param name="rever">反向</param>

            //callback(data, index){this === data;}
            if (this.isNull(list)) return;
            var temp = null;
            for (var i = 0, len = list.length; i < len; i++) {
                temp = list[i];
                callback && callback.call(temp, temp, 0)

            }
            //var temp = list[0];
            //callback && callback.call(temp, temp, 0)
        },
        eachProp: function (obj, callback) {
            /// <summary>
            /// 遍历对象属性Plain Object
            /// </summary>
            /// <param name="list"></param>
            /// <param name="callback" type="function(item, name)"></param>
            /// <param name="name">属性名称</param>
            if (!obj) return;
            var item;
            for (var n in obj) {
                if (obj.hasOwnProperty(n)) {
                    item = obj[n];
                    if (callback.call(item, item, n) === false) break;
                }
            }
            
            callback && intellisenseSetCallContext(callback, {}, [{}, '1']);
        },
        htmlEncode: function (str) {
            return '1';
        },
        htmlDecode: function (str) {
            return '1';
        },
        urlEncode: function (str) {
            return '1';
        },
        urlDecode: function (str) {
            return '1';
        },
        clearObject: function (obj) {
        	/// <summary>
        	/// 对象全部属性设置为null
        	/// </summary>
        	/// <param name="obj"></param>
        },
        extend: function (obj) {
        	/// <summary>
        	/// 扩展属性, 只有一个参数扩展到bing, 两个以上参数, 扩展到第一个参数
        	/// </summary>
            var len = arguments.length;
            if (len <= 0) return obj;
            if (len == 1) {
                for (var n0 in obj) {
                    if (obj.hasOwnProperty(n0)) {
                        this[n0] = obj[n0];
                        if (this.isFunction(obj[n0]))
                            intellisenseSetCallContext(obj[n0], this);
                    }
                }
                return this;
            }
            var ot = null;
            for (var i = 1; i < len; i++) {
                ot = arguments[i];
                if (!this.isNull(ot)) {
                    for (var n in ot) {
                        if (ot.hasOwnProperty(n)) {
                            obj[n] = ot[n];
                        };
                    }
                }
            }
            for (var n in obj) {
                if (obj.hasOwnProperty(n) && this.isFunction(obj[n])) {
                    intellisenseSetCallContext(obj[n], obj);
                }
            }
            return obj;
        },
        clone: function (obj, deep, ipo) {
        	/// <summary>
        	/// 只复制planeObj, Array等基础类型变量
        	/// </summary>
        	/// <param name="obj"></param>
            /// <param name="deep">深层复制, 默认为true</param>
            /// <param name="ipo">是否isPlainObject, 默认为false</param>
            return _clone.clone(obj, deep);
        },
        proxy: function (owner, fn) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="owner"></param>
            /// <param name="fn"></param>
            fn && fn.apply(owner, []);
            return function () { return fn && fn.apply(owner, []); };
        }
    };

    //解决多版共存问题
    var majVer = ['bingoV' + bingo.version.major].join(''),
        minorVer = [majVer, bingo.version.minor].join('_');
    window[majVer] = window[minorVer] = bingo;

    var _clone = {
        isCloneObject: function (obj) {
            return bingo.isObject(obj) && !bingo.isWindow(obj) && !bingo.isElement(obj);
        },
        clone: function (obj, deep) {
            if (!obj)
                return obj;
            else if (bingo.isArray(obj))
                return this.cloneArray(obj, deep);
            else if (this.isCloneObject(obj))
                return this.cloneObject(obj, deep);
            else
                return obj;
        },
        cloneObject: function (obj, deep) {
            var to = {};
            var t = null;
            for (var n in obj) {
                if (obj.hasOwnProperty(n)){
                    t = obj[n];
                    if (deep !== false) {
                        t = this.clone(t, deep);
                    }
                    to[n] = t;
                }
            }
            t = null;
            return to;
        },
        cloneArray: function (list, deep) {
            var lt = [];
            var t = null;
            var len = list.length;
            for (var i = 0; i < len; i++) {
                t = list[i];
                if (deep !== false) {
                    t = this.clone(t, deep);
                }
                lt.push(t);
            }
            return lt;
        }
    };


})();
﻿
(function (bingo) {

    bingo.datavalue = function (data, name, value) {
        /// <signature>
        /// <summary>
        /// datavalue(obj, "data.aaa"), 取值
        /// </summary>
        /// <param name="data"></param>
        /// <param name="name"></param>
        /// </signature>
        /// <signature>
        /// <summary>
        /// datavalue(obj, "data.aaa", 1), 设置值
        /// </summary>
        /// <param name="data"></param>
        /// <param name="name"></param>
        /// <param name="value"></param>
        /// </signature>
    };

})(bingo);
﻿
(function (bingo) {

    bingo.Event = function (owner) {
        /// <summary>
        /// 创建事件
        /// </summary>
        /// <param name="owner"></param>

        var fn = function (callback) {
            /// <summary>
            /// 绑定事件
            /// </summary>
            /// <param name="callback">可选, 绑定事件</param>
            callback && fn.on(callback);
            callback && intellisense.setCallContext(callback, { thisArg: fn._this() });
            return arguments.length == 0 ? fn : this;
        };

        fn.__bg_isEvent__ = true;
        fn.__eventList__ = eList || [];
        bingo.extend(fn, _eventDefine);
        fn.owner(owner);

        return fn;
    };
    bingo.isEvent = function (ev) {
        /// <summary>
        /// 是否Event
        /// </summary>
        /// <param name="ev"></param>
        return ev && ev.__bg_isEvent__ === true;
    };

    var _eventDefine = {
        _end: false,
        _endArg: undefined,
        //设置或获取owner
        owner: function (owner) {
            if (arguments.length == 0)
                return this.__owner__;
            else {
                this.__owner__ = owner;
                return this;
            }
        },
        _this: function () { return this.owner() || this; },
        on: function (callback) {
            /// <summary>
            /// 绑定事件
            /// </summary>
            /// <param name="callback" type="function()"></param>
            if (callback) {
                this._checkEnd(callback) || this.__eventList__.push({ one: false, callback: callback });
            }
            callback && intellisense.setCallContext(callback, { thisArg: this._this() });
            return this;
        },
        one: function (callback) {
            /// <summary>
            /// 绑定事件
            /// </summary>
            /// <param name="callback" type="function()"></param>
            if (callback) {
                this._checkEnd(callback) || this.__eventList__.push({ one: true, callback: callback });
            }
            callback && intellisense.setCallContext(callback, { thisArg: this._this() });
            return this;
        },
        off: function (callback) {
            /// <summary>
            /// 解除绑定事件
            /// </summary>
            /// <param name="callback">可选, 默认清除所有事件callback</param>
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
        end: function (args) {
            /// <summary>
            /// end([arg1, arg2, ....]), 结束事件, 先解除绑定事件, 以后绑定事件马上自动确发, 用于ready之类的场景
            /// </summary>
            /// <param name="args">可选, 传送参数, [arg1, arg2,...]</param>
            this._end = true; this._endArg = args;

            this.trigger(args);
            this.off();
            return this;
        },
        trigger: function () {
            /// <summary>
            /// 触发事件, 返回最后一个事件值, 事件返回false时, 中断事件
            /// trigger([arg1, arg2, ....])
            /// </summary>
            var list = this.__eventList__, ret = null,
            eventObj = null, reList = null,
            $this = this._this();
            bingo.each(list, function(eventObj){

                if (eventObj.one === true) {
                    reList || (reList = this.__eventList__);
                    reList = bingo.removeArrayItem(eventObj, reList);
                }
                if ((ret = eventObj.callback.apply($this, arguments[0] || [])) === false) break;
            });
            reList && (this.__eventList__ = reList);
            return ret;
        },
        triggerHandler: function () {
            /// <summary>
            /// 触发第一事件, 并返回值, var b = triggerHandler([arg1, arg2, ....])
            /// </summary>
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
            /// <summary>
            /// 复制
            /// </summary>
            /// <param name="owner">新的owner</param>
            return bingo.Event(owner || this.owner(), this.__eventList__);
        },
        //绑定事件数量
        size: function () { return 1; }
    };

})(bingo);
﻿
(function (bingo) {
    //version 1.0.1
    "use strict";

    var _isVar_ = 'isVar1212';
    bingo.isVariable = function (p) {
        /// <summary>
        /// 是否增强变量(variable)
        /// </summary>
        /// <param name="p"></param>
        return p && p._isVar_ == _isVar_;
    };
    bingo.variableOf = function (p) {
        /// <summary>
        /// 返回变通JS变量
        /// </summary>
        /// <param name="p">可以JS变量或variable</param>
        return bingo.isVariable(p) ? p() : p;
    };

    /*
        观察变量: bingo.variable
        提供自由决定change状态, 以决定是否需要同步到view层
        使用$setChange方法设置为修改状态
    */
    var _variable = bingo.variable = function (p, owner, view) {
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
                    fn._onAssign && fn._onAssign().trigger([p1]);
                fn.owner = null;
                return fn.$owner() || this;;
            }
        };
        fn._isVar_ = _isVar_;
        fn.value = value;
        fn._isChanged = true;
        bingo.extend(fn, _variableDefine);

        _extend && bingo.extend(fn, _extend);

        fn.$owner(owner).$view(view);
        fn(value);

        return fn;
    };
    var _extend = null;
    _variable.extend = function (ex) {
        /// <summary>
        /// 扩展variable, bingo.variable.extend({ test: function () { }});
        /// </summary>
        if (!ex) return;
        _extend = bingo.extend(_extend || {}, ex);
    };

    var _variableDefine = {
        size: function () {
            return 1;
        },
        $off: function (callback) {
            /// <summary>
            /// 取消订阅
            /// </summary>
            /// <param name="callback">可选, 如果不传则取消所有订阅</param>

            return this;
        },
        $assign: function (callback, disposer, priority) {
            /// <summary>
            /// 赋值事件(当在赋值时, 不理值是否改变, 都发送事件)
            /// </summary>
            /// <param name="callback" type="function(value)"></param>
            /// <param name="disposer">可选， 当disposer.isDisposed时自动释放</param>
            /// <param name="priority">优先级, 越大越前, 默认50</param>

            bingo.isFunction(callback) && intellisenseSetCallContext(callback, this, [this.$get()]);
            return this;
        },
        $subs: function (callback, disposer, priority) {
            /// <summary>
            /// 改变值事件(当在赋值时, 只有值改变了, 才发送事件)
            /// </summary>
            /// <param name="callback" type="function(value)"></param>
            /// <param name="disposer">可选， 当disposer.isDisposed时自动释放</param>
            /// <param name="priority">优先级, 越大越前, 默认50</param>

            bingo.isFunction(callback) && intellisenseSetCallContext(callback, this, [this.$get()]);
            return this;
        },
        //设置修改状态
        $setChange: function (isChanged) {
            /// <summary>
            /// 设置修改状态
            /// </summary>
            /// <param name="isChanged">可选， 默认为true</param>

            return this;
        },
        $get: function (fn) {
            /// <summary>
            /// 设置或获取值fn
            /// </summary>
            /// <param name="fn" type="function()" value='fn.call(this)'></param>
            if (arguments.length == 0) {
                return this._get_ ? this._get_.call(this) : this.value;
            } else {
                bingo.isFunction(fn) && (this._get_ = fn);
                return this;
            }
        },
        $set: function (fn) {
            /// <summary>
            /// 设置fn
            /// </summary>
            /// <param name="fn" type="function(value)" value='fn.call(this)'></param>
            if (bingo.isFunction(fn)) {
                this._set_ = fn;
                this(this.$get());
            }
            return this;
        },
        $view: function (view) {
            /// <summary>
            /// 设置或获取view
            /// </summary>
            /// <param name="view"></param>
            if (arguments.length > 0) {
                return this._view_;
            } else {
                this._view_ = view;
                return this;
            }
        },
        $owner: function (owner) {
            /// <summary>
            /// 设置或获取owner
            /// </summary>
            /// <param name="owner"></param>
            if (arguments.length == 0) {
                return this._owner_;
            } else {
                this._owner_ = owner;
                return this;
            }
        },
        $linq: function () {
            /// <summary>
            /// 获取一个linq对象
            /// </summary>
            return bingo.linq(this.$get());
        },
        clone: function (owner) {
            /// <summary>
            /// clone, 只复制$get, $set, $owner, $view
            /// </summary>
            /// <param name="owner">新的owner</param>
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

        var item = null;
        for (var n in obj) {
            if (obj.hasOwnProperty(n)) {
                item = obj[n];
                if (!(bingo.isPlainObject(item) || bingo.isArray(item)))
                    prototype[n] = obj[n];
                else
                    property[n] = obj[n];//要分离处理
            }
        }

        intellisenseAnnotate(property, obj);
        //for (var n in prototype) {
        //    if (prototype.hasOwnProperty(n) && bingo.isFunction(prototype[n])) {
        //        intellisenseSetCallContext(prototype[n], prototype);
        //    }
        //}

    }, _proName = '__pro_names__', _extendProp = function (define, obj) {
        //对象定义
        var prototype = define.prototype;

        var proNO = prototype[_proName] ? prototype[_proName].split(',') : [];
        //var item = null;
        //for (var n in obj) {
        //    if (obj.hasOwnProperty(n)) {
        //        item = obj[n];
        //        prototype[n] = _propFn(n, item, prototype);
        //        proNO.push(n);
        //    }
        //}
        bingo.eachProp(obj, function (item, n) {
            prototype[n] = _propFn(n, item, prototype);
            proNO.push(n);
        });
        prototype[_proName] = proNO.join(',');
        intellisenseAnnotate(prototype, obj);

    }, _propFn = function (name, defaultvalue, prototype) {
        var isO = bingo.isObject(defaultvalue),
            $set = isO && defaultvalue.$set,
            $get = isO && defaultvalue.$get,
            fn = null;

        if ($set || $get) {
            fn = function (value) {
                var p = _getProp(this);
                var attr = p.hasOwnProperty(name) ? p[name] : (p[name] = { value: bingo.clone(defaultvalue.value) });
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
            }
            var thisObj = { value: bingo.clone(defaultvalue.value), owner: prototype };
            $set && intellisenseSetCallContext($set, thisObj, [{}]);
            $get && intellisenseSetCallContext($get, thisObj);
        } else {
            fn = function (value) {
                var p = _getProp(this);
                if (arguments.length == 0) {
                    return p.hasOwnProperty(name) ? p[name] : defaultvalue;
                } else {
                    p[name] = value;
                    return this;
                }
            }
        }
        return fn;
    }, _getProp = function (obj) { return obj._bg_prop_ || (obj._bg_prop_ = {}) };

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
            /// <summary>
            /// 定义 Define({ a:1, fn:function(){} })
            /// </summary>
            /// <param name="o"></param>
            _extendDefine(this._define, o);
            return this;
        },
        Initialization: function (callback) {
            /// <summary>
            /// 初始方法, Initialization(function(p){ this.base(p); this.ddd = 2; })
            /// </summary>
            /// <param name="callback"></param>

            this._define.prototype.___Initialization__ = callback;
            //var obj = this._define.NewObject();
            ////for (var n in obj) {
            ////    if (obj.hasOwnProperty(n) && bingo.isFunction(obj[n])) {
            ////        intellisenseSetCallContext(obj[n], obj);
            ////    }
            ////}
            //callback.call(obj);
            return this;
        },
        Static: function (o) {
            /// <summary>
            /// 定义静态， Static({ ss:1, ssFn:function(){} })
            /// </summary>
            /// <param name="o"></param>
            bingo.extend(this._define, o);
            return this;
        },
        Prop: function (o) {
            /// <summary>
            /// 读写属性, Prop({<br />
            ///  vv: 1,<br />
            ///  vt: {<br />
            ///         value: 222,<br />
            ///         $get: function () { return this.value; },<br />
            ///         $set: function (value) { this.value = value; }<br />
            ///     }<br />
            /// })
            /// </summary>
            /// <param name="o"></param>
            _extendProp(this._define, o);
            return this;
        }
    });

    bingo.isClassObject = function (obj) {
        /// <summary>
        /// 是否Class对象
        /// </summary>
        /// <param name="obj"></param>
        return obj && obj.__bg_isObject__ === true;
    };
    bingo.isClass = function (cls) {
        /// <summary>
        /// 是否Class
        /// </summary>
        /// <param name="cls">class</param>
        return cls && cls.__bg_isClass__ === true;
    };
    bingo.Class = function () {
        /// <signature>
        /// <summary>
        /// 定义类, var bClass = bingo.Class(function(){})
        /// </summary>
        /// <param name="func">定义类的方法</param>
        /// </signature>
        /// <signature>
        /// <summary>
        /// 定义类, var bClass = bingo.Class('base.aClass', function(){})
        /// </summary>
        /// <param name="defineName">名称, base.aClass</param>
        /// <param name="func">定义类的方法</param>
        /// </signature>
        /// <signature>
        /// <summary>
        /// 定义类, var bClass = bingo.Class('base.aClass', baseClass, function(){})
        /// </summary>
        /// <param name="defineName">名称, base.aClass</param>
        /// <param name="baseDefine">基类</param>
        /// <param name="func">定义类的方法</param>
        /// </signature>
        /// <signature>
        /// <summary>
        /// 定义类, var bClass = bingo.Class(baseClass, function(){})
        /// </summary>
        /// <param name="baseDefine">基类</param>
        /// <param name="func">定义类的方法</param>
        /// </signature>

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
            /// <summary>
            /// 扩展类, extend({ a:1, fn1:function(){} })
            /// </summary>
            /// <param name="obj"></param>
            _extendDefine(define, obj);
            var def = new define();
            bingo.eachProp(obj, function (item) {
                bingo.isFunction(item) && intellisenseSetCallContext(item, def);
            });
        };
        define.extendProp = function (obj) {
            /// <summary>
            /// 扩展Prop
            /// </summary>
            /// <param name="obj"></param>
            _extendProp(define, obj);
        };
        define.NewObject = function () {
            /// <summary>
            /// 实例化对象
            /// </summary>
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
        intellisense.redirectDefinition(define.prototype.base, baseDefine.prototype.___Initialization__);

        if (!bingo.isNullEmpty(defineName))
            _makeDefine(defineName, define);
        define.NewObject();

        intellisense.redirectDefinition(define.NewObject, define.prototype.___Initialization__);
        intellisense.redirectDefinition(define, define.prototype.___Initialization__);

        return define;
    };


    var _onInit = function (callback) {
        /// <summary>
        /// 初始
        /// </summary>
        /// <param name="callback" type="function(obj)"></param>
        if (callback) {
            this._onInit_ || (this._onInit_ = bingo.Event());
            this._onInit_.on(callback);
            intellisenseSetCallContext(callback, this, [this.NewObject()]);
        }
        return this;
    }, _onDispose = function (callback) {
        /// <summary>
        /// 销毁
        /// </summary>
        /// <param name="callback" type="function(obj)"></param>
        if (callback) {
            this._onDispose_ || (this._onDispose_ = bingo.Event());
            this._onDispose_.on(callback);
            intellisenseSetCallContext(callback, this, [this.NewObject()]);
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
        for (var n in source)
            if (source.hasOwnProperty(n) && !target.hasOwnProperty(n))
                target[n] = source[n];
    };
    bingo.Class.makeDefine = function (defineName, define) { _makeDefine(defineName, define); };

    //定义基础类
    bingo.Class.Base = bingo.Class(function () {

        this.Define({
            __bg_isObject__: true,
            //已经释放
            isDisposed: false,
            //释放状态, 0:未释放, 1:释放中, 2:已释放
            disposeStatus: false,
            dispose: function () {
                /// <summary>
                /// 释放对象
                /// </summary>
                if (!this.isDisposed) {
                    bingo.clearObject(this);
                    this.isDisposed = true;
                    this.dispose = bingo.noop;
                }
            },
            onDispose: function (callback) {
                /// <summary>
                /// 释放对象事件
                /// </summary>
                /// <param name="callback" value='callback.call(this)'></param>
                return this.on('$dispose', callback);
            },
            disposeByOther: function (obj) {
                /// <summary>
                /// 当obj释放时释放这个对象
                /// </summary>
                /// <param name="obj"></param>
                return this;
            },
            $prop: function (o) {
                /// <summary>
                /// 设置或获取Prop所有属性
                /// </summary>
                /// <param name="o"></param>
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
                /// <summary>
                /// 取得事件
                /// </summary>
                /// <param name="name">事件名称</param>
                return bingo.Event(this);
            },
            hasEvent: function (name) {
                /// <summary>
                /// 是否有事件
                /// </summary>
                /// <param name="name"></param>
                /// <returns value='Boolean'></returns>
                return true;
            },
            on: function (name, callback) {
                /// <summary>
                /// 绑定事件
                /// </summary>
                /// <param name="name">事件名称</param>
                /// <param name="callback"></param>
                callback && intellisenseSetCallContext(callback, this);
                return this;
            },
            one: function (name, callback) {
                /// <summary>
                /// 绑定事件
                /// </summary>
                /// <param name="name">事件名称</param>
                /// <param name="callback"></param>
                callback && intellisenseSetCallContext(callback, this);
                return this;
            },
            off: function (name, callback) {
                /// <summary>
                /// 解除事件
                /// </summary>
                /// <param name="name">事件名称</param>
                /// <param name="callback">可选</param>
                callback && intellisenseSetCallContext(callback, this);
                return this;
            },
            end: function (name, args) {
                /// <summary>
                /// end('ready', [arg1, arg2, ....]), 结束事件, 先解除绑定事件, 以后绑定事件马上自动确发, 用于ready之类的场景
                /// </summary>
                /// <param name="name">事件名称</param>
                /// <param name="args">可选, 传送参数, [arg1, arg2,...]</param>
                return this;
            },
            trigger: function (name, args) {
                /// <summary>
                /// 触发事件, trigger('click', [a, b, c])
                /// 返回最后事件结果，返回false中止事件
                /// </summary>
                /// <param name="name"></param>
                /// <param name="args">多个参数,[a, b, ....]</param>
                return {};
            },
            triggerHandler: function (name, args) {
                /// <summary>
                /// 触发第一事件, 并返回值, triggerHandler('click', [a, b, c]);
                /// </summary>
                /// <param name="name"></param>
                /// <param name="args">多个参数,[a, b, ....]</param>
                return {};
            }
        });
    });


    bingo.Class.Define = function (define) {
        /// <summary>
        /// 定义类(另一方法)
        /// bingo.Class.Define({<br />
        ///        $base: aCls,<br />
        ///        $init: function () {<br />
        ///        },<br />
        ///        $var: {<br />
        ///             p:1<br />
        ///        },<br />
        ///        $dispose: function () {<br />
        ///        },<br />
        ///        $static: {<br />
        ///                a: 1,<br />
        ///                fn: function () { }<br />
        ///        },<br />
        ///        fn: function () { }<br />
        ///    })
        /// </summary>
        /// <param name="define"></param>
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
                /// <summary>
                /// 合并数组<br />
                /// concat(obj)<br />
                /// concat([obj1, obj2])
                /// </summary>
                /// <param name="p">可以单个元素或数组</param>
                /// <param name="isBegin">可选，是否合并到前面， 默认false</param>
                return this;
            },
            _backup: null,
            backup: function () {
                /// <summary>
                /// 备份当前数据，供restore使用
                /// </summary>
                return this;
            },
            restore: function (isNotExsit) {
                /// <summary>
                /// 恢复backup备份数据
                /// </summary>
                /// <param name="isNotExsit">可选， 如果当前结果没有可用数据， 才恢复， 默认false直接恢复</param>
                return this;
            },
            each: function (fn, index, rever) {
                /// <summary>
                /// each(function(item, index){ item.count++; });
                /// </summary>
                /// <param name="fn" type="function(item, index)"></param>
                /// <param name="index">开始位置, 如果负数从后面算起</param>
                /// <param name="rever">反向</param>
                if (this._datas.length > 0) {
                    intellisense.setCallContext(fn, { thisArg: this._datas[0], args: [this._datas[0], 0] });
                }
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
                if (this._datas.length > 0) {
                    intellisense.setCallContext(fn, { thisArg: this._datas[0], args: [this._datas[0], 0] });
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
                /// <param name="isMerge">可选, 是否合并数组, 默认false</param>
                if (this._datas.length > 0) {
                    if (isMerge === true)
                        this._datas = this._datas.concat([fn.call(this._datas[0], this._datas[0], 0)]);
                    else
                        this._datas = [fn.call(this._datas[0], this._datas[0], 0)];
                }
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
                if (this._datas.length > 0) {
                    intellisense.setCallContext(fn, { thisArg: this._datas[0], args: [this._datas[0], this._datas[0]] });
                }
                return this;
            },
            sortAsc: function (p) {
                /// <summary>
                /// 从小到大排序<br />
                /// sortAsc('max')<br />
                /// sortAsc()<br />
                /// sortAsc(function(item){ return item.max; })
                /// </summary>
                /// <param name="p">属性名称/function(item)</param>
                var isFn = bingo.isFunction(p);
                if (isFn)
                    if (this._datas.length > 0) {
                        intellisense.setCallContext(p, { thisArg: this._datas[0], args: [this._datas[0], 0] });
                    }
                return this;
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
                if (isFn)
                    if (this._datas.length > 0) {
                        intellisense.setCallContext(p, { thisArg: this._datas[0], args: [this._datas[0]] });
                    }
                return this;
            },
            unique: function (fn) {
                /// <summary>
                /// 去除重复<br />
                /// 用法1. unique()<br />
                /// 用法2. unique('prop')<br />
                /// 用法3. unique(function(item, index){ return item.prop; });
                /// </summary>
                /// <param name="fn" type="function(item, index)">可选</param>
                if (bingo.isFunction(fn))
                    if (this._datas.length > 0) {
                        intellisense.setCallContext(fn, { thisArg: this._datas[0], args: [this._datas[0], 0] });
                    }
                return this;
            },
            count: function () { return 1; },
            first: function (defaultValue) {
                /// <summary>
                /// 查找第一个数据
                /// </summary>
                /// <param name="defaultValue">可选, 默认值, 如果没有查找到时</param>
                return this._datas[0];
            },
            last: function (defaultValue) {
                /// <summary>
                /// 查找最后一个数据
                /// </summary>
                /// <param name="defaultValue">可选, 默认值, 如果没有查找到时</param>
                return this._datas[0];
            },
            contain: function () {
                /// <summary>
                /// 是否存在数据
                /// </summary>
                return true;
            },
            index: function () {
                /// <summary>
                /// 索引
                /// </summary>
                return 1;
            },
            sum: function (callback) {
                /// <summary>
                /// 求和
                /// 用法1. sum()<br />
                /// 用法1. sum('n')<br />
                /// 用法2. sum(function(item, index){return item.n})
                /// </summary>
                /// <param name="callback" type="function(item, index)">可选</param>
                if (bingo.isFunction(callback))
                    if (this._datas.length > 0) {
                        intellisense.setCallContext(callback, { thisArg: this._datas[0], args: [this._datas[0], 0] });
                    }
                return 1;
            },
            avg: function (callback) {
                /// <summary>
                /// 平均值
                /// 用法1. avg()<br />
                /// 用法1. avg('n')<br />
                /// 用法2. avg(function(item, index){return item.n})
                /// </summary>
                /// <param name="callback" type="function(item, index)">可选</param>
                if (bingo.isFunction(callback))
                    if (this._datas.length > 0) {
                        intellisense.setCallContext(callback, { thisArg: this._datas[0], args: [this._datas[0], 0] });
                    }
                return 1;
            },
            take: function (pos, count) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="pos">开始位置</param>
                /// <param name="count">可选， 取得数量， 默认全部</param>
                return this._datas;
            },
            toArray: function () { return this._datas; },
            toPage: function (page, pageSize) {
                /// <summary>
                /// 分页, toPage(1, 10)
                /// </summary>
                /// <param name="page">当前页, 从一开始</param>
                /// <param name="pageSize">每页记录数</param>
                return {
                    currentPage: 1, totalPage: 1, pageSize: 10,
                    totals: 1, list: this._datas
                };
            },
            group: function (callback, groupName, itemName) {
                /// <summary>
                /// 用法1. group('type', 'group', 'items')<br />
                /// 用法2. group(function(item, index){ return item.type; }, 'group', 'items');
                /// </summary>
                /// <param name="callback" type="function(item index)">function(item index){ return item.type;}</param>
                /// <param name="groupName">可选, 分组值, 默认group</param>
                /// <param name="itemName">可选, 分组内容值, 默认items</param>

                groupName || (groupName = 'group');
                itemName || (itemName = 'items');
                var obj = {};
                obj[groupName] = 'group';
                obj[groupName + 'Data'] = this._datas ? this._datas[0] : {};
                obj[itemName] = this._datas;

                this._datas = [obj];

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
(function (bingo) {

    bingo.extend({
        equals: function (o1, o2) {
        	/// <summary>
        	/// 是否相等, 深比较
        	/// </summary>
        	/// <param name="o1"></param>
        	/// <param name="o2"></param>
            return true;
        }
    });

})(bingo);
﻿
(function (bingo) {
    bingo.fetch = function (url, callback, charset) {
        /// <summary>
        /// fetch("aaa.js", function(url, id,  node){});
        /// </summary>
        /// <param name="url">url</param>
        /// <param name="callback" type="function(url, id, node)">callback</param>
        /// <param name="charset">编码, utf-8</param>
        intellisenseSetCallContext(callback, window, ["", "", window.document.documentElement]);
    }

})(bingo);
﻿/*
    //加载/js/c.js和/js/d.js
    bingo.using("/js/c.js", "d.js");//d.js会相对于c.js路径

    //加载完成处理
    bingo.using("/js/c.js", "d.js", function(){console.log('加载完成')});
    
    //加载完成处理优先级
    bingo.using("/js/c.js", "d.js", function(){console.log('加载完成')}, bingo.usingPriority.Normal);

    //使用map, 合并js时用, 以下是将, equals.js和JSON.js, 影射到equals1.js
    bingo.usingMap("%bingoextend%/equals1.js", ["%bingoextend%/equals.js", "%jsother%/JSON.js"]);
*/

(function (bingo) {
    //version 1.0.1

    bingo.extend({
        using: function (jsFiles, callback, priority) {
        	/// <summary>
            /// 引用JS <br />
            /// bingo.using("/js/c.js", "d.js"， function(){}, bingo.envPriority.Normal) <br />
            /// bingo.using(["/js/c.js", "d.js"]， function(){}, bingo.envPriority.Normal)
        	/// </summary>
        	/// <param name="jsFiles">文件， 可以多个。。。</param>
        	/// <param name="callback">加载完成后</param>
            /// <param name="priority">优先级</param>

            bingo.isFunction(callback) && callback();

            //if (arguments.length <= 0) return;
            //var item = null;
            //for (var i = 0, len = arguments.length; i < len; i++) {
            //    item = arguments[i];
            //    if (item) {
            //        if (bingo.isFunction(item)) {
            //            item(); return;
            //        }
            //    }
            //}
        },
        makeRegexMapPath: function (path) {
            /// <summary>
            /// 生成路径中包函?和*代换正规对象
            /// 注竟不要传入url qurey部分, 如: ?aaa=*&bbb=111
            /// </summary>
            /// <param name="path"></param>

            return new RegExp();
        },
        isRegexMapPath: function (path) {
            /// <summary>
            /// 是否可以生成路径代替符, 如果包函?和*字符
            /// 注竟不要传入url qurey部分, 如: ?aaa=*&bbb=111
            /// </summary>
            /// <param name="path"></param>
            return true;
        },
        usingMap: function (mapPath, path) {
            /// <signature>
            /// <summary>
        	/// 路径映射
        	/// </summary>
            /// <param name="mapPath">映射路径</param>
            /// <param name="paths">一组原路径..., ["a.js", "b.js"...]</param>
            /// </signature>
            /// <signature>
        },
        //using优先级
        usingPriority: {
            First: 0,
            NormalBefore: 45,
            Normal: 50,
            NormalAfter: 55,
            Last: 100
        },
        path: function (a) {
            /// <signature>
            /// <summary>
            /// 取得路径
            /// </summary>
            /// <param name="path" type="String">"%root%/aa.js"</param>
            /// </signature>
            /// <signature>
            /// <summary>
            /// 设置路径变量
            /// </summary>
            /// <param name="pathObject" type="Object">设置路径变量, {root:"/html/test", jspath:"%root%/js"}</param>
            /// </signature>
            /// <signature>
            /// <summary>
            /// 设置路径变量
            /// </summary>
            /// <param name="varname" type="String">root</param>
            /// <param name="path" type="String">/html/test, 或 %c%/aaa</param>
            /// </signature>
            return this.stringEmpty;
        }
    });



})(bingo);
﻿
(function (bingo) {

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
        /// <signature>
        /// <summary>
        /// 取得路径
        /// </summary>
        /// <param name="url" type="String">route url: view/system/user/list</param>
        /// </signature>
        /// <signature>
        /// <summary>
        /// 添加或设置路由
        /// </summary>
        /// <param name="name" type="String">路由名称， 如果已经存在为修改路由</param>
        /// <param name="context" type="Object">路由参数, {url:'view/{module}', toUrl:'', defaultValue:{}}, toUrl可以为function(url, params)</param>
        /// </signature>
        if (arguments.length == 1)
            return '/';
    };

    var _getActionContext = function () {
        
        return {
            app:bingo.defaultApp(),
            module: bingo.defaultModule(),
            controller: bingo.defaultModule().controller('_getActionContext'),
            action: function () { }
        };
    };
    /*
        //根据url生成routeContext;
        var routeContext = bingo.routeContext('view/system/user/list');
            返回结果==>{
                url:'view/system/user/list',
                toUrl:'modules/system/views/user/list.html',
                params:{ module: 'system', controller: 'user', action: 'list', queryParams:{} }
            }
    */
    //

    bingo.routeContext = function (url) {
        /// <summary>
        /// 根据route url取得解释结果<br />
        /// bingo.routeContext('view/system/user/list')
        /// </summary>
        /// <param name="url"></param>
        return { name: 'view', params: { queryParams: {} }, url: '/', toUrl: '/', actionContext: _getActionContext };
    };

    /*
        //生成路由地址
        bingo.routeLink('view', { module: 'system', controller: 'user', action: 'list' });
            返回结果==>'view/system/user/list'
    */
    bingo.routeLink = function (name, p) {
        /// <summary>
        /// 根据路由参数， 生成路由地址：view/system/user/list<br />
        /// bingo.routeLink('view', { module: 'system', controller: 'user', action: 'list' })
        /// </summary>
        /// <param name="name">路由名称</param>
        /// <param name="p">参数， { module: 'system', controller: 'user', action: 'list' }</param>
        return '/';
    };

    /*
    //生成路由地址query
    bingo.routeLinkQuery('view/system/user/list', { id: '1111' });
        返回结果==>'view/system/user/list$id:1111'
    */

    bingo.routeLinkQuery = function (url, p) {
        /// <summary>
        /// 生成路由地址query <br />
        /// bingo.routeLinkQuery('view/system/user/list', { id: '1111' })
        /// </summary>
        /// <param name="url"></param>
        /// <param name="p"></param>
        return '/';
    };

})(bingo);
﻿
(function (bingo) {
    bingo.cacheToObject = function (obj) {
        /// <summary>
        /// 缓存到obj, bingo.cache(obj).key('bbbb').context(function(){return '2';}).max(2).get();
        /// </summary>
        /// <param name="obj">缓存到的obj</param>
        return obj && obj.__bg_cache__ ?
            obj.__bg_cache__
            : (obj.__bg_cache__ = _cacheClass.NewObject());
    };

    var _cacheClass = bingo.Class(function () {

        this.Prop({
            //最大缓存数, 默认不限数量（0及以下）
            max: 0,
            context: null
        });

        this.Define({
            key: function (key) {
                /// <summary>
                /// key, 可以多个参数, key(regionId, 'two')
                /// </summary>
                /// <param name="key"></param>
                if (arguments.length == 0)
                    return ' ';
                else {
                    this._key = bingo.sliceArray(arguments, 0).join('_');
                    return this;
                }
            },
            'get': function () {
                /// <summary>
                /// 取得值, bingo.cache(obj).key('bbbb').get()
                /// </summary>
                var context = this.context();
                return context ? context() : this._datas[this._key];
            },
            'set': function (value) {
                /// <summary>
                /// 设置缓存, bingo.cache(obj).key('bbbb').set('11111');
                /// </summary>
                /// <param name="value">值</param>
                this._datas[this._key] = value;
                return this;
            },
            has: function () {
                /// <summary>
                /// 是否有存在缓存, bingo.cache(obj).key('bbbb').has()
                /// </summary>
                return true;
            },
            clear: function () {
                /// <summary>
                /// 清除一个缓存, bingo.cache(obj).key('bbbb').clear()
                /// </summary>
                return this;
            },
            clearAll: function () {
                /// <summary>
                /// 清除所有缓存, bingo.cache(obj).clearAll()
                /// </summary>
                return this;
            }
        });

        this.Initialization(function () {
            this._datas = {};
        });

    });


})(bingo);
﻿
(function (bingo) {
    
    bingo.extend({
        linkToDom: function (jSelector, callback) {
            /// <summary>
            /// 链接到DOM, 当DOM给删除时调用callback
            /// </summary>
            /// <param name="jSelector"></param>
            /// <param name="callback" type="function()"></param>
        },
        unLinkToDom: function (jSelector, callback) {
            /// <summary>
            /// 解除与DOM链接
            /// </summary>
            /// <param name="jSelector"></param>
            /// <param name="callback">可选</param>
        },
        isUnload: false
    });

    bingo.linkToDom.LinkToDomClass = bingo.Class(function () {

        this.Define({
            //是否从dom链接中删除
            isDisposeFormDom: false,
            linkToDom: function (jqSelector) {
                /// <summary>
                /// 联接到DOM, 当DOM给删除时销毁对象, 只能联一个
                /// </summary>
                /// <param name="jqSelector"></param>
                return this;
            },
            unlinkToDom: function () {
                /// <summary>
                /// 解除联接到DOM
                /// </summary>
                return this;
            }
        });

    });

})(bingo);
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
            //action: null,
            //compilePre: null,
            //as:null
            //compile: null,
            //link: null
        };
        fn = fn();
        if (bingo.isFunction(fn) || bingo.isArray(fn)) {
            opt.link = fn;
        } else {
            opt = bingo.extend(opt, fn);
        }
        opt.action && bingo.factory(opt.action);
        opt.compilePre && bingo.factory(opt.compilePre);
        opt.as && bingo.factory(opt.as);
        opt.compile && bingo.factory(opt.compile);
        opt.link && bingo.factory(opt.link);
        return opt;
    }, _commandFn = function (name, fn) {
        /// <summary>
        /// 定义或获取command
        /// </summary>
        /// <param name="name">定义或获取command名称</param>
        /// <param name="fn" type="function()">可选</param>
        if (bingo.isNullEmpty(name)) return;
        name = name.toLowerCase();
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_commands', name);
        else {
            _lastModule = this;
            var cmd = this._commands[name] = _makeCommandOpt(fn);
            _lastModule = null;
            return cmd;
       }
    }, _filterFn = function (name, fn) {
        /// <summary>
        /// 定义或获取filter
        /// </summary>
        /// <param name="name">定义或获取filter名称</param>
        /// <param name="fn" type="function(injects..)">可选</param>
        if (bingo.isNullEmpty(name)) return null;
        if (fn) {
            _lastModule = this;
            bingo.factory(fn);
            _lastModule = null;
        }
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_filters', name);
        else
            return this._filters[name] = fn;
    }, _factoryFn = function (name, fn) {
        /// <summary>
        /// 定义或获取factory
        /// </summary>
        /// <param name="name">定义或获取factory名称</param>
        /// <param name="fn" type="function(injects..)">可选</param>
        var len = arguments.length;
        if (len == 0)
            return this._factorys;
        else if (len == 1) {
            var fa = bingo.factory.factoryClass.NewObject().setFactory(name);
            fa.inject();
            return fa;
        } else {
            if (fn) {
                if (fn === true)
                    return _getModuleValue.call(this, '_factorys', name);
                _lastModule = this;
                bingo.factory(fn);
                _lastModule = null;
            }
            return this._factorys[name] = fn;
        }

    }, _factoryExtendFn = function (name, fn) {
        /// <summary>
        /// 定义或获取factory扩展
        /// </summary>
        /// <param name="name">定义或获取扩展名称</param>
        /// <param name="fn" type="function(injects..)">可选</param>
        if (bingo.isNullEmpty(name)) return;
        if (fn) {
            fn.$owner = { module: this };
            _lastModule = this;
            bingo.factory(fn);
            _lastModule = null;
        }
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_factoryExtends', name);
        else
            return this._factoryExtends[name] = fn;
    }, _serviceFn = function (name, fn) {
        /// <summary>
        /// 定义或获取service
        /// </summary>
        /// <param name="name">定义或获取service名称</param>
        /// <param name="fn" type="function(injects..)">可选</param>
        if (bingo.isNullEmpty(name)) return;
        if (fn) {
            fn.$owner = { module: this };
            _lastModule = this;
            bingo.factory(fn);
            _lastModule = null;
        }
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_services', name);
        else
            return this._services[name] = fn;
    }, _controllerFn = function (name, fn) {
        /// <summary>
        /// 定义或获取controller
        /// </summary>
        /// <param name="name">定义或获取controller名称</param>
        /// <param name="fn" type="function()">可选</param>
        if (bingo.isNullEmpty(name)) return;
        var conroller = this._controllers[name];
        if (!conroller)
            conroller = this._controllers[name] = {
                module: this,
                name: name, _actions: {},
                action: _actionFn
            };
        if (bingo.isFunction(fn)) {
            var hasLM = _lastModule
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
        /// <summary>
        /// 定义或获取action
        /// </summary>
        /// <param name="name">定义或获取action名称</param>
        /// <param name="fn" type="function(injects..)">可选</param>
        if (fn) {
            fn.$owner = { conroller: this, module: this.module };
            _lastModule = this.module;
            bingo.factory(fn);
            _lastModule = null;
        }
        if (arguments.length == 1)
            return this._actions[name];
        else {
            return this._actions[name] = fn;
        }
    }, _actionMDFn = function (name, fn) {
        if (fn) {
            fn.$owner = { conroller: null, module: this };
            _lastModule = this;
            bingo.factory(fn);
            _lastModule = null;
        }
        if (arguments.length == 1)
            return this._actions[name];
        else {
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
        /// <summary>
        /// 定义或获取模块
        /// </summary>
        /// <param name="name">定义或获取模块名称</param>
        /// <param name="fn" type="function(injects..)">可选</param>
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
                app: this
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
        getModuleByView: function (view) {
            return _lastModule || bingo.defaultModule();
        },
        module: function (name, fn) {
            /// <summary>
            /// 定义或获取模块
            /// </summary>
            /// <param name="name">定义或获取模块名称</param>
            /// <param name="fn" type="function(injects..)">可选</param>
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
            /// <summary>
            /// 定义服务service
            /// </summary>
            /// <param name="name">定义服务service名称</param>
            /// <param name="fn" type="function(injects..)"></param>
            var lm = _getLastModule();
            return lm.service.apply(lm, arguments);
        },
        factoryExtend: function (name, fn) {
            /// <summary>
            /// 定义或获取factory扩展
            /// </summary>
            /// <param name="name">定义或获取扩展名称</param>
            /// <param name="fn" type="function(injects..)">可选</param>
            var lm = _getLastModule();
            return lm.factoryExtend.apply(lm, arguments);
        },
        controller: function (name, fn) {
            /// <summary>
            /// 定义服务service
            /// </summary>
            /// <param name="name">定义服务service名称</param>
            /// <param name="fn" type="function(injects..)"></param>
            var lm = _getLastModule();
            return lm.controller.apply(lm, arguments);
        },
        action: function (name, fn) {
            /// <summary>
            /// 定义action
            /// </summary>
            /// <param name="name">定义action名称</param>
            /// <param name="fn" type="function(injects..)"></param>
            if (bingo.isFunction(name) || bingo.isArray(name)) {
                //intellisenseLogMessage('_lastModule', !bingo.isNull(_lastModule));
                //_lastModule = _lastContoller.module;
                bingo.factory(name);
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
            module: null,
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
                var node = document.body,
                    view = bingo.view(),
                    viewnode = view.$viewnode(),
                    attr = bingo.view.viewnodeAttrClass.NewObject(view, viewnode, 'text', '', '$view', null);

                return {
                    node: node,
                    $view: view,
                    $viewnode: viewnode,
                    $attr: attr,
                    $withData: {},
                    $command: null,
                    $injectParam:this.params()
                };
            },
            //注入
            inject: function (owner, retAll) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="owner">默认attr||viewnode||view</param>
                /// <param name="retAll">是否返回注入全部结果，返回Object, 默认false</param>

                //var fn = this.fn();
                var injectObj = this._newInjectObj();
                //intellisenseSetCallContext(fn, this, [injectObj.$view])
                //return;
                var ret = this._inject(owner || injectObj.$view,
                    this.name(), injectObj, {}, true);
                return retAll === true ? injectObj : ret;
            },
            //注入
            _inject: function (owner, name, injectObj, exObject, isFirst) {
                var fn = this.fn();
                var $injects = fn.$injects;
                var $extendFn = null;
                var injectParams = [], $this = this;
                //isFirst && intellisenseLogMessage('injectParams begin', JSON.stringify($injects), fn.toString());
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

                if (isFirst) {
                    //intellisenseLogMessage('injectParams', JSON.stringify($injects), fn.toString());
                    intellisenseSetCallContext(fn, fn.$owner || owner, injectParams);
                    //intellisenseLogMessage('injectParams', JSON.stringify($injects), JSON.stringify(injectParams));
                }
                //else if (bingo.isString(name) && name)
                //    injectObj[name] = ret;

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
                var hasMN = name.indexOf('$') > 0, moduleName = '', nameT = name;
                if (hasMN) {
                    moduleName = name.split('$');
                    nameT = moduleName[1];
                    moduleName = moduleName[0];
                }
                var appI = bingo.getAppByView(this.view());
                var moduleI = hasMN ? appI.module(moduleName) : bingo.getModuleByView(this.view());
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
                var fn = null, exFn;
                if (bingo.isFunction(name) || bingo.isArray(name)) {
                    //支持用法：factory(function(){})
                    fn = _makeInjectAttrs(name);
                    name = '';
                }
                else {
                    fn = this._getFactoryFn(name);
                }
                this.name(name).fn(fn);
                //this.inject();
                //intellisenseSetCallContext(fn, this, [{}]);

                return this;
            }
        });

    });

    var _getInjectFn = function (appI, moduleI, nameT) {
        var moduleDefault = bingo.defaultModule(appI);
        var factorys = moduleI.factory();
        var factorys2 = moduleDefault == moduleI ? null : moduleDefault.factory();

        var fn = factorys[nameT] || (factorys2 && factorys2[nameT]) || moduleI.service(nameT) || (moduleDefault == moduleI ? null : moduleDefault.service(nameT));
        if (fn)
            return fn;
        else
            return _getInjectFn(bingo.defaultApp(), bingo.defaultApp().defaultModule(), nameT);
    }, _getInjectExtendFn = function (appI, moduleI, nameT) {
        var moduleDefault = bingo.defaultModule(appI);
        var fn = moduleI.factoryExtend(nameT) || (moduleDefault == moduleI ? null : moduleDefault.factoryExtend(nameT));

        if (fn)
            return fn;
        else if (appI != bingo.defaultApp())
            return _getInjectExtendFn(bingo.defaultApp(), bingo.defaultApp().defaultModule(), nameT);
        else
            return null;
    };

    bingo.factory.factoryClass = _factoryClass;

    var _injectNoop = function () { };
    _injectNoop.$injects = [];

    var _makeInjectAttrRegx = /^\s*function[^(]*?\(([^)]+?)\)/i,
    _makeInjectAttrs = function (p) {
        if (p && (p.$injects || p.$fn)) return p.$fn || p;

        var fn = _injectNoop;
        if (bingo.isArray(p)) {
            var list = bingo.clone(p, false);
            fn = list.pop();
            fn.$injects = list;
            fn.$owner = p.$owner;
            //intellisenseLogMessage('$injects', JSON.stringify(list), fn.toString());
        } else if (bingo.isFunction(p)) {
            fn = p;
            var s = fn.toString();
            var list = [], fL =null;
            s.replace(_makeInjectAttrRegx, function (findText, find0) {
                if (find0) {
                    fL = find0.split(',');
                    for (var i = 0, len = fL.length; i < len; i++) {
                        list.push(bingo.trim(fL[i]));
                    }
                    //intellisenseLogMessage('find0', find0, list);
                }
            });
            fn.$injects = list;
            //intellisenseLogMessage(JSON.stringify(list), s);
        }
        //intellisenseLogMessage('$injects', JSON.stringify(fn.$injects), fn.toString());
        return fn;
    };

})(bingo);
﻿//todo:
(function (bingo) {
    //version 1.1.0
    "use strict";

    var _isModel_ = 'isModel1212';
    bingo.isModel = function (p) {
        /// <summary>
        /// 是否model
        /// </summary>
        /// <param name="p"></param>
        return p && p._isModel_ == _isModel_;
    };
    bingo.modelOf = function (p) {
        /// <summary>
        /// 将model转成普通object
        /// </summary>
        /// <param name="p">可以任何参数</param>
        p = bingo.variableOf(p); return bingo.isModel(p) ? p.toObject() : p;
    };

    var _toObject = function (obj) {
        var o = obj || {}, val;
        bingo.eachProp(this, function (item, n) {
            if (bingo.isVariable(o[n]))
                o[n](item);
            else if (n != '_isModel_' && n != 'toObject' && n != 'fromObject' && n != '_p_')
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
        /// <summary>
        /// 定义model
        /// </summary>
        /// <param name="p">可以model或object</param>
        /// <param name="view"></param>

        p = bingo.modelOf(p);
        var o = {}, item;
        bingo.eachProp(p, function (item, n) {
            o[n] = bingo.variable(item, o, view);
        });

        intellisenseAnnotate(o, p);

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
        var _newItem = function (watch, context, callback, deep, disposer) {
            return {
                _callback: callback,
                check: function () { return true;},
                dispose: function () { }
            };
        };

        this.Define({
            unSubscribe: function (callback) {
                /// <summary>
                /// 取消订阅
                /// </summary>
                /// <param name="callback">可选, 不传则取消全部订阅</param>
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
                /// <param name="priority">优先级, 越大越前, 默认50</param>
                return _newItem(this, context, callback, deep, disposer);
            },
            publish: function () {
                /// <summary>
                /// 发布信息
                /// </summary>
                return this;
            },
            publishAsync: function () {
                /// <summary>
                /// 异步发布信息
                /// </summary>
                return this;
            }
        });


    });

    bingo.observer = function (view) {
        /// <summary>
        /// 获取一个新observer对象
        /// </summary>
        /// <param name="view"></param>
        return _observerClass.NewObject();
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
        /// <summary>
        /// 
        /// </summary>
        /// <param name="url"></param>
        /// <param name="view">可选, 所属的view</param>
        return _ajaxClass.NewObject(url).view(view);
    };
    bingo.ajaxSync = function (view) {
        /// <summary>
        /// 同步对象
        /// </summary>
        /// <param name="view">可选， 所属的view</param>
        return _ajaxSyncClass.NewObject().view(view).dependent(bingo.noop);
    };
    bingo.ajaxSyncAll = function (p, view) {
        /// <summary>
        /// 全局同步对象
        /// </summary>
        /// <param name="p">可以是function, ajax, ajaxSync</param>
        /// <param name="view">可选， 所属的view</param>
        return _syncAll(p, view);
    };

    var _ajaxBaseClass = bingo.ajax.ajaxBaseClass = bingo.Class(function () {

        this.Define({
            view: function (v) {
                if (arguments.length == 0)
                    return this._view;
                this._view = v;
                return this;
            },
            success: function (callback) {
                /// <summary>
                /// 成功事件
                /// </summary>
                /// <param name="callback" type="function(rs)"></param>
                return this;
            },
            error: function (callback) {
                /// <summary>
                /// 失败事件
                /// </summary>
                /// <param name="callback" type="function(rs)"></param>
                return this;
            },
            alway: function (callback) {
                /// <summary>
                /// 无论成功或失败事件
                /// </summary>
                /// <param name="callback" type="function(rs)"></param>
                return this;
            },
            fromOther: function (ajax) {
                /// <summary>
                /// 从其它ajax设置属性
                /// </summary>
                /// <param name="ajax"></param>
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
            //hold server数据, function(ajax, response, isSuccess, xhr){return return [response, isSuccess, xhr];}
            holdServer: function (ajax, response, isSuccess, xhr) {
                return [response, isSuccess, xhr];
            }
        });

        this.Prop({
            url: 'a.html',
            //是否异步, 默认true
            async: true,
            //请求类型， 默认json
            dataType: 'json',
            //参数
            param: {},
            //缓存到, 默认为null, 不缓存
            cacheTo: null,
            //缓存数量， 小于等于0, 不限制数据, 默认-1
            cacheMax: -1,
            //是否包函url query部分作为key 缓存数据, 默认true
            cacheQurey: true,
            //自定义cache key, 默认为null, 以url为key
            cacheKey: null,
            //hold server数据, function(response, isSuccess, xhr){return return [response, isSuccess, xhr];}
            holdServer: null,
            //处理参数, function(){ return this.param()}
            holdParams: null
        });

        this.Define({
            isCacheData:false,
            addToAjaxSync: function (ajaxSync) {
                /// <summary>
                /// 添加到ajaxSync同步
                /// </summary>
                /// <param name="ajaxSync">可选， 如果空， 添加全局同步</param>
              
                return this;
            },
            post: function () {
                /// <summary>
                /// 使用post方式发关请求
                /// </summary>
                this.post = bingo.noop;
                return this;
            },
            'get': function () {
                /// <summary>
                /// 使用get方式发关请求
                /// </summary>
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
            lastSync: function () {
                var syncList = this._syncList;
                var len = syncList.length;
                return len > 0 ? syncList[len - 1] : null;
            }
        });

        this.Define({
            //解决, 马上成功
            resolve: function () {
            },
            //拒绝, 马上失败
            reject: function () {
            },
            dependent: function (p) {
                /// <summary>
                /// 依赖
                /// </summary>
                /// <param name="p">可以是function, ajax, ajaxSync</param>
                return this;
            },
            addCount: function (n) {
                /// <summary>
                /// 添加计数
                /// </summary>
                /// <param name="n">可选， 默认1</param>
                return this;
            },
            //计数减一, 计数为0时, 解决所有
            decCount: function () {
                return this;
            }
        });

    });

    var _syncAll = function (p, view) {
        if (!p) return null;
      
        return _ajaxSyncClass.NewObject().view(view);
    };

})(bingo);
﻿
(function (bingo, $) {
    //version 1.1.0
    "use strict";

    bingo.extend({
        compile: function (view) {
            /// <summary>
            /// 编译， 当前view
            /// </summary>
            /// <param name="view">可选， 默认bingo.rootView()</param>
            return _compileClass.NewObject().view(view || bingo.rootView());
        },
        tmpl: function (url, view) {
            /// <summary>
            /// 模板管理
            /// </summary>
            /// <param name="url"></param>
            /// <param name="view">可选， 当前view</param>
            return _tmplClass.NewObject().url(url).view(view);
        },
        ready: function (fn) {
            /// <summary>
            /// 准备好
            /// </summary>
            /// <param name="fn"></param>
            fn && fn.call(this);
        }
    });

    bingo.compile.removeNode = function (jqSelector) {
        /// <summary>
        /// 删除节点
        /// </summary>
        /// <param name="jqSelector"></param>
    };

    bingo.compile.getNodeContentTmpl = function (jqSelector) {
        /// <summary>
        /// 获取node的内容为模板
        /// </summary>
        /// <param name="jqSelector"></param>
        return '<br />';
    };

    var _tmplClass = bingo.compile.tmplClass = bingo.Class(bingo.ajax.ajaxClass, function () {

        this.Initialization(function () {
            this.base();
        });
    });
    //tmpl缓存正则
    bingo.compile.tmplCacheMetas = /\.(htm|html|tmpl|txt)(\?.*)*$/i;

    //模板==负责编译======================
    var _compileClass = bingo.compile.templateClass = bingo.Class(function () {

        this.Static({
            cacheMax:100
        });

        this.Prop({
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
            action: function (fn) {
                /// <summary>
                /// 给下一级新的View注入action
                /// </summary>
                /// <param name="fn" type="function(inject...)"></param>
                if (arguments.length == 0) {
                    return this._action;
                } else {
                    fn && bingo.factory(fn);
                    return this;
                }
            },
            fromJquery: function (jqSelector) {
                return this;
            },
            appendTo: function (jqSelector) {
                return this;
            },
            fromNode: function (node) {
                return this;
            },
            fromHtml: function (html) {
                return this;
            },
            onCompilePre: function (callback) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="callback" type='function(jNode)'></param>
                callback && intellisenseSetCallContext(callback, this, [$([])]);
                return this;
            },
            //编译前执行， function
            onCompiled: function (callback) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="callback" type='function(jNode)'></param>
                callback && intellisenseSetCallContext(callback, this, [$([])]);
                return this;
            },
            compile: function () {
                return this;
            }
        });

    });

    //绑定内容解释器==========================
    var _bindClass = bingo.compile.bindClass = bingo.Class(function () {

        //viewnode, viewnodeAttr
        this.Prop({
            view: null,
            node: null,
            viewnode:null,
            //属性原值
            $attrValue: '1'
        });

        this.Define({
            $eval: function (event) {
                /// <summary>
                /// 执行内容, 根据执行返回结果, 会报出错误
                /// </summary>
                /// <param name="event">可选, 事件</param>
                return {};
            },
            $resultsNoFilter: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误, 没有经过过滤器
                /// </summary>
                /// <param name="event">可选, 事件</param>
                return {};
            },
            $results: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误
                /// </summary>
                /// <param name="event">可选, 事件</param>
                return {};
            },
            $getValNoFilter: function () {
                /// <summary>
                /// 返回withData/$view/window属性值, 没有经过过滤器
                /// </summary>
                return {};
            },
            //返回withData/$view/window属性值
            $value: function (value) {
                
                if (arguments.length > 0) {
                    return this;
                } else {
                    return {};
                }

            },
            $filter: function (val) {
                return {};
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
                return bingo.compile.bind(this.view(), this.node(), '111', this.withData());
            },
            $attrValue: function (name, p) {
                if (arguments.length == 1) {
                    return '1111';
                } else {
                    return this;
                }
            },
            //执行内容, 不会报出错误
            $eval: function (name, event, view) {
                return {};
            },
            //执行内容, 并返回结果, 不会报出错误
            $results: function (name, event, view) {
                return {};
            },
            //返回withData/$view/window属性值
            $value: function (name, value) {
                if (!attr) return;
                if (arguments.length == 1)
                    return {};
                else
                    return this;
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

        });
    });

    bingo.compile.bindNode = function (view, node, withData) {
        return _nodeBindClass.NewObject(view, node, withData);
    };

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
        return _view;
    };

    bingo.rootView = function () {
        /// <summary>
        /// 根view
        /// </summary>
        return bingo.view();
    };

    //view==提供视图==================
    var _viewClass = bingo.view.viewClass = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Define({
            onActionBefore: function (callback) {
                /// <summary>
                /// 进入action前事件
                /// </summary>
                /// <param name="callback" type="function()"></param>
                return this;
            },
            onInitDataSrv: function (callback) {
                /// <summary>
                /// 初始数据用事件(用于服务或factory), onInitDataSrv --> onInitData --> onReady
                /// </summary>
                /// <param name="callback" type="function()"></param>
                return this;
            },
            onInitData: function (callback) {
                /// <summary>
                /// 初始数据用事件(用于业务), onInitDataSrv --> onInitData --> onReady
                /// </summary>
                /// <param name="callback" type="function()"></param>
                return this;
            },
            onReady: function (callback) {
                /// <summary>
                /// 本$view准备好后事件
                /// </summary>
                /// <param name="callback" type="function()"></param>
                return this;
            },
            //处理readyAll
            onReadyAll: function (callback) {
                /// <summary>
                /// 本$view，下级$view及要加载的数据准备好后事件
                /// </summary>
                /// <param name="callback" type="function()"></param>
                return this;
            },
            $setModule: function (module) {
                /// <summary>
                /// 设置module
                /// </summary>
                /// <param name="module"></param>
                this._module = module;
                return this;
            },
            $getModule: function () {
                /// <summary>
                /// 获取module
                /// </summary>
                return this._module || bingo.defaultModule(this.$getApp());
            },
            $setApp: function (app) {
                /// <summary>
                /// 设置app
                /// </summary>
                /// <param name="app"></param>
                app && (this._app = app);
                return this;
            },
            $getApp: function () {
                /// <summary>
                /// 获取App
                /// </summary>
                return this._app || (this._module ? this._module.app : bingo.defaultApp());
            },
            $addAction: function (action) {
                /// <summary>
                /// 添加action<br />
                /// $addAction(function($node){ });
                /// </summary>
                /// <param name="action"></param>
                return this;
            },
            $getViewnode: function (node) {
                /// <summary>
                /// 取得view
                /// </summary>
                /// <param name="node">可选, 要原型node</param>
                return this.$viewnode();
            },
            $getNode: function (jqSelector) {
                /// <summary>
                /// 查询本view里所有dom node, 返回jquery对象
                /// </summary>
                /// <param name="jqSelector">可选， 默认取得view所在的dom node</param>
                return $([]);
            },
            //如果准备好了?
            $isReady: true,
            $update: function () {
                /// <summary>
                /// 同步数据
                /// </summary>
                return this.$publish();
            },
            $updateAsync: function () {
                /// <summary>
                /// 同步数据, 异步
                /// </summary>
                return this;
            },
            $apply: function (callback, thisArg) {
                /// <summary>
                /// 执行callback, 并自己同步数据
                /// </summary>
                /// <param name="callback" type="function()"></param>
                /// <param name="thisArg">可选， 设置this对象， 默认view</param>
                if (callback) {
                    callback.apply(thisArg || this);
                }
                return this;
            },
            $proxy: function (callback, thisArg) {
                /// <summary>
                /// 定义callback, 并自己同步数据
                /// </summary>
                /// <param name="callback" type="function()"></param>
                /// <param name="thisArg">可选， 设置this对象， 默认view</param>
                var $view = this;
                return function () {
                    callback.apply(thisArg || this, arguments);
                };
            },
            $publish: function () {
                /// <summary>
                /// 向订阅发布信息
                /// </summary>
                return this;
            },
            $observer: function () {
                /// <summary>
                /// 取得本view的观察者
                /// </summary>
                return bingo.observer(this);
            },
            $subscribe: function (p, callback, deep, disposer, priority) {
                /// <summary>
                /// 订阅
                /// </summary>
                /// <param name="p">可以view的属性名称， 或function(){ return $view.datas; }</param>
                /// <param name="callback" type="function(value)"></param>
                /// <param name="deep">可选， 是否深比较， 默认false</param>
                /// <param name="disposer">释放者， 如果此对象已释放， 订阅自动删除</param>
                /// <param name="priority">优先级, 越大越前, 默认50</param>
                return this.$observer().subscribe(p, callback, deep, disposer, priority);
            },
            $subs: function (p, callback, deep, disposer, priority) {
                /// <summary>
                /// 订阅
                /// </summary>
                /// <param name="p">可以view的属性名称， 或function(){ return $view.datas; }</param>
                /// <param name="callback" type="function(value)"></param>
                /// <param name="deep">可选， 是否深比较， 默认false</param>
                /// <param name="disposer">释放者， 如果此对象已释放， 订阅自动删除</param>
                /// <param name="priority">优先级, 越大越前, 默认50</param>
                return this.$subscribe.apply(this, arguments);
            },
            $using: function (js, callback) {
                /// <summary>
                /// $using异步加载JS， 有同步view启动作用, ready之后， 没有作用
                /// </summary>
                /// <param name="js"></param>
                /// <param name="callback"></param>
                bingo.using(js, function () {
                    callback && callback();
                });
                return this;
            },
            $timeout: function (callback, time) {
                return setTimeout(function () {
                     callback && callback();
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

            this.$children = [];

            this.$node(node).$parentView(parentView);
            this.$viewnode(_viewnodeClass.NewObject());

        });
    });

    //viewnode==管理与node节点连接====================
    var _viewnodeClass = bingo.view.viewnodeClass = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Static({
            vnName: ['bg_cpl_node', bingo.makeAutoId()].join('_'),
            vnDataName: ['bg_domnode', bingo.makeAutoId()].join('_'),
            //向node及node的父层搜索viewnode, node必须原生node
            getViewnode: function (node) {
                /// <summary>
                /// 向node及node的父层搜索viewnode, node必须原生node
                /// </summary>
                /// <param name="node">必须原生node</param>
                return _viewnode;
            },
            setViewnode: function (node, viewnode) {
                /// <summary>
                /// 向node, 缓存viewnode
                /// </summary>
                /// <param name="node">必须原生node</param>
                /// <param name="viewnode"></param>
            },
            removeViewnode: function (viewnode) {
                /// <summary>
                /// 向node, 删除缓存viewnode
                /// </summary>
                /// <param name="viewnode"></param>
            },
            isViewnode: function (node) {
                /// <summary>
                /// 是否viewnode节点
                /// </summary>
                /// <param name="node">必须原生node</param>
            }
        });

        this.Define({
            $getAttr: function (name) {
                return _viewnodeAttr;
            },
            $html: function (html) {
                if (arguments.length > 0) {
                    return this;
                } else
                    return 'aaaa';
            },
            getWithData: function () {
                /// <summary>
                /// withData只在编译时能设置, 之后不能变动
                /// </summary>
                return this._withData;
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

            this.attrList = [];
            this.textList = [];
            this.children = [];

            this._withData = withData || (parentViewnode && parentViewnode.getWithData());

            parentViewnode && parentViewnode.children.push(this);

            this.view(view).node(node).parentViewnode(parentViewnode);

        });
    });

    //viewnode attr====管理与指令连接================
    var _viewnodeAttrClass = bingo.view.viewnodeAttrClass = bingo.Class(bingo.compile.bindClass, function () {

        this.Define({
            onChange: function (callback) {
                /// <summary>
                /// 改变时事件
                /// </summary>
                /// <param name="callback" type="function(value)"></param>
                return this.on('onChange', callback);
            },
            onInit: function (callback) {
                /// <summary>
                /// 初始时事件
                /// </summary>
                /// <param name="callback" type="function(value)"></param>
                return this.on('onInit', callback);
            },
            $subs: function (p, p1, deep) {
                /// <summary>
                /// 观察执行结果
                /// </summary>
                /// <param name="p">可以属性名称或function(){ return datas; }</param>
                /// <param name="p1" type="function(value)">观察到变动时处理, function(value){}</param>
                /// <param name="deep">是否深比较</param>
                return this;
            },
            $subsResults: function (p, deep) {
                /// <summary>
                /// 观察执行结果
                /// </summary>
                /// <param name="p" type="function(value)">观察到变动时处理, function(value){}</param>
                /// <param name="deep">是否深比较</param>
            },
            $subsValue: function (p, deep) {
                /// <summary>
                /// 观察值
                /// </summary>
                /// <param name="p" type="function(value)">观察到变动时处理, function(value){}</param>
                /// <param name="deep">是否深比较</param>
                return this;
            },
            $init: function (p, p1) {
                /// <signature>
                /// <summary>
                /// 根据$attrValue, 做初始化
                /// </summary>
                /// <param name="p" type="function(value)">初始化, function(value){}</param>
                /// </signature>
                /// <signature>
                /// <summary>
                /// 根据p执行结果, 做初始化
                /// </summary>
                /// <param name="p">可以属性名称或function(){ return datas; }</param>
                /// <param name="p1" type="function(value)">初始化, function(value){}</param>
                /// </signature>
                return this;
            },
            $initResults: function (p) {
                /// <summary>
                /// 根据执行结果
                /// </summary>
                /// <param name="p" type="function(value)">初始化, function(value){}</param>
                return this.$init(bingo.proxy(this, function () {
                    return this.$results()
                }), p);
            },
            $initValue: function (p) {
                /// <summary>
                /// 根据值
                /// </summary>
                /// <param name="p" type="function(value)">初始化, function(value){}</param>
                return this.$init(bingo.proxy(this, function () {
                    return this.$value()
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

            this.type = type;
            this.attrName = attrName.toLowerCase();

            this.command = command;

        });
    });

    var _isRmTxNode = function (node) {
        return !node || !node.parentNode
                    || !node.parentNode.parentNode
                    || !node.parentNode.parentElement;;
    };
    //标签==========================
    var _textTagClass = bingo.view.textTagClass = bingo.Class(function () {


        this.Static({
            _regex: /\{\{([^}]+?)\}\}/gi,
            _regexRead: /^\s*:\s*/,
            hasTag: function (text) {
                this._regex.lastIndex = 0;
                return this._regex.test(text);
            }
        });

        this.Define({
            getWithData: function () {
                return this._withData;
            }
        });

        this.Prop({
            view: null,
            node: null,//为text node
            viewnode:null
        });

        this.Initialization(function (view, viewnode, node, attrName, attrValue, withData) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="viewnode">属性名称</param>
            /// <param name="attrName">属性名称</param>
            /// <param name="attrValue">属性名称</param>
            /// <param name="command">指令定义</param>
            //console.log('textTag', node.nodeType);

            this._withData = withData || (viewnode.getWithData());

            this.view(view).viewnode(viewnode).node(node);


            this.attrName = attrName && attrName.toLowerCase();
            this.attrValue = attrValue;

        });
    });

    var _pView = _viewClass.NewObject(document.body, _viewClass.NewObject(document.body, null));
    var _view = _viewClass.NewObject(document.body, _pView);
    var _cView = _viewClass.NewObject(document.body, _view);
    _view.$children.push(_cView);

    var _pViewnode = _viewnodeClass.NewObject(_view, _view.$node, null, {});
    var _viewnode = _viewnodeClass.NewObject(_view, _view.$node, _pViewnode, {});
    var _cViewnode = _viewnodeClass.NewObject(_view, _view.$node, _viewnode, {});
    _pView.$viewnode(_pViewnode);
    _view.$viewnode(_viewnode);
    _cView.$viewnode(_cViewnode);

    var _viewnodeAttr = _viewnodeAttrClass.NewObject(_view, _viewnode, 3, 'aaaa', '1111', bingo.command('aaaa'));

    _pViewnode.attrList.push(_viewnodeAttr);
    _viewnode.attrList.push(_viewnodeAttr);
    _cViewnode.attrList.push(_viewnodeAttr);

    var _textTag = _textTagClass.NewObject(_view, _viewnode, _view.$node(), 'aaaa', '1111', {});
    _pViewnode.textList.push(_textTag);
    _viewnode.textList.push(_textTag);
    _cViewnode.textList.push(_textTag);

})(bingo);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";

    bingo.filter.createFilter = function (content, view, node, withData) {
        /// <summary>
        /// 创建Filter
        /// </summary>
        /// <param name="content">filter内容, 如: "reiongId | eq:'dev' | len"</param>
        /// <param name="view">可选, 需注入时用</param>
        /// <param name="node">可选, 原生node, 需注入时用</param>
        /// <param name="withData">可选, withData</param>
        return {
            contentOrg: content,
            content: content,
            contentFT: content,
            filter: function (value) { return value; }
        };
    };

    //过滤器正则
    bingo.filter.regex = /[|]+[ ]?([^|]+)/g;

})(bingo);
﻿
(function (bingo) {
    //version 1.1.0
    "use strict";


    /*
        支持js语句, 如: {{: item.name}} {{document.body.childNodes[0].nodeName}}
        支持if语句, 如: {{if item.isLogin} 已登录 {{else}} 未登录 {{/if}}
        支持for, 如: {{for item in list tmpl=#idAAA}} {{: item_index}}| {{: item.id}}|{{: item_count}}|{{: item_first}}|{{: item_last}} {{/for}}
        支持tmpl(注释)语句, 如 {{tmpl}} {{: item.text}} {{tmpl}}
        支持过滤器, 如: {{: item.name | text}}, 请参考过滤器
        支持header语句, 如: {{header}} 这里是头部 {{/header}}
        支持footer语句, 如: {{footer}} 这里是底部 {{/footer}}
        支持empty语句, 如: {{empty}} 当数据源数组为[], 长度为0 {{/empty}}
        支持loading语句, 如: {{empty}} 当数据源为null时 {{/loading}}
    */


    bingo.render = function (tmpl, view, node) {
        /// <summary>
        /// 获取一个render对象
        /// </summary>
        /// <param name="tmpl">render 模板</param>
        /// <param name="view">可选, 需注入时用</param>
        /// <param name="node">可选, 原生node, 需注入时用</param>
        return {
            render: function (list, itemName, parentData, parentWithIndex, outWithDataList, formatter) {
                /// <summary>
                /// render数据
                /// </summary>
                /// <param name="list">数据源</param>
                /// <param name="itemName">可选, item名称</param>
                /// <param name="parentData">可选, 上级数据</param>
                /// <param name="parentWithIndex">可选, 上级withindex, 如果没有应该为 -1</param>
                /// <param name="outWithDataList">可选, 数组， 收集withDataList</param>
                /// <param name="formatter" type="function(s, role, item, index)">可选, 格式化</param>
                return tmpl;
            }
        };
    };

    //render正则
    bingo.render.regex = /\{\{\s*(\/?)(\:|if|else|for|tmpl|header|footer|empty|loading)(.*?)\}\}/g;   //如果要扩展标签, 请在(if )里扩展如(if |for ), 保留以后扩展

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
