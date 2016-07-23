
(function (undefined) {
    "use strict";

    var stringEmpty = "",
        toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty,
        noop = function () { },
        slice = Array.prototype.slice;

    var _htmlDivTarget = null,
    _getHtmlDivTarget = function () {
        return _htmlDivTarget || (_htmlDivTarget = document.createElement('div'));
    };

    var _makeAutoIdTemp = 0, _makeAutoIdTempPointer = 0;

    var _config = {};

    var bingo = window.bingo = {
        //主版本号.子版本号.修正版本号.编译版本号(日期)
        version: { major: 2, minor: 0, rev: 0, build: '0', toString: function () { return [this.major, this.minor, this.rev, this.build].join('.'); } },
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
                this.eachProp(obj, function (item, n0) {
                    this[n0] = item;
                }, this);
                return this;
            }
            var args = this.sliceArray(arguments, 1);
            bingo.each(args, function (ot) {
                ot && this.eachProp(ot, function (item, n) {
                    obj[n] = item;
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
            }, prototype = def.prototype,
            init = null,
            pri = function () { }, pritype = pri.prototype,
                defObj = {
                    Prop: function (p) {
                        prototype._bgpro_ = bingo.extend(prototype._bgpro_ || {}, p);
                        bingo.eachProp(p, function (item, n) {
                            prototype[n] = function (val) {
                                if (arguments.length == 0)
                                    return this._bgpro_[n];
                                else {
                                    this._bgpro_[n] = val;
                                    return this;
                                }
                            };
                        }, this);
                    },
                    Event: function (s) { prototype.bgEventDef(s); },
                    Define: function (p) {
                        bingo.extend(prototype, p);
                    },
                    Private: function (p) {
                        bingo.extend(pritype, p);
                    },
                    Init: function (fn) { init = fn; }
                };
            fn.call(defObj);
            bingo.extend(prototype, {
                Extend: function (p) { bingo.extend(this, p); },
                Private: function (p) { bingo.extend(this._bgpri_, p); }
            });

            def.constructor = def;
            return def;
        },
        proxy: function (thisArg, fn) {
            return function() { return fn && fn.apply(thisArg, arguments); };
        },
        _splitEvName: function (eventName) {
            return bingo.isString(eventName)
                ? (bingo.isNullEmpty(eventName) ? null : bingo.trim(eventName).split(/\s+/g).map(function (item) { return bingo.trim(item); }))
                : eventName;
        },
        isArgs: function (args, p) {
            /// <summary>
            /// isArgs(arguments, 'str', 'fun|bool') <br />
            /// isArgs(arguments, '@@title', null, 1)
            /// 注意如果arguments超出部分不判断
            /// </summary>
            /// <param name="args"></param>
            /// <param name="p">obj, str, array, bool, num, null, empty, undef, fun, *, regex, window, element</param>
            var types = bingo.sliceArray(arguments, 1), isOk = true,val;
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

    var _isType = function (type, p) {
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

(function (bingo, undefined) {
    "use strict";

    //Promises/A+

    var _fulfilled = 'fulfilled', _rejected = 'rejected', _pending = 'pending';

    var Promise = function (fn) {
        return new Promise.fn._init(fn);
    }, _isPromise = function (p) {
        return p && !!p.then;
    };
    Promise.fn = Promise.prototype = {
        constructor: Promise,
        _init : function (fn, fn1) {

            this.state = _pending;
            this._thenH = [];

            try {
                fn(function (result) {
                    this._doNext(result, _fulfilled);
                }.bind(this), function (result) {
                    this._doNext(result, _rejected);
                }.bind(this));
            } catch (e) {
                this._doNext(e, _rejected);
            }
            return this;
        },
        then: function (resolveFn, rejectFn) {
            if (this._thenH) {
                this._thenH.push([resolveFn, rejectFn]);
                if (this.state != _pending) {
                    this._doNext(this._result, this.state);
                }
            }
            return this;
        },
        _end: function () {
            this._thenH = null;
        },
        _doNext: function (res, type) {
            if (res && bingo.isFunction(res.then)) {
                if (res.state == _rejected && !res._thenH) {
                    this.state = type;
                    this._result = null;
                    this._end();
                    return;
                }
                this.state = _pending;
                this._result = undefined;
                res.then(function (res) {
                    this._doNext(res, _fulfilled);
                }.bind(this)).catch(function (res) {
                    this._doNext(res, _rejected);
                }.bind(this));
                return;
            } else {
                this.state = type;
                this._result = res;
            }
            if (this._thenH.length == 0) return;
            this._doThenNext(res, type);
        },
        _doThenNext: function (res, type) {
            var thenH = this._thenH.shift()[type == _fulfilled ? 0 : 1];

            switch (type) {
                case _fulfilled:
                    try {
                        res = bingo.isFunction(thenH) ? thenH(res) : res;
                    } catch (e) {
                        res = e;
                    }
                    if (res instanceof Error) {
                        this._doNext(res, _rejected);
                        bingo.trace(res);
                    } else
                        this._doNext(res, _fulfilled);
                    break;
                case _rejected:
                    if (bingo.isFunction(thenH)) {
                        this._end();
                        thenH(res);
                    } else
                        this._doNext(res, _rejected);
                    break;
            }
        },
        'catch': function (fn) {
            return this.then(null, fn);
        },
        'finally': function (fn) {
            return this.then(fn, fn);
        }
    };
    Promise.fn._init.prototype = Promise.fn;

    bingo.extend(Promise, {
        resolve: function (arg) {
            return Promise(function (resolve) { resolve(arg); });
        },
        reject: function (arg) {
            return Promise(function (resolve, reject) { reject(arg); });
        },
        timeout: function (time, arg) {
            return Promise(function (resolve) { setTimeout(function () { resolve(arg); }, time); });
        },
        //所有resolve才返回resolve, 否则返回reject
        //all([1, 2,...], function(p){ return bingo.Promise.resolve(p);}).then
        //all([promise1, promise1,...]).then
        all: function (args, fn, alway) {
            return Promise(function (resolve, reject) {
                var list = _makeArgs(args, fn);
                var resList = [], len = list.length;
                if (list.length > 0) {
                    bingo.each(list, function (item, index) {
                        if (_isPromise(item)) {
                            var tFn = function (res) {
                                resList[index] = res;
                                (--len) || resolve(resList);
                            };
                            item.then(tFn, alway ? tFn : reject);
                        } else {
                            resList[index] = item;
                            (--len) || resolve(resList);
                        }
                    });
                } else
                    resolve(resList);
            });
        },
        //有一个reject或resolve都返回reject或resolve
        //race([1, 2,...], function(p){ return bingo.Promise.resolve(p);}).then
        //race([promise1, promise1,...]).then
        race: function (args, fn) {
            return Promise(function (resolve, reject) {
                var list = _makeArgs(args, fn);
                if (list.length > 0)
                    bingo.each(list, function (item, index) {
                        if (_isPromise(item))
                            item.then(resolve, reject);
                        else
                            resolve(item);
                    });
                else
                    resolve();
            });
        },
        //执行全部promise无论成功失败
        always: function (args, fn) {
            return this.all(args, fn, true);
        }
    });
    var _makeArgs = function (args, fn) {
        args = bingo.sliceArray(args);
        args.length == 0 && (args = [args]);
        if (!fn) return args;
        var list = [];
        bingo.each(args, function (item, index) {
            list.push(fn(item, index));
        });
        return list;
    };
    Promise.when = Promise.all;

    Promise.isPromise = _isPromise;
    bingo.Promise = Promise;

    bingo.Deferred = function () {
        var deferred = {};

        deferred.promise = Promise(function (resolve, reject) {
            deferred.resolve = function (p) {
                /// <summary>
                /// 解决
                /// </summary>
                resolve(p);
            };
            deferred.reject = function (p) {
                /// <summary>
                /// 拒绝
                /// </summary>
                reject(p);
            };
        })

        return deferred;
    };

})(bingo);

//reverse,splice,push,pop

//every() 方法测试数组的所有元素是否都通过了指定函数的测试。

(function (bingo, undefined) {
    "use strict";

    var _bgevsn = '_bg_evs_', _noop = bingo.noop, _emptyEvent = {
        trigger: _noop, end: _noop, off: _noop
    }, _getEvent = function (o, eventName, isBuild) {
        var events = o[_bgevsn] || (o[_bgevsn] = {});
        return isBuild === true ? (events[eventName] || (events[eventName] = _defEvent()))
            : (events[eventName] || _emptyEvent);
    }, _defEvent = function () {
        return {
            isEnd: false,
            list: [],
            on: function (callback, owner, isOne) {
                if (callback) {
                    if (this.isEnd)
                        callback && callback.call(owner);
                    else
                        this.list.push({ one: isOne === true, callback: callback });
                }
            },
            off: function (callback) {
                if (!callback)
                    this.list = [];
                else
                    this.list = this.list.filter(function (item) {
                        return item.callback != callback;
                    });
            },
            end: function (owner) {
                try {
                    this.trigger(undefined, owner);
                    this.off();
                } finally {
                    this.isEnd = true;
                }
            },
            trigger: function (args, owner, isHandler) {
                var list = this.list, hasOne = false, ret;
                bingo.each(list, function (item) {
                    if (item.one === true)
                        hasOne = true;
                    if ((ret = item.callback.apply(owner, args || [])) === false) return false;
                    if (isHandler === true) return false;
                });
                if (hasOne)
                    this.list = list.filter(function (item) {
                        return !item.one;
                    });
                return ret;
            }
        };
    }, _splitEvName = bingo._splitEvName, _rmEvent = function (o) {
        var events = o[_bgevsn];
        if (events) {
            o.bgOff(Object.keys(events).join(' '));
            o[_bgevsn] = null;
        }
    };

    Object.prototype.bgDefProps({
        //bgOn('ready init', fn)
        bgOn: function (eventName, callback) {
            bingo.each(_splitEvName(eventName), function (item) {
                _getEvent(this, item, true).on(callback, this);
            }, this);
            return this;
        },
        //bgOn('ready init', fn)
        bgOne: function (eventName, callback) {
            bingo.each(_splitEvName(eventName), function (item) {
                _getEvent(this, item, true).on(callback, this, true);
            }, this);
            return this;
        },
        //bgOff() //删除所有事件
        //bgOff('ready init')
        //bgOff('ready init', fn)
        bgOff: function (eventName, callback) {
            if (arguments.length == 0)
                _rmEvent(this);
            else
                bingo.each(_splitEvName(eventName), function (item) {
                    _getEvent(this, item).off(callback);
                }, this);
            return this;
        },
        //bgEnd('ready init')
        bgEnd: function (eventName) {
            bingo.each(_splitEvName(eventName), function (item) {
                _getEvent(this, item, true).end(this);
            }, this);
            return this;
        },
        //bgTrigger('ready init')
        //bgTrigger('ready init', [arg1, arg2])
        //bgTrigger('ready init', [arg1, arg2], this)
        bgTrigger: function (eventName, args, thisArg) {
            var ret;
            bingo.each(_splitEvName(eventName), function (item) {
                ret = _getEvent(this, item).trigger(args, thisArg || this);
            }, this);
            return ret;
        },
        bgTriggerHandler: function (eventName, args, thisArg) {
            var ret;
            bingo.each(_splitEvName(eventName), function (item) {
                ret = _getEvent(this, item).trigger(args, thisArg || this, true);
            }, this);
            return ret;
        },
        //bgEventDef('ready init')
        bgEventDef: function (eventName) {
            /// <summary>
            /// bgEventDef('onOk onError')
            /// </summary>
            bingo.each(_splitEvName(eventName), function (item) {
                this[item] = function (callback) {
                    return this.bgOn(item, callback);
                };
            }, this);
            return this;
        },
        //bgDispose()
        //bgDispose(obj), 销毁时销毁obj
        bgDispose: function (obj) {
            if (this.bgIsDispose) {
                obj && obj.bgDispose();
                return;
            }
            if (arguments.length==1) {
                obj && obj.bgIsDispose || (this._bg_dispose || (this._bg_dispose = [])).push(obj);
                return;
            }
            this.bgIsDispose = true;
            try {
                this.bgDispose = bingo.noop;
                this.bgDisposeStatus = 1;
                this.bgTrigger('_bg_disp_');
                bingo.each(this._bg_dispose, function (item) { item.bgDispose(); });
            } finally {
                this._bg_clsobd();
                bingo.eachProp(this, function (item, n) {
                    if (item && item.bgAutoDispose === true)
                        item.bgDispose();
                    this[n] = null;
                }, this);
                this.bgDispose = bingo.noop;
                this.bgIsDispose = true;
                this.bgDisposeStatus = 2;
            }
        },
        bgOnDispose: function (callback) {
            return this.bgOn('_bg_disp_', callback);
        },
        bgIsDispose: false,
        bgDisposeStatus: 0,
        //自动销毁
        bgAutoDispose: false,
        //bgSync().done(function(){})
        bgSync: function (fn, callback) {
            var bgSync = this._bgSync_ || (this._bgSync_ = {
                _count: 0, _end: function () {
                    if (this._count == 0) return;
                    this._count--;
                    if (this._count == 0) {
                        $this._bgSync_ = null;
                        this.bgTrigger('done', [], $this);
                    }
                }
            }.bgEventDef('done')), $this = this;

            this.bgSyncAdd(1);
            callback && bgSync.done(callback);
            fn && fn.call(this);
            return bgSync;
        },
        //bgSyncAdd();
        //bgSyncAdd(1000); //超时1000ms
        bgSyncAdd: function (time) {
            (this._bgSync_ || this.bgSync())._count++;
            !!time && setTimeout(bingo.proxy(this, function () { this.bgSyncDec(); }), time);
        },
        bgSyncDec: function () {
            this._bgSync_ && this._bgSync_._end();
        }
    });

})(bingo);

//reverse,splice,push,pop

(function (bingo, undefined) {
    "use strict";

    var _act = '', _splitEvName = bingo._splitEvName, _obsDName = '_bg_obdata_',
        _isObsObj = function (o) { return bingo.isArray(o) || bingo.isObject(o); },
        _adList = [], _adTid,
        _defObserve = function (obj, props, deep) {
            if (!(_obsDName in obj)) {
                (function () {
                    var tid, changes = [];
                    obj.bgDefProp(_obsDName, {
                        deep: deep, obs: {}, sobs: [], sendObj: function (change) {
                            if (tid) clearTimeout(tid);
                            changes.push(change);
                            var ods = this.sobs;
                            if (ods.length > 0) {
                                tid = setTimeout(function () {
                                    try {
                                        bingo.each(ods, function (ob) {
                                            ob.fn && ob.fn.call(this, changes);
                                        }, obj);
                                    } finally {
                                        tid = 0;
                                        changes = [];
                                    }
                                }, 1);
                            }
                        }
                    }, false);
                })();
            }
            var obd = obj[_obsDName];
            deep = (deep !== false) || obd.deep;
            bingo.each(props, function (pname, index) {
                //如果以下划画开始， 认为私用变量， 不给予处理
                if (pname.indexOf('_') == 0) return;
                var item = obj[pname];
                if (!_isObserve(obj, pname)) {
                    //初始obs
                    obd.obs[pname] = []
                    var getting = false;
                    var _get = function () {
                        if (_obsList) {
                            //_obsList, bingo.observe收集时用， 其它时间不作用
                            _obsList.push({ name: pname, object: this, value: item, isChild: (_obsList[_obsList.length - 1] || {}).value == this, type: 'get' });
                        }
                        
                        return item;
                    }, _set = function (value) {
                        if (_obsList) {
                            //_obsList, bingo.observe收集时用， 其它时间不作用
                            _obsList.push({ name: pname, object: this, value: item, isChild: (_obsList[_obsList.length - 1] || {}).value == this, type: 'set' });
                        }

                        if (item != value) {
                            var old = item;
                            item = value;
                            deep && _isObsObj(item) && item.bgToObserve(null, deep);
                            _publish(this, pname, { name: pname, object: this, value: item, oldValue: old, type: 'update' });
                        };
                    };
                    Object.defineProperty(obj, pname, {
                        configurable: true,
                        enumerable: true,
                        get: _get,
                        set: _set
                    });
                    deep && _isObsObj(item) && item.bgToObserve(null, deep);
                }
            });
            return obj[_obsDName];
        }, _isObserve = function (obj, prop) {
            return !!_getObserveData(obj, prop);
        }, _getObserveData = function (obj, prop) {
            //取得observe数据
            var obd = obj[_obsDName];
            return obd && (bingo.isNull(prop) ? obd.sobs : obd.obs[prop]);
        }, _publish = function (obj, prop, change) {
            //发送请求Observe
            var ods = _getObserveData(obj, prop);
            bingo.each(ods, function (ob) {
                ob.fn && ob.fn.call(this, [change]);
            }, obj);


            var obd = obj[_obsDName];
            obd && obd.sendObj(change);
        }, _addObs = function (obj, prop, fn) {
            if (!_isObserve(obj, prop)) {
                _defObserve(obj, bingo.isNull(prop) ? null : [prop]);
            }
            var obs = _getObserveData(obj, prop);
            obs && obs.push({ fn: fn });
            return obs;
        }, _delObs = function (obj, prop, fn) {
            var obd;
            if (obd = obj[_obsDName]) {
                if (bingo.isNull(prop)) {
                    if (!fn)
                        obd.sobs = [];
                    else
                        obd.sobs = obd.sobs.filter(function (item) { return item.fn != fn; });
                } else if (obd.obs[prop]) {
                    if (!fn)
                        obd.obs[prop] = [];
                    else
                        obd.obs[prop] = obd.obs[prop].filter(function (item) { return item.fn != fn; });
                }
            }
        }, _resObs = function (obj) {
            var obd = obj[_obsDName];
            if (obd) {
                obd.obs = [];
            }
            obj.bgToObserve();
        };


    Object.prototype.bgDefProps({
        _bg_clsobd: function () {
            var de = this[_obsDName];
            if (de) {
                de.deep = false;
                de.obs = {};
                de.sobs = [];
            }
        },
        bgToObserve: function (prop, deep) {
            /// <summary>
            /// bgToObserve(true)<br/>
            /// bgToObserve('prop')<br/>
            /// bgToObserve('prop', true)
            /// </summary>
            /// <param name="deep">是否自动深toObserve</param>
            if (this.bgNoObserve) return this;
            if (bingo.isBoolean(prop)) { deep = prop; prop = null; }
            _defObserve(this, prop ? [prop] : Object.keys(this), deep);
            return this;
        },
        bgObServe: function (prop, fn) {
            /// <summary>
            /// bgObServe(function(change){})<br/>
            /// bgObServe('prop', function(change){})
            /// </summary>
            if (this.bgNoObserve) return this;
            if (bingo.isNull(prop) || bingo.isFunction(prop)) {
                this.bgToObserve();
                _addObs(this, null, prop || fn);
            } else {
                bingo.each(prop ? [prop] : Object.keys(this), function (item) {
                    _addObs(this, item, fn);
                }, this);
            }
            return this;
        },
        bgUnObServe: function (prop, fn) {
            /// <summary>
            /// bgUnObServe(fn)<br/>
            /// bgUnObServe('prop', fn)
            /// </summary>
            if (this.bgNoObserve) return this;
            if (bingo.isNull(prop) || bingo.isFunction(prop)) {
                _delObs(this, null, prop || fn);
            } else {
                bingo.each(prop ? [prop] : Object.keys(this), function (item) {
                    _delObs(this, item, fn);
                }, this);
            }
            return this;
        },
        bgPublish: function (prop) {
            var val = prop ? this[prop] : this;
            _publish(this, prop, { name: prop, object: this, value: val, oldValue: val, type: 'publish' });
        },
        bgDataValue: function (prop, val) {
            /// <summary>
            /// 获取或设置属性<br />
            /// bgBuildProps('aaaa.bbb', 1)  ==> this.aaaa.bbb = 1
            /// </summary>
            var r = _splitProp(this, prop, false);
            arguments.length > 1 && (r[0][r[1]] = val);
            return r[0][r[1]];
        },
        bgTestProps: function (prop) {
            /// <summary>
            /// 生成属性<br />
            /// bgBuildProps('aaaa.bbb')  ==> [this, 'aaaa', false]
            /// </summary>
            return _splitProp(this, prop, true)[2];
        },
        //防止observe
        bgNoObserve:false
    });

    //数组观察方法， length不能观察有些浏览器会报错
    var _arrayProps = ['reverse', 'splice', 'push', 'pop', 'copyWithin', 'fill', 'shift', 'unshift', 'sort'];
    var _arrayDef = {}, _arrayProtoOld = {};
    bingo.each(_arrayProps, function (prop) {
        var oldPro = Array.prototype[prop];
        _arrayDef[prop] = function () {
            if (_isObserve(this)) {
                var old = this.slice();
                var ret = oldPro.apply(this, arguments);
                var noC = old.length == this.length && this.every(function (item, index) {
                    return item === old[index];
                });
                if (!noC) {
                    _resObs(this);
                    //this.bgToObserve();
                    _publish(this, prop, { name: prop, object: this, value: this, oldValue: old, type: 'update' });
                }
                return ret;
            } else
                return oldPro.apply(this, arguments);
        };
    });
    _arrayDef.size = function (size) {
        if (arguments.length == 0)
            return this.length;
        else {
            var old = this.length;
            if (this.length != size) {
                old = this.slice();
                this.length = size;
                this.bgToObserve();
                _publish(this, '', { name: '', object: this, value: this, oldValue: old, type: 'update' });
            }
        }
    };
    Array.prototype.bgDefProps(_arrayDef);

    var _ArrayEquals = function (arr1, arr2) {
        if (arr1 === arr2) { return true; }
        if (!bingo.isArray(arr2) || arr1.length != arr2.length) { return false; } // null is not instanceof Object.
        for (var i = 0, len = arr1.length; i < len; i++) {
            if (arr1[i] != arr2[i]) return false;
        }
        return true;
    },_ObjectEquals = function (obj1, obj2) {
        if (obj1 === obj2) return true;
        if (!bingo.isObject(obj2)) return false;

        var count = 0, ok = true;
        bingo.eachProp(obj1, function (item, n) {
            count++;
            if (obj2[n] !== item) { ok = false; return false; }
        });
        ok && bingo.eachProp(obj2, function () {
            count--;
        });
        return ok && (count === 0);
    };

    //observe fn时不能观观察root层
    bingo.extend({
        observe: function (obj, prop, fn, autoInit) {
            /// <summary>
            /// observe(obj, 'title', function(c){}) <br />
            /// observe(function(){return value;}, function(c){}) <br />
            /// </summary>

            if (bingo.isArgs(arguments, 'fun', 'fun')) {
                var colFn = obj, isAutoInit = arguments[2] !== false;
                fn = prop;
                var obs, tid, cList = [], old, publish = function (isPub, org, orgVal) {
                    var val;
                    try {
                        val = arguments.length == 3 ? orgVal : colFn();
                        if (isPub || (bingo.isArray(old) ? !_ArrayEquals(old, val) : (bingo.isObject(old) ? !_ObjectEquals(old, val) : old != val))) {
                            //如果只是单个属性的情况, 如bingo.observe(obj, 'aaa.bbb', fn)
                            var cLTemp = cList.length == 1 ? cList[0] : null,
                                cObj = cLTemp && cLTemp.length == 1 ? cLTemp[0] : null;
                            return (org ? (fn.orgFn || fn) : fn).call(ret, { name: cObj ? cObj.name : '', value: val, oldValue: old, object: cObj ? cObj.object : (cLTemp || cList), type: 'bingo.observe' });
                        }
                    } finally {
                        old = bingo.isArray(val) ? bingo.sliceArray(val) : (bingo.isObject(val) ? bingo.extend({}, val) : val);
                        ret.value = val;
                        cList = []; tid = null;
                    }
                }, ft = function (change) {
                    change && cList.push(change);
                    if (!tid) {
                        //如果多次连续变动，统一为一次变动
                        tid = setTimeout(publish, 1);
                    }
                }, ftw = function (change) {
                    ret.refresh();
                    ft(change);
                }, done = function (refs) {
                    //收集绑定
                    obs = _collect(colFn);
                    //是否成功
                    ret.isSucc = _obsSucc && !_obsErr;
                    if (ret.isSucc) {
                        //观察绑定变量
                        bingo.each(obs.w, function (item) {
                            item.object.bgObServe(item.name, ft);
                        });
                        //是否有可观察变量
                        ret.isObs = obs.w.length > 0;
                        //观察绑定变量的父节点, 重新发现绑定
                        bingo.each(obs.p, function (item) {
                            if ('toObsObj' in item) {
                                item.value && item.value.bgObServe(ftw);
                            }
                            item.object.bgObServe(item.name, ftw);
                        });
                    }
                    if (!isAutoInit) {
                        ret.value = old = obs.val;
                        publish(true, true, old);
                        isAutoInit = true;
                    } else if (refs !== true)
                        ret.value = old = obs.val;
                    else
                        ret.check();
                }, _unObserve = function () {
                    bingo.each(obs.w, function (item) {
                        item.object.bgUnObServe(item.name, ft);
                    });
                    bingo.each(obs.p, function (item) {
                        if ('toObsObj' in item) {
                            item.value && item.value.bgUnObServe(ftw);
                        }
                        item.object.bgUnObServe(item.name, ftw);
                    });
                    obs = null;
                };

                var ret = {
                    //重新检查值， 是否改变
                    check: function () { ft(null); },
                    //发布一个信息
                    publish: function (org) {
                        return publish(true, org);
                    },
                    unObserve: function () {
                        _unObserve();
                        this.bgDispose();
                    },
                    //刷新， 重新收集绑定
                    refresh: function () {
                        _unObserve();
                        done(true);
                    },
                    init: function () {
                        ret.init = bingo.noop;
                        done();
                    }
                };
                isAutoInit && ret.init();
                return ret;
            } else if (obj) {
                var bo = _splitProp(obj, prop, false),
                    obj = bo[0], pname = bo[1],
                    sFn = function () {
                        return obj[pname];
                    };
                return bingo.observe(sFn, fn, autoInit);
            }

            //if (bingo.isFunction(obj)) {
                
            //} else if (obj) {
                

            //}
        },
        isObserve: function (obj, prop) {
            return _isObserve(obj, prop);
        }
    });
    bingo.observe.error = function () { _obsErr = true; };

    //收集存放数组
    var _obsList = null, _obsSucc, _obsErr;
    //收集观察变量
    var _collect = function (fn) {
        try {
            _obsList = [];
            _obsSucc = false, _obsErr = false;
            var value = fn();
            var ret = _analyze();
            _obsSucc = true;
            ret.val = value;
            return ret;
        } finally {
            _obsList = null;
        }
    }, _analyze = function () {
        //分析收集到的观察变量
        var list = [];
        //取出可观察的属性
        bingo.each(_obsList, function (item, index, array) {
            var nextIndex = index + 1, isEnd = array.length == nextIndex;
            if (isEnd) {
                list.push(item);
            } else {
                var next = array[nextIndex];
                if (!next.isChild)
                    list.push(item);
            }
        });
        //可观察的属性去重
        var wList = [];
        bingo.each(list, function (item) {
            var has = wList.some(function (item1) { return item.name == item1.name && item.object == item1.object; });
            has || wList.push(item);
        });

        //取出可观察的属性节点并去重， 用于变动
        var pList = [];
        bingo.each(_obsList, function (item) {
            var tmp = item.value;
            var hasU = true;
            if (bingo.isNull(tmp) || bingo.isArray(tmp)) {
                //如果value为null, array 返回到false, 用于下面属性观察
                //object暂时不处理
                item.toObsObj = true;
                hasU = false;
            }
            //是否已经存在wList
            hasU = hasU && wList.some(function (item1) {
                return item.name == item1.name && item.object == item1.object;
            });
            if (!hasU) {
                //去重
                var hasO = pList.some(function (item1) { return item.name == item1.name && item.object == item1.object; });
                hasO || pList.push(item);
            }
        });
        return { w: wList, p: pList };
    };

    var _splitProp = function (obj, prop, test) {
        if (!bingo.isString(prop)) return [obj, prop];
        var dot = '=bingo_dot=';
        prop = prop.replace(/\[(["']?)(.*?)\1\][.]?/g, function (find, b, con) {
            return ['.', con.replace('.', dot), '.'].join('');
        }).replace(/\.$/, '');
        var l = prop.split('.'), nreg = /[^0-9]/,
            end = l.length - 2, last = obj, name = prop, has = true;
        end >= 0 && bingo.each(l, function (item, index) {
            item = item.replace(dot, '.');
            //测试模式
            if (test && !_existProp(last, item)) { has = false; return false; }
            if (index <= end) {
                if (!last[item]) {
                    last = last[item] = (nreg.test(l[index + 1]) ? {} : []);
                } else
                    last = last[item];
            } else {
                name = item;
                if (!(name in last))
                    last[name] = null;
            }
        });
        return [last, name, end == -1 ? _existProp(last, name) : has];
    }, _existProp = function (o, name) {
        return bingo.isArray(o) || bingo.isObject(o)
            || bingo.isWindow(o) || bingo.isElement(o) || bingo.isFunction(o) ? (name in o) : false;
    };

})(bingo);


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

(function (bingo) {
    "use strict";
    var _Promise = bingo.Promise,
        doc = document,
        head = doc.head ||
          doc.getElementsByTagName('head')[0] ||
          doc.documentElement,
       baseElement = head.getElementsByTagName('base')[0],
       READY_STATE_RE = /loaded|complete|undefined/i;

    var _fetch = function (url, callback, charset) {

        //每一个async属性的脚本都在它下载结束之后立刻执行，同时会在window的load事件之前执行。
        //所以就有可能出现脚本执行顺序被打乱的情况；
        //每一个defer属性的脚本都是在页面解析完毕之后，按照原本的顺序执行，同时会在document的DOMContentLoaded之前执行。

        //但defer并不是所有浏览器都遵从
        var node = doc.createElement('script');
        node.type = 'text/javascript';
        node.charset = charset || 'utf-8';
        node.async = true;//'async';
        node.defer = false; //'defer';
        node.src = url;

        scriptOnload(node, callback || bingo.noop);


        // ref: #185 & http://dev.jquery.com/ticket/2709 
        // 关于base 标签 http://www.w3schools.com/tags/tag_base.asp
        baseElement ?
            head.insertBefore(node, baseElement) :
            head.appendChild(node);

    },
    scriptOnload = function (node, callback) {

        var loadedFun = function () {
            if (!node) return;
            //正则匹配node的状态
            if (READY_STATE_RE.test(node.readyState)) {

                node.onload = node.onerror = node.onreadystatechange = null;

                if (!bingo.isDebug && node.parentNode) {
                    node.parentNode.removeChild(node);
                }

                try {
                    callback && callback(node.src);
                } finally {
                    node = undefined;
                    callback = null;
                }
            }
        };

        node.onload = node.onerror = node.onreadystatechange = function () {
            loadedFun();
        };

    };

    var _loaded = [], _loading = [], _loadAll = [],
        _addAll = function (fn, lv) {
            _loadAll.push({ fn: fn, lv: lv });
            _loadAll.sort(function (item1, item2) { return item1.lv - item2.lv; });
            (!_isLoading()) && _checkEnd();
        },
        _exist = function (file) {
            if (bingo.isNullEmpty(file)) return true;
            return _loading.some(function (item) { return item.file == file; })
                || _isLoaded(file);
        },
        _isLoaded = function (file) {
            return _loaded.some(function (item) { return item == file; });
        },
        _isLoading = function () {
            return _loading.length > 0;
        },
        _getLoading = function (file) {
            var index = bingo.inArray(function (item) { return this.file == file; }, _loading);
            return index >= 0 ? _loading[index] : null;
        },
        _tid,
        _loadJS = function (file) {
            return _Promise(function (fn) {
                if (_isLoaded(file)) {
                    fn && fn(file);
                } else {
                    var lf = _getLoading(file);
                    if (lf) {
                        lf.fns.push(fn);
                    } else {
                        _loading.push({ file: file, fns: [fn], status: 0 });
                        _tid || (_tid = setTimeout(_done, 0));
                    }
                }
            });
        },
        _done = function () {
            _tid = null;
            bingo.each(_loading, function (item) {
                if (item.status > 0) return;
                var file = item.file;
                item.status = 1;//加载中
                _fetch(file, function () {
                    _toLoad(_loading, item);
                });
            });
        },
        _toLoad = function (list, item) {
            var index = list.indexOf(item);
            //从loading删除
            index < 0 || list.splice(index, 1);
            //添加到loaded
            _loaded.push(item.file);
            bingo.each(item.fns, function (fn) {
                fn && fn(item.file);
            });
            _checkEnd();
        },
        _checkEnd = function () {
            var idEnd = !_isLoading();
            if (idEnd) {
                //debugger;
                //console.log('end');
                _loading = [];
                var all = _loadAll;
                _loadAll = [];
                bingo.each(all, function (item) {
                    item.fn();
                });
            } else
                _done();
        };

    var _routeTypeReg = /^(.+)\:\:(.*)/,
        _makeRouteTypeUrl = function (url) {
            var type, s;
            if (_routeTypeReg.test(url)) {
                type = RegExp.$1;
                s = RegExp.$2;
            } else {
                s = url;
            }
            return { all: url, url: s, type: type || '' };
        }, _mergeRouteUrlType = function (url, type, rep) {
            //合并type与url, tmpl::user/list, rep是否替换原来类型
            if (!type) return url;
            var urlEx = _makeRouteTypeUrl(url);
            rep = rep != false || !urlEx.type;
            return rep ? [type, urlEx.url].join('::') : url;
        }, _loadRouteType = function (app, type, url, bRoute, p) {
            if (bRoute !== false) {
                url = _mergeRouteUrlType(url, type, false);

                var route = app.route(url), config = bingo.config();
                if (route.promise != _rPromise)
                    return route.promise(p);
                else
                    return _loadConfig[type](route.toUrl, p);

            } else
                return _loadConfig[type](url, p);
        }, _loadConfig = {
            ajax: _ajax,
            using: _loadJS,
            tmpl: function (url, p) {
                var key = url;
                var cache = bingo.cache(_tmplCacheObj, key);
                if (bingo.isString(cache)) {
                    return _Promise.resolve(cache);
                } else {
                    var tFn = function (html) {
                        if (bingo.isString(html))
                            bingo.cache(_tmplCacheObj, key, html, 200);
                        return html;
                    };

                    return _ajax(url, bingo.extend({
                        dataType: 'text'
                    }, p)).then(tFn);
                }
            }
        };
    var _tmplCacheObj = {};

    bingo.app.extend({
        using: function (url, bRoute) {
            /// <returns value=''></returns>
            /// <summary>
            /// bingo.using('/js/file1.js').then <br />
            /// bingo.using('/js/file1.js', false).then <br />
            /// </summary>
            /// <param name="bRoute">是否经过route, 默认是</param>
            return _loadRouteType(this, 'using', url, bRoute);
        },
        usingAll: function (url, bRoute) {
            url && this.using(url, bRoute);
            return bingo.Promise(function (r) {
                _addAll(r, 5);
            });
        }
    });

    //end using===================================

    var _noop = bingo.noop, _htmlType = 'text/html',
        _textType = 'text/plain', _jsonType = 'application/json',
        _r20 = /%20/g,
        _noContent = /^(?:GET|HEAD)$/i,
        _hasQ = /\?/,
        _mimeToDataType = function (mime) {
        return mime && (mime == _htmlType ? 'html' :
          mime == _jsonType ? 'json' :
          /^(?:text|application)\/javascript/i.test(mime) ? 'script' :
          /^(?:text|application)\/xml/i.test(mime) && 'xml') || 'text';
        }, _appendQuery = function (url, query) {
            return url += (_hasQ.test(url) ? "&" : "?") + query;
        }, _serializeData = function (url, options) {
            options.url = url;
            if (!options.data) return;
            var p = [];
            if (bingo.isObject(options.data)) {
                bingo.eachProp(options.data, function (item, name) {
                    p.push(encodeURIComponent(name) + '=' + encodeURIComponent(bingo.isObject(item) || bingo.isArray(item) ? JSON.stringify(item) : item));
                });
                options.data = p.join('&').replace(_r20, '+');
            }
            if (_noContent.test(options.type)) {
                options.url = _appendQuery(url, options.data);
                delete options.data;
            }

        }, _ajaxOpt = {
            //dataType: 'json',
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            async: true,
            beforeSend: _noop,
            success: _noop,
            error: _noop,
            complete: _noop,
            context: null,
            xhr: function () {
                return new window.XMLHttpRequest();
            },
            accepts: {
                script: 'text/javascript, application/javascript',
                json: _jsonType,
                xml: 'application/xml, text/xml',
                html: _htmlType,
                text: _textType
            },
            crossDomain: false,
            timeout: 0
        }, _ajax = function (url, options) {
            var settings = bingo.extend({}, _ajaxOpt, options);

            if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(url) &&
              RegExp.$2 != window.location.host;

            var D = bingo.Deferred();
            var dataType = settings.dataType, hasPlaceholder = /=\?/.test(url);
            if (dataType == 'jsonp' || hasPlaceholder) {
                if (!hasPlaceholder) url = _appendQuery(url, 'callback=?');
                return _ajaxJSONP(url, settings, D);
            }

            //if (!url) url = window.location.toString();
            _serializeData(url, settings);
            url = settings.url;

            var mime = settings.accepts[dataType],
                baseHeaders = {},
                protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol,
                xhr = _ajaxOpt.xhr(), abortTimeout;

            if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
            if (mime) {
                mime += ', */*; q=0.01';
                baseHeaders['Accept'] = mime;
                xhr.overrideMimeType && xhr.overrideMimeType(mime);
            }
            var hasContent = !_noContent.test(settings.type);
            baseHeaders['Content-Type'] = settings.contentType;
            settings.headers = bingo.extend(baseHeaders, settings.headers);

            var context = settings.context;

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    clearTimeout(abortTimeout);
                    var result, cpType = '';;
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                        dataType = dataType || _mimeToDataType(xhr.getResponseHeader('content-type'));
                        result = xhr.responseText;

                        try {
                            if (dataType == 'script') (1, eval)(result);
                            else if (dataType == 'xml') result = xhr.responseXML;
                            else if (dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
                            cpType = 'success';
                            D.resolve(result);
                            settings.success.call(context, result, cpType, xhr);
                        } catch (e) {
                            cpType = 'parsererror';
                            D.reject(xhr);
                            settings.error.call(context, xhr, cpType, e);
                        }
                    } else {
                        cpType = 'error';
                        D.reject(xhr);
                        settings.error.call(context, xhr, cpType, xhr);
                    }
                    settings.complete.call(context, xhr, cpType)
                }
            };

            xhr.open(settings.type, url, settings.async);

            for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);

            if (settings.beforeSend.call(context, xhr, settings) === false) {
                xhr.abort();
                return false;
            }

            if (settings.timeout > 0) abortTimeout = setTimeout(function () {
                xhr.onreadystatechange = _noop;
                xhr.abort();
                settings.complete.call(context, xhr, 'timeout')
            }, settings.timeout);

            xhr.send(settings.data ? settings.data : null);
            return D.promise;
        }, _ajaxJSONP = function (url, options, D) {
            var callbackName = 'jsonp' + bingo.makeAutoId(),
              script = document.createElement('script'),
              abort = function () {
                  head.removeChild(script);
                  if (callbackName in window) window[callbackName] = _noop
                  options.complete.call(options.context, xhr, 'abort')
              },
              xhr = { abort: abort }, abortTimeout;

            if (options.error) script.onerror = function () {
                D.reject();
                xhr.abort();
                options.error();
            };

            window[callbackName] = function (data) {
                clearTimeout(abortTimeout);
                head.removeChild(script);
                delete window[callbackName];
                D.resolve(data);
                settings.success.call(options.context, data, 'success', xhr);
            };

            _serializeData(url, options);
            script.src = options.url.replace(/=\?/, '=' + callbackName);
            head.appendChild(script);

            if (options.timeout > 0) abortTimeout = setTimeout(function () {
                xhr.abort();
            }, options.timeout);

            return D.promise;
        };

    var _tagTestReg = /^\s*<(\w+|!)[^>]*>/;

    bingo.app.extend({
        ajax: function (url, p, bRoute) {
            return _loadRouteType(this, 'ajax', url, bRoute, p);
        },
        _tmpl: {},
        saveTmpl: function (id, tmpl) {
            this._tmpl[id] = tmpl;
        },
        tmpl: function (p, bRoute, aP) {
            /// <summary>
            /// bingo.tmpl('tmpl/aaaa/user').then(...;<br />
            /// bingo.tmpl('#userTmplId').then(...;<br />
            /// bingo.tmpl(node).then(...;<br />
            /// </summary>
            var html = '', node = p;
            if (bingo.isString(p)) {
                if (p.indexOf('#') < 0) {
                    if (!p || _tagTestReg.test(p)) {
                        return _Promise.resolve(p);
                    } else {
                        return _loadRouteType(this, 'tmpl', p, bRoute, aP);
                    }
                } else {
                    var id = p.substr(1);
                    if (this._tmpl[id])
                        return _Promise.resolve(this._tmpl[id]);
                    else
                        node = document.getElementById(p.substr(1));
                }
            }
            if (node) {
                var cLen = node.children.length, first = node.firstElementChild;
                if (cLen == 1 && first.tagName.toLowerCase() == 'script')
                    html = first.innerHTML;
                else
                    html = node.innerHTML;
            }
            return _Promise.resolve(html);
        }
    });

    var _cacheName = '_bg_cache2_';
    bingo.cache = function (owner, key, p, max) {
        var cache = owner[_cacheName];
        if (arguments.length == 2) {
            if (!cache) return undefined;
            var index = bingo.inArray(function (item) { return item[0] == key; }, cache);
            return index > -1 ? cache[index][1] : undefined;
        } else {
            arguments < 4 && (max = 20);
            cache || (cache = owner[_cacheName] = []);
            var index = bingo.inArray(function (item) { return item[0] == key; }, cache);
            var c = index > -1 ? cache[index] : null, t = new Date().valueOf();
            if (c) {
                c[1] = p, c[2] = t;
            } else {
                c = [key, p, t];
                cache.push(c);
                if (cache.length >= max + 5) {
                    cache.sort(function (item, item1) { return item1[2] - item[2]; });
                    owner[_cacheName] = bingo.sliceArray(cache, 0, cache.length - 5);
                }
            }
            return p;
        }
    };
    bingo.cacheRemove = function (owner, key) {
        var cache = owner[_cacheName];
        if (cache) {
            var index = bingo.inArray(function () { return this[0] == key; }, cache);
            return (index > -1) ? cache.splice(index, 1)[0] : undefined;
        }
    };


    //route=====================================================

    /*
        //1. 添加或设置路由'view'
        bingo.route('view', {
            //优先级, 越小越前, 默认100
            priority: 100,
            //路由地址
            url: 'view/{controller*}',
            //路由转发到地址（可以function(url, params)）
            toUrl: 'modules/{controller*}.html',
            //或者
            promise: function(url, p){
                    return bingo.Promise(funcion(resole){ $.ajax(url, p).then(resole);})
            }
            //默认值
            defaultValue: { app: '', controller: 'user/list' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/user/list');
                返回结果==>{tmpl:'modules/user/list.html'}
    */

    var _makeRegexPath = /(\W)/g,
        //查找query部分, ?aaa=111&b=222
        _urlQueryPart = /\?[^?=]+\=.*$/,
        _isRegexMapPath = function (path) {
            return (!bingo.isNullEmpty(path)
                    && /[?*]+/.test(path.replace(_urlQueryPart, '')));
        }, _makeRegexMapPath = function (path) {
            path = path.replace(_urlQueryPart, '');
            if (!_isRegexMapPath(path)) return null;

            _makeRegexPath.lastIndex = 0;
            var regS = path.replace(_makeRegexPath, "\\$1").replace(/\\\*\\\*/g, '(.*?)').replace(/(\\([?*]))/g, '([^./\]$2?)');
            regS = ['^', regS, '$'].join('');
            return new RegExp(regS);
        };


    var _tranAttrRex = /\{([^}]+)\}/gi,
        _makeRegexPathSS = /\*\*|[?*](?!})/g,//查找 ?和*符号
        _keyAll = /\*$/;
    var _urlToParams = function (url, routeContext) {
        //匹配url, 并生成url参数
        // 如'view/{app}/{contrller}' ==> {app:'', contrller:''}
        if (!url || !routeContext.url) return null;
        var matchUrl = routeContext.url;
        //todo:{name*}

        var pathReg = routeContext._reg;
        if (!pathReg) {
            //去除$后面部分内容, 作为查询条件
            var urlTest = matchUrl.indexOf('$') >= 0 ? matchUrl.split('$')[0] : matchUrl;
            _tranAttrRex.lastIndex = 0;
            urlTest = urlTest.replace(_tranAttrRex, function (find, name) {
                //console.log(name);
                return _keyAll.test(name) ? '**' : '*';
            });
            pathReg = routeContext._reg = (routeContext._reg = _makeRegexMapPath(urlTest));
        }
        //url参数部分由$分开， 如aaaa/ssss.html$aaa:1$bb:2
        var urlParams = url.split('$');
        if (!pathReg.test(urlParams[0])) return null;

        var matchUrlList = [];
        matchUrl.replace(_makeRegexPathSS, '{*}').replace(_tranAttrRex, function (find, key, item2) {
            //console.log(find, item1, item2);
            matchUrlList.push({ key: key, find: find });
        });

        var obj = {}, fKey;

        urlParams[0].replace(pathReg, function () {
            //console.log(arguments);
            var args = arguments;
            bingo.each(matchUrlList, function (item, index) {
                fKey = item.key;
                if (fKey != '*') {
                    obj[fKey.replace('*', '')] = args[index + 1];
                }
                //item.value = args[index + 1];
            });
        })
        //console.log(matchUrlList);

        var queryParams = obj.queryParams = {};

        //如果url匹配， 
        //生成多余参数
        if (urlParams.length > 1) {
            urlParams = bingo.sliceArray(urlParams, 1);
            bingo.each(urlParams, function (item, index) {
                var list = item.split(':'),
                    name = list[0],
                    val = decodeURIComponent(list[1] || '');
                name && (obj[name] = queryParams[name] = val);
            });
        }

        return obj;
    }, _getRouteContext = function () {
        var context = { app: null, controller: null };
        var params = this.params;
        if (params) {
            var appName = params.app;
            var app = bingo.app(appName);
            context.app = app;
            params.controller && (context.controller = app.controller(params.controller));
            context.controller && (context.controller = context.controller.fn);

        }
        return context;
    }, _makeRouteContext = function (routeContext, name, url, toUrl, params) {
        //生成 routeContext
        var promise = routeContext.promise,
            pFn = promise ? function (p) { return promise(this.toUrl, p); } : _rPromise;

        return { name: name, params: params, url: url, toUrl: toUrl, promise:pFn, context: _getRouteContext };
    },
    _rPromise = function (p) { return _ajax(this.toUrl, p); },
    _passParam = ',controller,service,app,queryParams,',
    _paramToUrl = function (url, params, paramType) {
        //_urlToParams反操作, paramType:为0转到普通url参数(?a=1&b=2), 为1转到route参数($a:1$b:2)， 默认为0
        _tranAttrRex.lastIndex = 0;
        if (!url || !params) return url;
        var otherP = '', attr, attr1, val;
        bingo.eachProp(params, function (item, n) {
            attr = ['{', n, '}'].join('');
            attr1 = ['{', n, '*}'].join('');

            if (url.indexOf(attr) >= 0) {
                //如果是url变量参数， 如/{module}/{aciont}/aa.txt
                url = bingo.replaceAll(url, attr, item);
            } else if (url.indexOf(attr1) >= 0) {
                //如果是url变量参数， 如/{module}/{aciont}/aa.txt
                url = bingo.replaceAll(url, attr1, item);
            } else if (_passParam.indexOf(','+n+',') < 0) {
                val = encodeURIComponent(item || '');
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

        return url;
    };

    var _checkRoute = function (app) {
        return app._route || _newRouter(app);
    };

    bingo.app.extend({
        route: function (p, context) {
            if (arguments.length == 1)
                return this.routeContext(p);
            else if (bingo.isObject(context))
                p && context && _checkRoute(this).add(p, context);
            else
                return this.routeContext(_mergeRouteUrlType(p, context));
        },
        routeContext: function (url) {
            return _checkRoute(this).getRouteByUrl(url);
        },
        routeLink: function (name, p, type) {
            var r = _checkRoute(this).getRuote(name)
            if (!r && this != bingo.defualtApp)
                r = _checkRoute(bingo.defualtApp).getRuote(name);
            return r ? _mergeRouteUrlType(_paramToUrl(r.context.url, p, 1), type) : '';
        },
        routeQuerystring: function (url, p, type) {
            url || (url = '');
            var urlPath = '';
            if (url.indexOf('$') >= 0 || url.indexOf('?') >= 0) {
                var routeContext = this.routeContext(url);
                p = bingo.extend({}, routeContext.params.queryParams, p);
                var sp = url.indexOf('$') >= 0 ? '$' : '?';
                url = url.split(sp)[0];
            }
            bingo.eachProp(p, function (item, n) {
                item = encodeURIComponent(item || '');
                //route参数形式, $aaa:1$bbb=2
                urlPath = [urlPath, '$', n, ':', item].join('');
            });
            return _mergeRouteUrlType([url, urlPath].join(''), type);
        }
    });

    var _newRouter = function (app) {
        var route = {
            bgNoObserve: true,
            datas: [],
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
                this.datas.sort(function (item1, item2) { return item1.context.priority - item2.context.priority; });
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

                var urlType = _makeRouteTypeUrl(url),
                    types = urlType.type;
                url = urlType.url;

                var querys = url.split('?'), urlOld = url;
                if (querys.length > 1) url = querys[0];
                var routeContext = null, name = '',tt;
                var params = null;
                bingo.each(this.datas, function () {
                    routeContext = this.context;
                    tt = routeContext.type;
                    if (!tt || tt == types) {
                        params = _urlToParams(url, routeContext);
                        //如果params不为null, 认为是要查找的url
                        if (params) { name = this.name; return false; }
                    }
                });

                if (!params && app != bingo.defualtApp) {
                    return _checkRoute(bingo.defualtApp).getRouteByUrl(urlOld);
                }

                //再找组装参数
                if (!params) {
                    routeContext = _defaultRoute;
                    name = 'defaultRoute';
                    params = {};
                }
                if (params || routeContext.defaultValue)
                    params = bingo.extend({}, routeContext.defaultValue, params);

                params.app = app.name;

                if (querys.length > 1) {
                    params || (params = {});
                    querys[1].replace(/([^=&]+)\=([^=&]*)/g, function (find, name, value) {
                        (name in params) || (params[name] = decodeURIComponent(value));
                    });
                }

                var toUrl = _makeTo(routeContext.toUrl, routeContext, url, params);

                return _makeRouteContext(routeContext, name, url, toUrl, params);
            }

        };
        app._route = route;
        app.route('**', {
            priority: 9999999,
            url: '**',
            toUrl: function (url, param) {
                return url;
            }
        });
        return route;
    };

    var _defaultRoute = {
        url: '**',
        toUrl: function (url, param) { return url; }
    },
    _makeTo = function (toUrl, routeContext, url, params) {
        bingo.isFunction(toUrl) && (toUrl = toUrl.call(routeContext, url, params));
        return _paramToUrl(toUrl || '', params);
    };

    //end route=====================================================



})(bingo);


(function (bingo, undefined) {
    "use strict";

    //CP: Content Provider(内容提供者)

    //aFrame====================================

    var _aFrameList = [],
        _aFrame = function (obj) {
            /// <param name="fn" value="fn.call(obj, obj)"></param>
            _aFrameList.push(obj);
             _ticker.start();
        }, _aFrameCK = function () {
            var list = [], orgs = _aFrameList;
            _aFrameList = [];
            bingo.each(orgs, function (item) {
                if (!item._stop) {
                    item.n--;
                    if (item.n < 0)
                        item.fn(item);
                    else
                        list.push(item);
                }
            });
            list.length > 0 && (_aFrameList = list.concat(_aFrameList));
        }, _hasAFrame = function () { return _aFrameList.length > 0; };


    var _ticker;

    (function (_fps, useRAF) {

        //本段代码参考于：https://github.com/greensock/GreenSock-JS/

        var _reqAnimFrame = window.requestAnimationFrame,
            _cancelAnimFrame = window.cancelAnimationFrame,
            _getTime = Date.now || function () { return new Date().getTime(); },
            a = ["ms", "moz", "webkit", "o"],
            i = a.length;
            while (--i > -1 && !_reqAnimFrame) {
                _reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
                _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
            }

            var _isAFrame = bingo.isAFrame = (useRAF !== false && _reqAnimFrame);

        var _self = {},
            _emptyFunc = function () { },
            _lastUpdate, _startTime,
            _lagThreshold, _adjustedLag,
            _sleep, _pSleep = 0,
            _req, _gap, _nextTime,
            _tick = function () {
                if (_req == _emptyFunc) return;
                var elapsed = _getTime() - _lastUpdate,
                    overlap, dispatch;
                if (elapsed > _lagThreshold) {
                    _startTime += elapsed - _adjustedLag;
                }
                _lastUpdate += elapsed;
                _self.time = (_lastUpdate - _startTime) / 1000;
                overlap = _self.time - _nextTime;
                if (!_fps || overlap > 0) {
                    _nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
                    dispatch = true;
                }
                _req(_tick);
                if (dispatch) {
                    if (_pSleep >= 2)
                        _self.sleep();
                    if (_hasAFrame())
                        _pSleep = 0;
                    else {
                        _pSleep++;
                    }
                    _aFrameCK();
                }
            }, _reset = function () {
                _req = _emptyFunc;
                _lastUpdate = _getTime(),
                _startTime = _getTime(),
                _lagThreshold = 500,
                _adjustedLag = 33,
                _sleep = true;
                _self.time = 0;
            };
        _reset();

        _self.sleep = function () {
            if (_sleep) return;
            _reset();
        };

        _self.wake = function () {
            _sleep = false;
            _req = (!_isAFrame) ? function (f) { setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0); }
                : function (f) {
                    var fnn = function () { if (f) { var af = f; f = null; af(); } };
                    _reqAnimFrame(fnn);
                    //超时
                    setTimeout(fnn, ((_nextTime - _self.time) * 20 * 1000 + 1) | 0);
                };
            _tick();
        };

        _self.start = function () {
            if (!_sleep) return;
            _pSleep = 0;
            _gap = 1 / (_fps || 60);
            _nextTime = this.time + _gap;
            _self.wake();
        };

        _ticker = _self;

    })(60, true);

    bingo.aFrame = function (fn, frN) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="fn"></param>
        /// <param name="frN">第几帧， 默认0</param>
        (!bingo.isNumeric(frN) || frN < 0) && (frN = 0);
        var obj = {
            fn:fn,
            n: frN,
            _stop:false,
            stop: function () { this._stop = true; },
            next: function (fn) { return bingo.aFrame(fn, this.n + 1); },
            frame: bingo.aFrame
        };
        _aFrame(obj);
        return obj;
    };
    bingo.aFramePromise = function (frN) {
        return _Promise(function (r) {
            bingo.aFrame(r, frN);
        });
    };
    bingo.aFrameProxy = function (fn, frN, dispoer) {
        var doing = false;
        var fFn = function () {
            if (doing) return;
            doing = true;
            var args = arguments;
            bingo.aFrame(function () {
                if (dispoer && dispoer.bgIsDispose) return;
                doing = false; fn.apply(this, args);
            }.bind(this), frN);
        };
        //保存原来observe fn
        fFn.orgFn = fn;
        return fFn;
    };
    //end _rAFrame


    var _Promise = bingo.Promise,
        _isPromise = _Promise.isPromise, _promisePush = function (promises, p) {
            _isPromise(p) && promises.push(p);
            return p;
        }, _promisePushList = function (promises, list) {
            bingo.each(list, function (item) { _promisePush(promises, item); });
            return list;
        }, _retPromiseAll = function (promises, must) {
            return must || promises.length > 0 ? _Promise.always(promises) : undefined;
        }, _promiseAlways = function (promises, then) {
            return promises.length > 0 ? _Promise.always(promises).then(then) : then();
        };

    //var _isLinkNodeType = function (type) {
    //    return type == 1 || type == 8;
    //},
    //_isRemoveAll = function (nodes) {
    //    return bingo.inArray(function (item, i) {
    //        return _isLinkNodeType(item.nodeType) ? !!item.parentNode : false;
    //    }, nodes) < 0;
    //},
    //_linkNodes = function (cacheName, nodes, callback) {
    //    bingo.each(nodes, function (item) {
    //        if (_isLinkNodeType(item.nodeType)) {
    //            var fn = function () {
    //                //删除没用的node
    //                nodes = bingo.removeArrayItem(function (item) {
    //                    return item == this || !item.parentNode;
    //                }.bind(this), nodes);
    //                if (callback && _isRemoveAll(nodes)) callback();
    //            };
    //            (item[cacheName] || (item[cacheName] = [])).push(fn);
    //            bingo.linkNode(item, fn);
    //        }
    //    });
    //},
    //_unLinkNodes = function (cacheName, nodes) {
    //    bingo.each(nodes, function (item) {
    //        item[cacheName] && bingo.each(item[cacheName], function (fn) {
    //            bingo.unLinkNode(item, fn);
    //        });
    //    });
    //};

    var _vm = {
        _cacheName: '__contextFun__',
        bindContext: function (cacheobj, content, hasRet) {

            var cacheName = [content, hasRet].join('_'), cT;
            var contextCache = (cacheobj[_vm._cacheName] || (cacheobj[_vm._cacheName] = {}));
            if (contextCache[cacheName])
                return contextCache[cacheName];
            else {
                cT = bingo.cache(_vm, cacheName);
                if (cT) return cT;
            }

            hasRet && (content = ['try { return ', content, ';} catch (e) {bingo.observe.error(e);}'].join(''));
            var fnDef = [
                        'return function (_this_, $view, $withData, bingo, event) {',
                            'with ($view) {',
                                //如果有withData, 影响性能
                                'with ($withData) {',
                                        content,
                                '}',
                            '}',
                        '};'].join('');
            try {
                cT = contextCache[cacheName] = (new Function(fnDef))();//bingo(多版本共存)
                bingo.cache(_vm, cacheName, cT, 36);
                return cT;
            } catch (e) {
                bingo.trace(content);
                //throw e;
            }
        },
        reset: function (cacheObj) {
            cacheObj[_vm._cacheName] = {};
        }
    }; //end _vm

    //bingo.bindContext = function (owner, content, view, node, withData, event, hasRet) {
    //    var fn = _vm.bindContext(owner, content, hasRet, view, node, withData);
    //    return fn(event);
    //};


    var _newBase = function (p) {
        //基础
        var o = {
            $extend: function (p) {
                return bingo.extend(this, p);
            }
        };
        return o.$extend(p);
    }, _newBindContext = function (p, bd) {
        //绑定上下文
        var _pri = {
            obsList: [],
            withData: {},
            valueObj: function ($this) {
                if (this.valueParams) return this.valueParams;
                var contents = $this.$contents, withData = this.withData,
                    view = $this.$view,
                    hasW = !!withData && withData.bgTestProps(contents),
                    hasView = hasW ? false : view.bgTestProps(contents),
                    hasWin = hasView ? false : window.bgTestProps(contents),
                    obj = hasW ? withData : hasW ? window : view;
                return (this.valueParams = [obj, hasW || hasView || hasWin]);
            }
        };
        var bind = _newBase({
            bgNoObserve: true,
            $view: null,
            $node: null,
            $contents: '',
            $withData: function (name, p) {
                switch (arguments.length) {
                    case 0:
                        return _pri.withData;
                    case 1:
                        return bingo.isObject(name) ? (_pri.withData = name)
                            : _pri.withData[name];
                    case 2:
                        return _pri.withData[name] = p;
                }
            },
            $bindContext: function (contents, isRet) {
                return function (event) { return _vm.bindContext(this, contents, isRet)(this.$node || this.$view, this.$view, _pri.withData || {}, bingo, event); }.bind(this);
            },
            $hasProps: function () {
                return _pri.valueObj(this)[0].bgTestProps(this.$contents);
            },
            $value: function (val) {
                var contents = this.$contents, obj = _pri.valueObj(this)[0];
                if (arguments.length == 0) {
                    return obj.bgDataValue(contents);
                } else {
                    //this.$view.$updateAsync();
                    obj.bgDataValue(contents, val);
                }
            },
            $result: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误, 没有经过过滤器
                /// 在执行之前可以改变contents
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var fn = this.$bindContext(this.$contents, true);
                return fn(event);
            },
            $eval: function (event) {
                /// <summary>
                /// 执行内容, 根据执行返回结果, 会报出错误
                /// 在执行之前可以改变contents
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var fn = this.$bindContext(this.$contents, false);
                return fn(event);
            },
            $layout: function (wFn, fn, num, init) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="wFn"></param>
                /// <param name="fn"></param>
                /// <param name="num"></param>
                /// <param name="init">默认为true</param>
                if (arguments.length == 1) {
                    this.$init(wFn);
                    return;
                }
                var obs = this.$view.$layout(wFn, fn, num, this, true, (init === false));
                _pri.obsList.push(obs);
                (init !== false) && bd && bd.pushStep('CPInit', function () {
                    this.$view.bgToObserve(true);
                    return [obs.init()];
                    //return [bingo.aFramePromise().then(function () { return obs.init(); })];
                }.bind(this));
                return obs;
            },
            $layoutResult: function (fn, num, init) {
                return this.$layout(function () {
                    return this.$result();
                }.bind(this), fn, num, init);
            },
            $layoutValue: function (fn, num, init) {
                this.$hasProps() || this.$value(undefined);
                return this.$layout(function () { return this.$value(); }.bind(this), fn, num, init);
            },
            $init: function (fn) {
                _addCPEvent(this, bd, 'CPInit', fn);
            },
            $ready: function (fn) {
                _addCPEvent(this, bd, 'CPReady', fn);
            }
        }).$extend(p);

        bind.bgOnDispose(function () {
            bingo.each(_pri.obsList, function (obs) {
                obs.bgIsDispose || obs.unObserve();
            });
        });
        bind.bgDispose(_pri);
        return bind;

    }, _pushStepView = function (view, step, _pri, type, bd) {
        bd.pushStep(step, function () {
            if (this.bgIsDispose) return;
            var list = _pri[type], promises = [];
            if (list.length > 0) {
                _pri[type] = [];
                bingo.each(list, function (item) {
                    _promisePush(promises, item && item.call(this, this));
                }, this);
            }
            this.bgToObserve();
            return promises;
        }.bind(view));

    }, _newView = function (p, bd) {

        var _pri = {
            obsList: [],
            obsListUn: [],
            ctrls: [],
            inits: [],
            readys: []
        };
        var _inits = {}, _readys = {}

        //新建view
        var view = _newBase({
            $ownerCP: null,
            $parent: null,
            $children: [],
            $controller: function (fn) {
                _pri.ctrls.push(fn);
            },
            $init: function (p, fn) {
                if (arguments.length == 2) {
                    (_inits[p] || (_inits[p] = [])).push(fn);
                } else if (bingo.isString(p))
                    return _inits[p];
                else
                    _pri.inits.push(p);
            },
            $ready: function (p, fn) {
                if (arguments.length == 2) {
                    (_readys[p] || (_readys[p] = [])).push(fn);
                } else if (bingo.isString(p))
                    return _readys[p];
                else
                    _pri.readys.push(p);
            },
            $observe: function (p, fn, dispoer, check, autoInit) {
                autoInit !== false && this.bgToObserve(true);
                var fn1 = function () {
                    //这里会重新检查非法绑定
                    //所以尽量先定义变量到$view, 再绑定
                    if (this.bgIsDispose) return;
                    //this.$updateAsync();
                    return fn.apply(this, arguments);
                }.bind(this);
                fn1.orgFn = fn.orgFn;//保存原来observe fn
                var obs = !bingo.isFunction(p) ? bingo.observe(this, p, fn1, autoInit)
                    : bingo.observe(p, fn1, autoInit);
                //check是否检查, 如果不检查直接添加到obsList
                if (!check || !obs.isObs)
                    (obs.isObs ? _pri.obsList : _pri.obsListUn).push([obs, dispoer, check]);
                return obs;
            },
            $layout: function (p, fn, fnN, dispoer, check, autoInit) {
                return this.$observe(p, bingo.aFrameProxy(fn, fnN, dispoer), dispoer, check, autoInit);
            },
            $layoutAfter: function (p, fn, dispoer, check, autoInit) {
                return this.$layout(p, fn, 1, dispoer, check, autoInit);
            },
            $update: function (force) {
                if (!this.$isReady) return;
                //this.bgToObserve(true);

                //检查非法观察者
                _pri.obsListUn = _pri.obsListUn.filter(function (item, index) {
                    var dispoer = item[1], obs = item[0], check = item[2];
                    if (dispoer && dispoer.bgIsDispose) {
                        obs.unObserve();
                        return false;
                    }
                    if (!obs.bgIsDispose) {
                        if (!obs.isSucc)
                            obs.refresh();
                        else if (!obs.isObs)
                            force ? obs.refresh() : obs.check();//check();

                        if (obs.isObs) {
                            //如果不是check, 添加到_obsList
                            if (!item[2]) _pri.obsList.push(item);
                            return false;
                        }
                    }
                    return true;
                }, this);
            },
            $updateAsync: function () {
                if (this._upastime_) clearTimeout(this._upastime_);
                this._upastime_ = setTimeout(function () {
                    if (this.bgIsDispose) return;
                    this.$update();
                }.bind(this), 1);
            },
            $remove: function () {
                if (this.$ownerCP) {
                    this.$ownerCP.$html('');
                }
            },
            $getNodes: function () {
                return this.$ownerCP.$getNodes();
            },
            $query: function (selector) {
                return this.$ownerCP.$query(selector);
            },
            $queryAll: function (selector) {
                return this.$ownerCP.$queryAll(selector);
            },
            $insertBefore: function (p, ref, ctrl) {
                return this.$ownerCP.$insertBefore(p, ref, ctrl);
            },
            $insertAfter: function (p, ref, ctrl) {
                return this.$ownerCP.$insertAfter(p, ref, ctrl);
            },
            $inject: function (p, injectObj, thisArg) {
                return this.$app.inject(p, bingo.extend({
                    $view: this,
                    $cp: this.$ownerCP
                }, injectObj), thisArg);
            },
            $link: function (props, view) {
                /// <summary>
                /// 关联数据来源<br />
                /// $link({title:'@title', name:'=name'})<br />
                /// $link({title:'@title', name:'=name'}, this.$parent)
                /// </summary>
                /// <param name="props"></param>
                /// <param name="view">可选， 默认$parent</param>
                view || (view = this.$parent);
                if (!view) return;
                var same = view == this;
                bingo.eachProp(props, function (item, n) {
                    var r = (item.indexOf('@') == 0);
                    r && (item = item.substr(1));
                    if (same && item == n) return;
                    view.$observe(item, function (c) { this.bgDataValue(n, c.value); }.bind(this));
                    this[n] = view.bgDataValue(item);
                    if (r)
                        this.bgToObserve(true);
                    else
                        this.$observe(n, function (c) { this.bgDataValue(item, c.value); }.bind(view));
                }, this);
            }
        }).$extend(p);

        var parentView = view.$parent;
        parentView && parentView.$children.push(view);

        view.bgOnDispose(function () {

            bingo.each(_pri.obsList, function (item) {
                item[0].bgIsDispose || item[0].unObserve();
            });

            bingo.each(_pri.obsListUn, function (item) {
                item[0].bgIsDispose || item[0].unObserve();
            });
            _removeView(this.$app, this);

            if (parentView && !parentView.bgIsDispose) {
                parentView.$children = bingo.removeArrayItem(this, parentView.$children);
            }
        });
        view.bgDispose(_pri);

        if (bd) {
            if (bd.ctrl) {
                view.$controller(bd.ctrl);
                bd.ctrl = null;
            }
            bd.pushStep('ViewCtrl', function () {
                if (this.bgIsDispose) return;
                var ctrls = _pri.ctrls, promises = [];
                if (ctrls.length > 0) {
                    _pri.ctrls = [];
                    bingo.each(ctrls, function (item) {
                        _promisePush(promises, this.$inject(item));
                    }, this);
                }
                return promises;
            }.bind(view));

            _pushStepView(view, 'ViewInit', _pri, 'inits', bd);
            _pushStepView(view, 'ViewReady', _pri, 'readys', bd);
        }

        //编译时同步用
        _addView(view.$app, view);
        return view;
    }, _cpNodeName = '_bgcp_', _getNodeCP = function (node) {
        return node[_cpNodeName];
    }, _removeCPNodes = function (nodes) {
        if (nodes) {
            //_unLinkNodes('_cpLinkC', nodes);
            bingo.each(nodes, function (item) {
                item[_cpNodeName] = null;
                _removeNode(item);
            });
        }
    }, _checkCPNodes = function (cp) {
        var list = [];
        bingo.each(cp.$nodes, function (item) {
            if (!!item.parentNode)
                list.push(item);
        });
        cp.$nodes = list;
    }, _getCPRefNode = function (cp, last) {
        _checkCPNodes(cp);
        var nodes = cp.$nodes;
        var len = cp.$nodes.length;
        return len > 0 ? cp.$nodes[last ? len - 1 : 0] : null;
    }, _clearCP = function (cp) {
        bingo.each(cp.$children, function (item) {
            item.bgDispose();
        });
        bingo.each(cp.$virtualNodes, function (item) {
            item.bgDispose();
        });
        if (cp.$ownerView)
            cp.$ownerView.bgDispose();
        cp.$children = cp.$ownerView = null;
        cp.$virtualNodes = [];
    }, _getCPFirstNode = function (cp, childNodes) {

        var node = _getCPRefNode(cp),
            child = cp.$children[0],
            cNode = child && _getCPRefNode(child);

        if (cNode) {
            var parent = node.parentNode;
            if (cNode.parentNode != parent)
                return node;
            else {
                childNodes || (childNodes = bingo.sliceArray(parent.childNodes));
                var childNodes = bingo.sliceArray(parent.childNodes);
                if (bingo.inArray(node, childNodes) < bingo.inArray(cNode, childNodes))
                    return node;
                else
                    return _getCPFirstNode(child, childNodes);
            }
        } else
            return node;

    }, _getCPLastNode = function (cp, childNodes) {

        var node = _getCPRefNode(cp, true),
            child = cp.$children[cp.$children.length - 1],
            cNode = child && _getCPRefNode(child, true);

        if (cNode) {
            var parent = node.parentNode;
            if (cNode.parentNode != parent)
                return node;
            else {
                childNodes || (childNodes = bingo.sliceArray(parent.childNodes));
                if (bingo.inArray(node, childNodes) > bingo.inArray(cNode, childNodes))
                    return node;
                else
                    return _getCPLastNode(child, childNodes);
            }
        } else
            return node;
    }, _getCPAllNodes = function (cp) {
        var first = _getCPFirstNode(cp),
            last = _getCPLastNode(cp);
        if (first == last) return [first];
        var list = first.nodeType == 1 ? [first] : [], item = first;
        while (last != (item = item.nextSibling) && item) {
            item.nodeType == 1 && list.push(item);
        }
        last.nodeType == 1 && list.push(last);
        return list;
    }, _addCPEvent = function (cp, bd, eName, fn) {
        bd && bd.pushStep(eName, function () {
            return [fn.call(cp)];
        })
    }, _newCP = function (p, extendWith, bd) {
        var _pri = {
            ctrl: null,
            tmpl: '',
            getContent: function (cp) {
                var tmpl = this.tmpl;
                if (bingo.isFunction(tmpl))
                    return tmpl();
                else
                    return tmpl;
            },
            render: function (cp, bd) {
                var ret = this.getContent(cp);
                if (_isPromise(ret))
                    ret.then(function (s) {
                        _traverseCmd(bingo.trim(s), cp, bd);
                    });
                else
                    _traverseCmd(bingo.trim(ret), cp, bd);
                _promisePush(_renderPromise, ret);
            }
        };

        //新建command的CP参数对象
        var cp = _newBindContext({
            $ownerView: null,
            $app: null,
            $cmd: '',
            $attrs: null,
            $nodes: null,
            $virtualNodes: [],
            $isAFrame:true,
            $setNodes: function (nodes) {
                _removeCPNodes(this.$nodes);
                this.$nodes = nodes;
                bingo.each(nodes, function (item) {
                    item[_cpNodeName] = this;
                }, this);
                //_linkNodes('_cpLinkC', nodes, function () {
                //    this.bgDispose();
                //}.bind(this));
            },
            $getNodes: function () {
                return _getCPAllNodes(this);
            },
            $query: function (selector) {
                return this.$queryAll(selector, true)[0];
            },
            $queryAll: function (selector, isFirst) {
                var list = [], isSel = !!selector;
                bingo.each(this.$nodes, function (node) {
                    if (node.nodeType == 1) {
                        if (isSel)
                            list = list.concat(bingo.sliceArray(_queryAll(selector, node)));
                        else
                            list.push(node);
                        if (isFirst && list.length > 0)
                            return false;
                    }
                });
                return list;
            },
            $parent: null,
            $children: null,
            $removeChild: function (cp) {
                this.$children = bingo.removeArrayItem(cp, this.$children);
            },
            $getChild: function (id) {
                var item;
                bingo.each(this.$children, function () {
                    if (this.$id == id) {
                        item = this;
                        return false;
                    }
                });
                return item;
            },
            $export: null,
            $remove: function () {
                this.bgDispose();
            },
            $html: function (s, ctrl) {
                if (arguments.length > 0) {
                    _clearCP(this);
                    this.$tmpl(s);

                    return _compile({ cp: this, context: _getCPRefNode(this), opName: 'insertBefore' }, ctrl);
                } else {
                    var list = [];
                    bingo.each(this.$nodes, function (item) {
                        list.push(item.nodeType == 1 ? item.outerHTML : item.textContent);
                    });
                    return list.join('');
                }
            },
            $insertBefore: function (p, ref, ctrl) {
                /// <summary>
                /// $insertBefore(html|cp|view) html|cp|view放到本cp的最前面<br />
                /// $insertBefore(html|cp|view, cp|view) html|cp|view放到cp|view的前面<br />
                /// </summary>

                //view|cp|this
                var cp = (ref && (ref.$ownerCP || ref)) || this;

                var refNode = _getCPFirstNode(cp);

                if (bingo.isString(p)) {
                    return _compile({
                        tmpl: p,
                        view: cp.$ownerView || cp.$view,
                        parent: ref ? (ref.$ownerCP || ref).$parent : cp,
                        context: refNode,
                        opName: 'insertBefore'
                    }, ctrl).then(function (cpT) {
                        cpT.$parent.$children.unshift(cpT);
                        return cpT;
                    });
                } else {
                    var childs = this.$children, target = p.$ownerCP || p;
                    var index = bingo.inArray(target, childs);
                    if (index >= 0) {
                        if (cp == this) {
                            if (index > 0) {//不能插入相同位置
                                childs.splice(index, 1);
                                childs.unshift(target);
                                _insertDom(_getCPAllNodes(target), refNode, 'insertBefore');
                            }
                        } else {
                            var pIndex = bingo.inArray(cp, childs);
                            if (pIndex >= 0 && (pIndex - 1 != index)) {
                                childs.splice(index, 1);
                                childs.splice(pIndex, 0, target);
                                _insertDom(_getCPAllNodes(target), refNode, 'insertBefore');
                            }
                        }
                    }
                    return _Promise.resolve(target);
                }
            },
            $insertAfter: function (p, ref, ctrl) {
                /// <summary>
                /// $insertBefore(html|cp|view) html|cp|view放到本cp的最后面<br />
                /// $insertBefore(html|cp|view, cp|view) html|cp|view放到cp|view的后面<br />
                /// </summary>
                //view|cp|this
                var cp = (ref && (ref.$ownerCP || ref)) || this;

                var node = _getCPLastNode(cp),
                    refNode = node.nextSibling;

                if (bingo.isString(p)) {
                    return _compile({
                        tmpl: p,
                        view: cp.$ownerView || cp.$view,
                        parent: ref ? (ref.$ownerCP || ref).$parent : cp,
                        context: refNode ? refNode : node.parentNode,
                        opName: refNode ? 'insertBefore' : 'appendTo'
                    }, ctrl).then(function (cpT) {
                        cpT.$parent.$children.push(cpT);
                        return cpT;
                    });
                } else {
                    var target = p.$ownerCP || p, childs = this.$children;
                    var index = bingo.inArray(target, childs);
                    if (index >= 0) {
                        var lastIndex = childs.length - 1;
                        if (cp == this) {
                            if (index != lastIndex) {
                                childs.splice(index, 1);
                                childs.push(target);
                                _insertDom(_getCPAllNodes(target), refNode ? refNode : node.parentNode, refNode ? 'insertBefore' : 'appendTo');
                            }
                        } else {
                            var pIndex = bingo.inArray(cp, childs);
                            if (pIndex >= 0 && (index - 1 != pIndex)) {
                                childs.splice(index, 1);
                                childs.splice(pIndex + 1, 0, target);
                                _insertDom(_getCPAllNodes(target), refNode ? refNode : node.parentNode, refNode ? 'insertBefore' : 'appendTo');
                            }
                        }
                    }
                    return _Promise.resolve(target);
                }
            },
            $text: function (s) {
                if (arguments.length > 0) {
                    _clearCP(this);
                    this.$contents = this.tmplTag = bingo.htmlEncode(s);

                    return _traverseCP(_getCPRefNode(this), this, 'insertBefore');
                } else {
                    var list = [];
                    bingo.each(this.$nodes, function (item) {
                        list.push(item.textContent);
                    });
                    return list.join('');
                }
            },
            $tmpl: function (p) {
                /// <summary>
                /// $tmpl('') <br />
                /// $tmpl(function(){return bingo.tmpl(url);}) <br />
                /// $tmpl(function(){return '';}) <br />
                /// </summary>
                /// <param name="p"></param>
                /// <returns value=''></returns>
                _pri.tmpl = p;
                return this;
            },
            $saveTmpl: function (id, tmpl, isApp) {
                if (isApp)
                    this.$app.saveTmpl(id, tmpl);
                else {
                    var cp = (this.$ownerView || this.$view).$ownerCP;
                    var cObj = cp.__tmpl || (cp.__tmpl = {});
                    cObj[id] = tmpl;
                }
            },
            $loadTmpl: function (p) {

                if (bingo.isString(p) && p.indexOf('#') == 0) {
                    var id = p.substr(1);
                    var cp = (this.$ownerView || this.$view).$ownerCP;
                    var tmpl = cp.__tmpl && cp.__tmpl[id];
                    return bingo.isString(tmpl) ? _Promise.resolve(tmpl) : this.$app.tmpl(p);
                } else
                    return this.$app.tmpl(p);

            },
            _render: function (bd) {
                _pri.render(this, bd);
                return _renderThread();
            },
            $controller: function (fn) {
                _pri.ctrl = fn;
            },
            $inject: function (p, injectObj, thisArg) {
                return this.$app.inject(p,
                    bingo.extend({
                        $view: this.$view,
                        $cp: this
                    }, injectObj), thisArg);
            },
            $link: function (props, view) {
                return (this.$ownerView || this.$view).$link(props, view);
            }
        }, bd).$extend(p);

        cp.$id || (cp.$id = bingo.makeAutoId());

        //要分离上下级的withData
        extendWith && cp.$parent && cp.$withData(bingo.extend({}, cp.$parent.$withData()));
        if (cp.$attrs) {
            cp.$attrs._setCP(cp);
            cp.$name = bingo.trim(cp.$attrs.$getAttr('name'));
        }

        //处理else
        var cmdDef, whereList, app = cp.$app,
            elseList = cp.$elseList;
        if (elseList) {
            var cpT, whereList = cp.$whereList;
            bingo.each(elseList, function (item, index) {
                cpT = _newCP({
                    $cmd: 'else',
                    $app: app,
                    $attrs: _traverseAttr(whereList[index]),
                    $view: cp.$view, $contents: item,
                    $parent: cp
                }, false, bd);

                elseList[index] = cpT;
            });
            cp.$whereList = null;
        }

        cp.bgOnDispose(function () {
            _removeCPNodes(this.$nodes);
            var parent = this.$parent;
            if (parent && !parent.bgIsDispose) {
                parent.$removeChild(this);
            }
            bingo.each(this.$elseList, function (cp) {
                cp.bgIsDispose || cp.bgDispose();
            });
            this.$attrs && this.$attrs.bgDispose();
            _clearCP(this);
        });
        cp.bgDispose(_pri);

        bd && bd.pushStep('CPCtrl', function () {
            if (this.bgIsDispose) return;
            var ctrl = _pri.ctrl, promises = [];
            if (ctrl) {
                _pri.ctrl = null;
                promises.push(this.$inject(ctrl, { $view: this.$ownerView || this.$view }));
            }
            if (this.$cmd != 'view' && this.$name) {
                var view = this.$view;
                view[this.$name] = this.$export || this.$ownerView || view;
            }

            return promises;
        }.bind(cp));

        //用于cp事件与view的事件连接，如$view.$init('select', function(){});
        bd && bd.pushStep('CPEvent', function () {
            if (this.bgIsDispose) return;
            //处理$view.$init('cp', fn), $view.$ready('cp', fn)
            var view = this.$view;
            var e = view.$init(this.$name + '');
            e && bingo.each(e, function (item) { this.$init(item); }, this);

            e = view.$ready(this.$name + '');
            e && bingo.each(e, function (item) { this.$ready(item); }, this);

            return [];
        }.bind(cp));


        if (cp.$cmd) {
            //处理command定义
            cmdDef = app.command(cp.$cmd);
            var rfn = function () {
                cmdDef && (cmdDef = cmdDef.fn);
                cmdDef && _promisePush(_renderPromise, cmdDef(cp));
                _pri.render(cp, bd);
            };

            if (cmdDef || cp.$cmd == 'else') {
                rfn();
            } else {
                _promisePush(_renderPromise, cp.$app.usingAll('command::' + cp.$cmd).then(function () {
                    cmdDef = app.command(cp.$cmd);
                    rfn();
                }));
            }
        } else
            _pri.render(cp, bd);

        return cp;
    }, _newCPAttr = function (contents, bd) {
        return _newBindContext({
            $contents: contents,
        });
    }, _newCPAttrs = function (contents, bd) {
        var _names = [],
            _attrs = _newBindContext({
                $contents: contents,
                $getAttr: function (name) {
                    return this[name] ? this[name].$contents : '';
                },
                $setAttr: function (name, contents) {
                    if (this[name])
                        this[name].$contents = contents;
                    else {
                        _names.push(name);
                        this[name] = _newCPAttr(contents, bd);
                    }
                },
                _setCP: function (cp) {
                    this.$view = cp.$view;
                    this.$cp = cp;
                    this.$withData(cp.$withData());
                    var aT;
                    bingo.each(_names, function (item) {
                        aT = this[item];
                        aT.$cp = cp;
                        aT.$app = cp.$app;
                        aT.$view = cp.$view;
                        aT.$withData(cp.$withData());
                    }, this);
                }
            });
        _attrs.bgOnDispose(function () {
            bingo.each(_names, function (item) {
                this[item].bgDispose();
            }, this);
        });
        return _attrs;
    }, _newDom = function (p) {
        var dom = _newBase({
            $attr: function (name, val) {
                var node = this.$node,
                    aLen = arguments.length;
                switch (name) {
                    case 'class':
                        if (aLen == 1)
                            return node.className;
                        node.className = val;
                        break;
                    case 'value':
                        var isSelect = node.tagName.toLowerCase() == 'select';
                        if (aLen == 1)
                            return (isSelect ? _valSel : _val)(node);
                        else
                            (isSelect ? _valSel : _val)(node, val);
                        break;
                    default:
                        if (aLen == 1)
                            return _attr(node, name);
                        else
                            _attr(node, name, val);
                        break;
                }
            },
            $prop: function (name, val) {
                if (arguments.length == 1)
                    return _prop(this.$node, name);
                else
                    _prop(this.$node, name, val);
            },
            $css: function (name, val) {
                if (arguments.length == 1)
                    return _css(this.$node, name);
                else
                    _css(this.$node, name, val);
            },
            $show: function () {
                _show(this.$node);
            },
            $hide: function () {
                _hide(this.$node);
            },
            $on: function (name, fn, useCaptrue) {
                _eventList.push(bingo.sliceArray(arguments));
                _on.apply(this.$node, arguments);
            },
            $one: function (name, fn, useCaptrue) {
                var args = bingo.sliceArray(arguments),
                    node = this.$node;
                args[2] = function () {
                    fn && fn.apply(this, arguments);
                    _off.apply(node, arguments);
                };
                _eventList.push(args);
                _on.apply(node, args);
            },
            $off: function (name, fn, useCaptrue) {
                _off.apply(this.$node, arguments);
            },
            $is: function (selector) {
                return _isQuery(this.$node, selector);
            },
            $parent: function (selector) {
                var node = _parentQuery(this.$node, selector);
                return node ? _getVNode(node) : null;
            }
        }).$extend(p);
        var _eventList = [];

        dom.bgOnDispose(function () {
            bingo.each(_eventList, function (item) {
                _off.apply(this.$node, item);
            }.bind(this));
        });
        return dom;
    }, _vNodeName = '_bgvn_', _setVNode = function (vn, node) {
        node[_vNodeName] = vn;
    }, _getVNode = function (node) {
        return node[_vNodeName];
    }, _newVirtualNode = function (cp, node, bd) {
        //如果是新view, 读取$ownerView
        var view = cp.$ownerView || cp.$view;
        var vNode = _newDom({
            $view: view,
            $app: view.$app,
            $cp: cp,
            $node: node,
            $attrs: _newBase({}),
            _addAttr: function (name, contents) {
                return this.$attrs[name] = _newVirtualAttr(this, name, contents, bd);
            }
        });
        _setVNode(vNode, node);
        _virtualAttrs(vNode, node);
        cp.$virtualNodes.push(vNode);
        vNode.bgOnDispose(function () {
            node[_vNodeName] = null;
            var attrs = this.$attrs;
            bingo.eachProp(attrs, function (item) {
                item.bgDispose();
            });
        });
        return vNode;
    }, _newVirtualAttr = function (vNode, name, contents, bd) {
        var cp = vNode.$cp;
        var vAttr = _newBindContext(_newDom({
            $cp: cp,
            $vNode: vNode,
            $node: vNode.$node,
            $app: vNode.$app,
            $view: vNode.$view,
            $name: name,
            $contents: contents
        }), bd);

        vAttr.$withData(cp.$withData());

        var def = vAttr.$app.attr(name);
        //def && def(vAttr);
        var promies = def && def(vAttr);
        bd && bd.pushStep('CPInit', function () {
            return promies;
        }.bind(this));
        return vAttr;
    };

    //指令解释:
    //{{cmd /}}
    //{{cmd attr="asdf" /}}
    //{{cmd attr="asdf"}} contents {{/cmd}}
    var _tmplCmdReg = /\{\{\s*(\/?)\s*([^\s{}]+)\s*((?:(?:.|\n|\r)(?!\{\{|\}\}))*)(.?)\}\}/gi,
        //解释else
        _checkElse = /\{\{\s*(\/?if|else)\s*(.*?)\}\}/gi,
        //解释指令属性: attr="fasdf"
        _cmdAttrReg = /(\S+)\s*=\s*(?:\"((?:\\\"|[^"])*?)\"|\'((?:\\\'|[^'])*?)\')/gi,
        //删除注释内容
        _commentRMReg = /\<\!\-\-((?:.|\n|\r)*?)\-\-\>/g;

    //scriptTag
    var _getScriptTag = function (id) { return ['<', 'script type="text/html" bg-id="', id, '"></', 'script>'].join(''); };

    var _addView = function (app, view) {
            app._view.push(view);
        },
        _removeView = function (app, view) {
            app._view = bingo.removeArrayItem(view, app._view);
        },
        _getView = function (app, name) {
            var index = bingo.inArray(function (item) { return item.$name == name; }, app._view);
            return index > -1 ? app._view[index] : null;
        };

    var _traverseTmpl = function (tmpl) {
        var item, isSingle, isEnd, tag, attrs, find, contents,
            list = [], strAll = [], lastIndex = 0,
            strIndex = 0,
            index, lv = 0, id;
        _tmplCmdReg.lastIndex = 0;
        tmpl = tmpl.replace(_commentRMReg, '');
        while (item = _tmplCmdReg.exec(tmpl)) {
            find = item[0];
            index = item.index;

            tag = item[2];
            isSingle = item[4] == '/' || tag == 'else' || tag == 'case';
            isEnd = isSingle || item[1] == '/';
            attrs = item[3];
            !isSingle && (attrs = attrs + item[4]);

            if (lv == 0) {
                if (isSingle || !isEnd) {

                    contents = tmpl.substr(lastIndex, index - lastIndex);
                    strAll.push(contents);

                    id = bingo.makeAutoId();
                    strAll.push(_getScriptTag(id));
                    list.push({
                        id: id,
                        //lv: lv,
                        index: index,
                        //find: find,
                        single: isSingle,
                        end: isEnd,
                        tag: tag,
                        attrs: attrs,
                        contents: ''
                    });
                }
                strIndex = index + find.length;
            }
            if (isEnd) {
                if (!isSingle) lv--;
                if (lv == 0)
                    list[list.length - 1].contents = tmpl.substr(strIndex, index - strIndex);
            } else {
                lv++;
            }
            lastIndex = index + find.length;
        }
        strAll.push(tmpl.substr(lastIndex, tmpl.length - lastIndex))

        return { contents: strAll.join(''), regs: list };
    };

    var _traverseCmd = function (tmpl, cp, bd) {
        var list = [], view, app;
        bingo.isString(tmpl) || (tmpl = bingo.toStr(tmpl));
        var tmplContext = _traverseTmpl(tmpl);

        tmpl = tmplContext.contents;
        bingo.each(tmplContext.regs, function (reg) {

            var elseList, whereList, item,
                cmd = reg.tag,
                contents = reg.contents;
            contents && (contents = bingo.trim(contents));
            if (cmd == 'if') {
                var elseContent = _traverseElse(contents);
                contents = elseContent.contents;
                elseList = elseContent.elseList;
                whereList = elseContent.whereList;
            }
            item = {
                $id: reg.id,
                $cmd: cmd,
                $attrs: _traverseAttr(reg.attrs, bd),
                $contents: contents,
                $elseList: elseList,
                $whereList: whereList
            };
            (item.$cmd == 'view') && (view = item);
            list.push(item);

        });

        if (view) {
            app = bingo.app(view.$attrs.$getAttr('app'));
            app == bingo.defualtApp && (app = cp.$app);
            view = _newView({
                $name: bingo.trim(view.$attrs.$getAttr('name')),
                $app: app,
                $parent: cp.$view,
                $ownerCP: cp
            }, bd);
            cp.$ownerView = view;
        } else {
            app = cp.$app;
            view = cp.$view;
        }

        var children = [], tempCP;
        bingo.each(list, function (item) {
            tempCP = _newCP(bingo.extend(item, {
                $view: view,
                $app: app,
                $parent: cp
            }), true, bd);

            children.push(tempCP);
        });

        cp.$children = children;
        cp.tmplTag = tmpl;
        //return _retPromiseAll(promises);
    }, _traverseElse = function (contents) {
        var lv = 0, item, cmd, index = -1, start = -1;
        _checkElse.lastIndex = 0;
        var elseList = [], whereList = [], wh;
        while (item = _checkElse.exec(contents)) {
            cmd = item[1];
            wh = bingo.trim(item[2]);
            switch (cmd) {
                case 'if':
                    lv++;
                    break;
                case 'else':
                    if (lv <= 0) {
                        whereList.push(wh);
                        if (start == -1) start = item.index;
                        if (index >= 0) {
                            elseList.push(contents.substr(index, item.index - index));
                        }
                        //查找到位置加查找的长度
                        index = item.index + item[0].length;
                    }
                    break;
                case '/if':
                    lv--;
                    break;
            }
        }
        if (lv <= 0 && index > -1 && index < contents.length) {
            elseList.push(contents.substr(index));
        }

        return { contents: start > -1 ? contents.substr(0, start) : contents, elseList: elseList, whereList: whereList };
    }, _traverseAttr = function (s, bd) {
        _cmdAttrReg.lastIndex = 0;
        var item, attrs = _newCPAttrs(s, bd);
        while (item = _cmdAttrReg.exec(s)) {
            attrs.$setAttr(item[1], item[2] || item[3]);
        }
        return attrs;
    }, _renderPromise = [], _renderThread = function () {
        var promises = _renderPromise;
        _renderPromise = [];
        return _Promise.always(promises).then(function () {
            if (_renderPromise.length > 0) return _renderThread();
        });
    }, _newBuild = function (isAFrame) {
        var _stepObj = {}, _doneStep = function (stepList, name) {
            
            var isFr = isAFrame !== false && (name.indexOf('Ready') > 0 || name.indexOf('Init') > 0),
                fn = function () {
                    var promises = [];
                    bingo.each(stepList, function (fn) {
                        _promisePushList(promises, fn());
                    });
                    return _retPromiseAll(promises, true).then(bd.doneStep(name));
                };

            if (isFr)
                return bingo.aFramePromise().then(fn);
            else
                return fn();
        }, end = false,bd;
        return bd = {
            pushStep: function (name, fn) {
                if (_stepObj[name])
                    _stepObj[name].push(fn);
                else
                    _stepObj[name] = [fn];

                if (end) this.doneStep(name)();
            },
            doneStep: function (name) {
                var stepList = _stepObj[name],
                  has = stepList && stepList.length > 0;
                has && (_stepObj[name] = []);
                return function () { return has ? _doneStep(stepList, name) : null };
            },
            end: function () {
                end = true;
            }
        };
    };

    /* 检测 scope */
    var _qScope = ":scope ";
    try {
        _docEle.querySelector(":scope body");
    } catch (e) {
        _qScope = '';
    }

    var _doc = document,
        _docEle = _doc.documentElement, _queryAll = function (selector, context) {
            context || (context = _docEle);
            return context.querySelectorAll(_qScope + selector);
        }, _query = function (selector, context) {
            context || (context = _docEle);
            return context.querySelector(_qScope + selector);
        };


    var _removeNode = function (node) {
        node.parentNode && node.parentNode.removeChild(node);
    }, _injWithName = 'bingo_cmpwith_';

    var _spTags = 'html,body,head', _wrapMap = {
        select: [1, "<select multiple='multiple'>", "</select>"],
        fieldset: [1, "<fieldset>", "</fieldset>"],
        table: [1, "<table>", "</table>"],
        tbody: [2, "<table><tbody>", "</tbody></table>"],
        tr: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        colgroup: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        map: [1, "<map>", "</map>"],
        div: [1, "<div>", "</div>"]
    }, _scriptType = /\/(java|ecma)script/i,
    _cleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g, _globalEval = function (node) {
        if (node.src) {
            bingo.defualtApp.using(node.src);
        } else {
            var data = (node.text || node.textContent || node.innerHTML || "").replace(_cleanScript, "");
            if (data) {
                (window.execScript || function (data) {
                    window["eval"].call(window, data);
                })(data);
            }
        }
    }, _parseSrcipt = function (container, script) {
        bingo.each(container.querySelectorAll('script'), function (node) {
            if (!node.type || _scriptType.test(node.type)) {
                _removeNode(node);
                script && _globalEval(node);
            }
        });
    }, _parseHTML = function (html, p, script) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="html"></param>
        /// <param name="p">可以父节点或父节点tagName</param>
        /// <param name="script">是否运行script</param>
        /// <returns value=''></returns>
        var tagName = p ? (bingo.isString(p) ? p : p.tagName.toLowerCase()) : '';
        var wrap = _wrapMap[tagName] || _wrapMap.div, depth = wrap[0];
        html = wrap[1] + html + wrap[2];
        var container = _doc.createElement('div');
        container.innerHTML = html;
        while (depth--) {
            container = container.lastChild;
        }
        _parseSrcipt(container, script);
        return bingo.sliceArray(container.childNodes);
    }, _insertDom = function (nodes, refNode, fName) {
        //fName:appendTo, insertBefore
        var p;
        if (nodes.length > 1) {
            p = document.createDocumentFragment();
            bingo.each(nodes, function (item) {
                p.appendChild(item);
            });
        } else
            p = nodes[0];
        if (fName == 'appendTo')
            refNode.appendChild(p);
        else
            refNode.parentNode[fName](p, refNode);
    };

    //是否支持select注释
    var _isComment = (_parseHTML('<option>test</option><!--test-->', 'select').length > 1),
        _commentPrefix = 'bg-virtual',
        //取得cp空白节点
        _getCpEmptyNode = function (cp) {
            //var html = (_isComment) ?
            //    ['<!--', _commentPrefix, cp.$id, '-->'].join('') :
            //    _getScriptTag(cp.$id);
            var html = (_isComment) ?
                ['<!--bg-virtual-->'].join('') :
                _getScriptTag(cp.$id);
            return _parseHTML(html)[0];
        },
        _isScriptTag = /script/i,
        //取得render cp标签节点
        _getEmptyRenderId = function (node) {
            return (_isScriptTag.test(node.tagName)) ?
                node.getAttribute('bg-id') : null;
        },
        _isEmptyNode = function (node) {
            if (_isComment) {
                return (node.nodeType == 8 && node.nodeValue.indexOf(_commentPrefix) == 0);
            } else {
                return (_isScriptTag.test(node.tagName)) ?
                    node.getAttribute('bg-id') : false;
            }
        },

        //检查是否空内容（没有nodeType==1和8）, 如果为空， 添加一个临时代表
        _checkEmptyNodeCp = function (nodes, cp) {
            var empty = nodes.length == 0;
            if (!empty) {
                //是否有element节点, 注释节点不算
                empty = (bingo.inArray(function (item) {
                    return !_isEmptyNode(item);
                    //return _isLinkNodeType(item.nodeType);
                }, nodes) < 0);
            }
            empty && nodes.push(_getCpEmptyNode(cp));
        };

    var _traverseCP = function (refNode, cp, optName, bd) {
        var tmpl = _renderAttr(cp.tmplTag);

        var nodes = _parseHTML(tmpl, optName == 'appendTo' ? refNode : refNode.parentNode, true);

        if (nodes.length > 0) {
            var pNode = nodes[0].parentNode;
            _virtualNodes(cp, nodes, bd);
            _traverseNodes(nodes, cp, bd);
            //重新读取childNodes，原因可以处理子级过程中有删除或增加节点
            nodes = bingo.sliceArray(pNode.childNodes);
        }

        //检查是否空内容， 如果空，增加一个临时节点
        _checkEmptyNodeCp(nodes, cp);
        //if (isFrame)
        //    bingo.aFrame(function () {
        //        _insertDom(nodes, refNode, optName);
        //    });
        //else
            _insertDom(nodes, refNode, optName);

        cp.$setNodes(nodes);
    }, _traverseNodes = function (nodes, cp, bd) {

        var id, tempCP;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                //script的bg-id
                id = _getEmptyRenderId(item);
                if (id) {
                    //获取子cp
                    tempCP = cp.$getChild(id);
                    if (tempCP) {
                        //处理子cp
                        _traverseCP(item, tempCP, 'insertBefore', bd);
                        //删除script临时节点
                        _removeNode(item);
                    }
                } else {
                    //分析所有script节点， script临时节点
                    _traverseNodes(_queryAll('script', item), cp, bd);
                }
            }
        });
    };

    //_compile({view:view, tmpl:tmpl, context:node, opName:'appendTo', parent:cp});
    //_compile({cp:cp, context:node, opName:'insertBefore'});
    var _compile = function (p, ctrl) {
        var view = p.view;
        var bd = _newBuild(!p.cp || p.cp.$isAFrame);
        bd.ctrl = ctrl;
        var cp = p.cp || _newCP({
            $app: view.$app || bingo.defualtApp,
            $parent: p.parent || view.$ownerCP,
            $view: view, $contents: p.tmpl
        }, false, bd).$tmpl(p.tmpl);


        //render-->cpctrl-->viewctrl-->cpevent-->dom编译-->cpinit-->viewinit--cpready-->viewready
        return cp._render(bd).then(function () {
            return _Promise.resolve().then(bd.doneStep('CPCtrl')).then(bd.doneStep('ViewCtrl')).then(bd.doneStep('CPEvent')).then(function () {
                var node = p.context, opName = p.opName;
                _traverseCP(node, cp, opName, bd);
            }).then(bd.doneStep('CPInit')).then(bd.doneStep('ViewInit'))
            .then(bd.doneStep('CPReady')).then(bd.doneStep('ViewReady'));

            //return _complieInit().then(function () { return cp; });
        }).then(function () { bd.end(); return cp; });
    };

    //<>&"
    //&lt;&gt;&amp;&quot;
    var _attrEncode = bingo.attrEncode = function (s) {
        return !s ? '' : s.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\&/g, '&amp;').replace(/\"/g, '&quot;');
    };
    bingo.attrDecode = bingo.htmlDecode;


    //查找dom 节点 <div>
    var _domNodeReg = /\<(?:.|\n|\r)*?\[\[(?:.|\n|\r)*?\]\][^>]*\>/gi,
        //解释可绑定的节点属性: attr="fasdf[[user.name]]"
        _domAttrReg = /\s*(\S+)\s*=\s*((\")(?:\\\"|[^"])*?\[\[(?:.|\n|\r)+?\]\](?:\\\"|[^"])*\"|(\')(?:\\\'|[^'])*?\[\[(?:.|\n|\r)+?\]\](?:\\\'|[^'])*\')/gi,
        //用于解释节点属性时， 将内容压成bg-virtual
        //如:<div value="[user.name]" style="[[user.style]]"></div>
        //解释成<div  bg-virtual="{value:'user.name', style:'user.style'}"></div>
        _domNodeRPReg = /\s*(\/?\>)$/,
        //如果绑定纯变量时去除"', 如valu="[[user.name]]", 解释后value=[[user.name]]
        _domAttrPotReg = /^\s*['"]((?:.|\n|\r)*?)['"]\s*$/,
        //如果绑定纯变量时去除[], 如valu=[[user.name]], 解释后value=user.name
        _domAttrOnlyReg = /^\s*\[\[((?:.|\n|\r)*?)\]\]\s*$/,
        //转义多个绑定时， 如果style="[[ok]]asdf[[false]]sdf", 解释后 style="''+ ok + 'asdf' + false + 'sdf"
        _domAttrMultReg = /\[\[((?:.|\n|\r)*?)\]\]/g,
        _domAttrVirName = 'bg-virtual',
        _domAttrVirSt = [' ', _domAttrVirName, '="'].join(''),
        _domAttrVirEn = '" $1',
        _domAttrQuery = '[' + _domAttrVirName + ']';

    var _renderAttr = function (tmpl) {
        tmpl = tmpl.replace(_domNodeReg, function (find, pos, contents) {

            _domAttrReg.lastIndex = 0;
            var domAttrs = {}, has = false, isV = false;
            var findR = find.replace(_domAttrReg, function (findAttr, name, contents, dot, dot1) {

                if (isV || name == _domAttrVirName) { has = false; isV = true; return; }
                dot = dot || dot1;
                contents = contents.replace(_domAttrPotReg, '$1')
                    .replace(_domAttrOnlyReg, '$1')

                _domAttrMultReg.lastIndex = 0;
                if (_domAttrMultReg.test(contents))
                    contents = dot + contents.replace(_domAttrMultReg, dot + ' + ($1) + ' + dot) + dot;
                //dot = dot || dot1;
                domAttrs[name] = contents;
                has = true;
                return '';// 'bg-' + findAttr;
            });
            if (has) {
                findR = findR.replace(_domNodeRPReg, [_domAttrVirSt, _attrEncode(JSON.stringify(domAttrs)), _domAttrVirEn].join(''));
            }
            //virtual
            return isV ? find : findR;
        });
        return tmpl;
    }, _virtualNodes = function (cp, nodes, bd) {
        var list = [], ltemp;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                if (item.hasAttribute(_domAttrVirName))
                    _newVirtualNode(cp, item, bd);
                if (item.hasChildNodes) {
                    ltemp = _queryAll(_domAttrQuery, item);
                    if (ltemp.length > 0) {
                        bingo.each(ltemp, function (cItem) {
                            _newVirtualNode(cp, cItem, bd);
                        });
                    }
                }
            }
        });

        //if (cp && cp.$virtualNodes.length > 0)
        //    console.log('_virtualNodes', cp.$virtualNodes);
    },
    _virtualAttrs = function (vNode, node) {
        var attr = node.getAttribute(_domAttrVirName),
            context = JSON.parse(bingo.attrDecode(attr));

        node.removeAttribute(_domAttrVirName);

        var list = [];
        bingo.eachProp(context, function (item, n) {
            vNode._addAttr(n, item);
        });

    };

    var _attr = function (node, name, val) {
        if (arguments.length < 3)
            return node.getAttribute(name);
        else
            node.setAttribute(name, val)
    },
    _prop = function (node, name, val) {
        if (arguments.length < 3)
            return node[name];
        else
            node[name] = val;
    },
    _on = document.addEventListener,
    _off = document.removeEventListener,
    _val = function (node, val) {
        if (arguments.length < 2)
            return node.value;
        else
            node.value = val;
    },
    _valSel = function (node, val) {
        var one = node.type == 'select-one';
        if (one) {
            if (arguments.length < 2)
                return node.value;
            else
                node.value = val;
        } else {
            var options = node.options,
                ret = [];
            if (arguments.length < 2) {
                bingo.each(options, function (item) {
                    if (item.selected && !item.disabled)
                        ret.push(item.value);
                });
                return ret;
            } else {
                bingo.isArray(val) || (val = [val]);
                bingo.each(options, function (item) {
                    item.selected = (val.indexOf(item.value) >= 0);
                });
            }
        }
    };

    var _getComputedStyle = document.defaultView.getComputedStyle,
        _cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        _dasherize = function (str) {
            return str.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/_/g, '-')
                   .toLowerCase();
        },
        _maybeAddPx = function (name, value) {
            return (bingo.isNumeric(value) && !_cssNumber[_dasherize(name)]) ? value + "px" : value;
        },
        _css = function (node, property, value) {
            var argLen = arguments.length;
            if (argLen < 3) {
                return argLen == 1 ? undefined : node.style[_dasherize(property)] || _getComputedStyle(node, '').getPropertyValue(_dasherize(property));
            }

            var css = null;
            property = _dasherize(property);
            if (value == '')
                node.style.removeProperty(property);
            else
                css = property + ":" + _maybeAddPx(property, value);

            css && (node.style.cssText += ';' + css);
        },
        _getshow = function (node) {
            var name = '_bgshow_';
            return name in node ? node[name] : (node[name] = _css(node, 'display'));
        },
        _show = function (node) {
            var sh = _getshow(node);
            _css(node, 'display', sh == 'none' ? 'block' : sh);
        },
        _hide = function (node) {
            _getshow(node);
            _css(node, 'display', 'none');
        },
        _spaceRE = /\s+/g,
        _getClass = function (node) {
            var cn = node.className;
            return cn ? cn.split(_spaceRE) : [];
        },
        _setClass = function (node, classNames) {
            var cn = classNames.join(' ');
            (cn == node.className) || (node.className = cn);
        },
        _hasClass = function (classNames, name) {
            return name ? classNames.indexOf(name) >= 0 : false;
        },
        _addClass = function (classNames, name) {
            _hasClass(classNames, name) || classNames.push(name);
        },
        _removeClass = function (classNames, name) {
            if (!_hasClass(classNames, name)) return classNames;
            return classNames.filter(function (item) {
                return item != name;
            });
        };

    var _matches = _docEle.matchesSelector ||
			_docEle.mozMatchesSelector ||
			_docEle.webkitMatchesSelector ||
			_docEle.oMatchesSelector ||
			_docEle.msMatchesSelector,
        _isQuery = function (node, selector) {
            return _matches.call(node, selector);
        }, _parentQuery = function (node, selector) {
            node = node.parentNode;
            return (!node || node == _docEle || node == _doc) ? null : (!selector || _isQuery(node, selector) ? node : _parentQuery(node, selector));
        };


    bingo.app.extend({
        _view: [],
        view: function (p) {
            /// <summary>
            /// 获取view<br />
            /// app.view('main') <br />
            /// app.view(document.body)
            /// </summary>

            if (arguments.length == 0)
                return this._view;
            else if (bingo.isString(p))
                return _getView(this, p);
            else {
                var cp = _getNodeCP(p);
                return cp ? (cp.$ownerView || cp.$view) : null;
            }
        },
        cp: function (node) {
            /// <summary>
            /// 获取cp <br />
            /// app.cp(document.body);
            /// </summary>
            /// <param name="node"></param>
            return _getNodeCP(node);
        }
    });

    bingo.rootView = function () { return _rootView; };
    var _rootView = _newView({
        $name: '',
        $app: bingo.app('')
    }), _rootCP = _newCP({
        $app: bingo.defualtApp,
        $parent: null,
        $view: _rootView, $contents: '',
        $ownerView: _rootView
    });
    _rootView.$ownerCP = _rootCP;

    bingo.compile = function (node, ctrl) {
        var cp = _getNodeCP(node) || _rootCP,
            app = cp.$app,
            view = cp.$view,
            isScript = node.tagName.toLowerCase() == 'script';
        
        return app.usingAll().then(function () {
            var r = app.tmpl(node).then(function (tmpl) {
                node.innerHTML = '';
                return _compile({
                    tmpl: tmpl,
                    view: view,
                    parent: view.$ownerCP || cp,
                    context: node,
                    opName: isScript ? 'insertBefore' : 'appendTo'
                }, ctrl).then(function (cpT) {
                    isScript && _removeNode(node);
                    cpT.$parent.$children.push(cpT);
                    return cpT;
                });
            });
            return r;
        });
    };

    bingo.bgEventDef('ready');

    (function () {

        ////DOMContentLoaded 时起动
        var _readyName = 'DOMContentLoaded', _ready = function () {
            _doc.removeEventListener(_readyName, _ready, false);
            window.removeEventListener('load', _ready, false);
            //等待动态加载js完成后开始
            bingo.bgEnd('ready');
        };

        _doc.addEventListener(_readyName, _ready, false);
        window.addEventListener("load", _ready, false);

        window.addEventListener('unload', function () {
            bingo.rootView().$ownerCP.$remove()
        }, false);
    })();

})(bingo);


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

    defualtApp.service('$ajax', ['$app', function ($app) {
        return function (url, p) { return $app.ajax(url, p); };
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

    defualtApp.service('$tmpl', ['$app', function ($app) {
        return function (p, ap) {
            return $app.tmpl(p, true, ap);
        };
    }]);

    var _cacheObj = {};
    defualtApp.service('$cache', function () {
        return function (key, value, max) {
            var args = [_cacheObj].concat(bingo.sliceArray(arguments));
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


(function (bingo) {
    "use strict";

    var defualtApp = bingo.defualtApp;

    var _addCtrl = function (cp) {


        var ctrlAttr = cp.$attrs.$getAttr('controller');

        if (!bingo.isNullEmpty(ctrlAttr)) {
            var ctrl, view = cp.$view, pView = view.$parent,
                app = view.$app;
            if (pView.bgTestProps(ctrlAttr))
                ctrl = pView.bgDataValue(ctrlAttr);
            else if (window.bgTestProps(ctrlAttr))
                ctrl = window.bgDataValue(ctrlAttr);

            if (bingo.isFunction(ctrl) && bingo.isFunction(ctrl)) {
                cp.$view.$controller(ctrl);
            } else {
                var url = 'controller::' + ctrlAttr;
                var routeContext = app.routeContext(url);
                var context = routeContext.context();

                if (context.controller) {
                    view.$controller(context.controller)
                } else {
                    //如果找不到controller, 加载js
                    return app.using(url).then(function () {
                        if (cp.bgIsDispose) return;
                        var context = routeContext.context();
                        if (context.controller) {
                            view.$controller(context.controller)
                        }
                    });
                }
            }

        }
    };

    defualtApp.command('view', function (cp) {
        return _addCtrl(cp);
    });

    defualtApp.command('controller', function (cp) {

        var src = cp.$attrs.$getAttr('src');

        if (!src) cp.$view.$controller(function () {
            cp.$eval();
        });
        else return _addCtrl(src);

    });

    defualtApp.command('using', function (cp) {
        var src = cp.$attrs.$getAttr('src');
        return src && cp.$app.using(src);
    });

    defualtApp.command('service', function (cp) {
        var src = cp.$attrs.$getAttr('src'),
            name = cp.$attrs.$getAttr('name');
        return src && name && cp.$inject(src).then(function (srv) { cp.$view[name] = srv; });
    });

    var _forItemReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/;


    defualtApp.command('with', function (cp) {
        cp.$isAFrame = false;

        var contents = cp.$attrs.$contents;

        var itemName, dataName;
        if (_forItemReg.test(contents)) {
            itemName = RegExp.$1,
            dataName = RegExp.$2 || RegExp.$4;
        } else {
            dataName = contents;
        }
        
        if (dataName) {
            cp.$init(function () {
                var bindContext = cp.$attrs.$bindContext(dataName, true),
                    data = bindContext() || {};
                var withData = bingo.extend({}, cp.$withData());
                if (itemName)
                    cp.$withData(itemName, data);
                else
                    cp.$withData(data);

                return cp.$html(cp.$contents);
            });
        }

    });

    var _makeForTmpl = function (tmpl, datas, itemName, pWithData, withListName) {
        datas = bingo.extend([], datas);
        pWithData = pWithData || {};
        var withDataList = [],
            count = datas.length, tmplList = [];

        bingo.each(datas, function (data, index) {
            var obj = bingo.extend({}, pWithData);
            obj.itemName = itemName;
            obj[[itemName, 'index'].join('_')] = obj.$index = index;
            obj[[itemName, 'count'].join('_')] = obj.$count = count;
            obj[[itemName, 'first'].join('_')] = obj.$first = (index == 0);
            obj[[itemName, 'last'].join('_')] = obj.$last = (index == count - 1);
            var isOdd = (index % 2 == 0);//单
            obj[[itemName, 'odd'].join('_')] = obj.$odd = isOdd;
            obj[[itemName, 'even'].join('_')] = obj.$even = !isOdd;
            obj[itemName] = data;
            withDataList.push(obj);

            tmplList.push(['{{with ', withListName, '[', index ,'] }}', tmpl, '{{/with}}'].join(''));

            //htmls.push(_compiles.injWithTmpl(tmpl, index, pIndex));
        }, this);
        pWithData[withListName] = withDataList;

        return tmplList.join('');
    };

    defualtApp.command('for', function (cp) {

        cp.$isAFrame = false;

        var contents = cp.$attrs.$contents;
        var withListName = '_bg_for_datas_' + bingo.makeAutoId();

        if (_forItemReg.test(contents)) {
            var itemName = RegExp.$1, dataName = RegExp.$2 || RegExp.$4;
            if (itemName && dataName) {
                cp.$attrs.$contents = dataName;
                cp.$layout(function () {
                    return cp.$attrs.$result();
                }, function (c) {
                    var t = c.value,
                        isL = bingo.isArray(t),
                        datas = isL ? t : bingo.sliceArray(t);
                    (!isL) && datas.length == 0 && (datas = t ? [t] : []);

                    var html = _makeForTmpl(cp.$contents, datas, itemName, cp.$withData(), withListName);
                    return cp.$html(html);

                });
            }
        }

        cp.bgOnDispose(function () {
            var withData = cp.$withData();
            delete withData[withListName];
        });

    });

    defualtApp.command('if', function (cp) {

        var _contents = cp.$contents,
            _elseList = cp.$elseList, _getContent = function (index, val) {
                if (index == -1 && val)
                    return _contents;
                else {
                    var ret = cp.$attrs.$result();
                    if (ret) return _contents;
                    var s;
                    bingo.each(_elseList, function (item, i) {
                        if (!item.$attrs.$contents || (index == i && val)
                            || item.$attrs.$result()) {
                            s = item.$contents
                            return false;
                        }
                    });
                    return s;
                }
            }, _tid, _html = function (c, index) {
                if (_tid) return;
                _tid = true;
                return bingo.Promise.timeout(1).then(function () { _tid = false; return cp.$html(_getContent(index, c.value)); });
            };
        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return _html(c, -1);
        });

        bingo.each(_elseList, function (item, index) {
            item.$attrs.$contents && cp.$layout(function () {
                return item.$attrs.$result();
            }, function (c) {
                return _html(c, index);
            });
        });

    });

    defualtApp.command('include', function (cp) {
        var src = cp.$attrs.$getAttr('src');

        cp.$init(function () {
            return !src ? cp.$html(cp.$contents) : cp.$loadTmpl(src).then(function (tmpl) { return cp.$html(tmpl); });
        });

    });

    defualtApp.command('html', function (cp) {

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$html(c.value);
        });

    });

    defualtApp.command('text', function (cp) {

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$text(c.value);
        });

    });

    defualtApp.command('cp', function (cp) {
        cp.$tmpl(cp.$contents);
        cp.$export = cp;
    });

    //{{tmpl id="tmpl001" for="app"}} tmpl contents {{/tmpl}}
    defualtApp.command('tmpl', function (cp) {
        var id = cp.$attrs.$getAttr('id');
        if (id) {
            var isApp = /app/i.test(cp.$attrs.$getAttr('for'));
            cp.$saveTmpl(id, cp.$contents, isApp);
        }
        cp.$init(function () { cp.$remove(); });
    });

    defualtApp.command('route', function (cp) {

        var src = cp.$attrs.$getAttr('src'),
            app = cp.$app;

        src && cp.$init(function () {
            location.href(src);
        });

        var location = {
            bgNoObserve: true,
            url: src,
            name: cp.$name,
            href: function (src) {
                this.url = src;
                return cp.$loadTmpl('route::' + src).then(function (html) { return cp.$html(html); });
            },
            //路由query部分参数
            queryParams: function () {
                return this.routeParams().queryParams
            },
            //路由参数
            routeParams: function () {
                var url = this.url;
                var routeContext = app.routeContext('route::' + url);
                return routeContext.params;
            },
            reload: function () {
                return this.href(src);
            },
            toString: function () {
                return this.url;
            },
            close: function () {
                cp.$remove();
                this.bgDispose();
            }
        };

        cp.$name && (cp.$app._location[cp.$name] = location);

        cp.$export = location;
    });

    bingo.app.extend({
        _location:{},
        location: function (name) {
            return this._location[name];
        }
    });
    
    
})(bingo);


(function (bingo) {
    "use strict";

    var defualtApp = bingo.defualtApp;
    bingo.app.extend({
        _attr:{},
        attr: function (name, fn) {
            if (arguments.length == 1)
                return this._attr[name] || defualtApp._attr[name] || defualtApp._attr[_vAttrDefaultName];
            else
                this._attr[name] = fn;
        }
    });

    //默认attr
    var _vAttrDefaultName = 'bg_default_vattr',
        _isEvent = /^\s*on/i;
    defualtApp.attr(_vAttrDefaultName, function (vAttr) {

        var name = vAttr.$name, view = vAttr.$view;

        if (_isEvent.test(name)) {
            var eventName = name.replace(_isEvent, ''),
                bind = function (evName, callback) {
                    var fn = function () {
                        view.$updateAsync();
                        return callback.apply(this, arguments);
                    };
                    vAttr.$on(evName, fn);
                };

            var fn = /^\s*\[(.|\n)*\]\s*$/g.test(vAttr.$contents) ? vAttr.$result() : vAttr.$value();
            if (!bingo.isFunction(fn) && !bingo.isArray(fn))
                fn = function (e) { return vAttr.$eval(e); };
            bind(eventName, fn);
            return;
        }

        vAttr.$layoutResult(function (c) {
            if (name == 'value' && vAttr.$is('option')) {
                var vNode = vAttr.$parent('select');
                if (vNode && vNode.$attrs.model)
                    if (vNode.$attrs.model.$value() == c.value) vAttr.$prop('selected', true);
            }
            vAttr.$attr(name, c.value);
        });

    });

    defualtApp.attr('node', function (vAttr) {

        vAttr.$init(function () {
            vAttr.$value(vAttr.$node);
        });

    });

    bingo.each('checked,unchecked,disabled,enabled,readonly'.split(','), function (attrName) {
        defualtApp.attr(attrName, function (vAttr) {

            var _set = function (val) {
                switch (attrName) {
                    case 'enabled':
                        vAttr.$prop('disabled', !val);
                        break;
                    case 'unchecked':
                        vAttr.$prop('checked', !val);
                        break;
                    default:
                        vAttr.$prop(attrName, val);
                        break;
                }
            };

            vAttr.$layoutResult(function (c) {
                _set(c.value);
            });

            if (attrName == 'checked' || attrName == 'unchecked') {
                var fn = function () {
                    var value = vAttr.$prop('checked');
                    vAttr.$value(attrName == 'checked' ? value : !value);
                };
                //如果是checked, unchecked, 双向绑定
                vAttr.$on('click', fn);
            }

        });
    });
    bingo.each('show,hide,visible'.split(','), function (attrName) {
        defualtApp.attr(attrName, function (vAttr) {

            var _set = function (val) {

                switch (attrName) {
                    case 'hide':
                        val = !val;
                    case 'show':
                        if (val) vAttr.$show(); else vAttr.$hide();
                        break;
                    case 'visible':
                        val = val ? 'visible' : 'hidden';
                        vAttr.$css('visibility', val);
                        break;
                }
            };

            vAttr.$layoutResult(function (c) {
                _set(c.value);
            });

        });
    });

    defualtApp.attr('model', function (vAttr) {

        var _val = function (val) {
            if (arguments.length == 0)
                return vAttr.$attr('value');
            else
                vAttr.$attr('value', val);
        };

        var node = vAttr.$node;

        var _type = vAttr.$attr('type'),
            _isRadio = _type == 'radio',
            _isCheckbox = _type == 'checkbox',
            _checkboxVal = _isCheckbox ? _val(node) : null,
            _isSelect = node.tagName.toLowerCase() == 'select';

        var _getNodeValue = function () {
            return _isCheckbox ? (vAttr.$prop("checked") ? _checkboxVal : '') : (_val());
        }, _setNodeValue = function (value) {
            value = _isSelect && bingo.isArray(value) ? value : bingo.toStr(value);
            if (_isCheckbox) {
                vAttr.$prop("checked", (_val() == value));
            } else if (_isRadio) {
                vAttr.$prop("checked", (_val() == value));
            } else if (_isSelect)
                _val(value);
            else
                _val(value);
        };

        var _eVal, eName, fn = function () {
            var value = _getNodeValue();
            if (_eVal != value || _isRadio) {
                _eVal = value;
                vAttr.$value(value);
            }
        };
        if (_isRadio) {
            eName = 'click';
        } else {
            eName = 'change';
        }
        if (eName) {
            vAttr.$on(eName, fn);
        }

        vAttr.$layoutValue(function (c) {
            var val = c.value;
            _setNodeValue(val);
        });

        //vAttr.$ready(function () {
        //    _setNodeValue(vAttr.$value());
        //});

    });


})(bingo);
