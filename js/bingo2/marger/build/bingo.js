
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
        version: { major: 2, minor: 0, rev: 'alpha', build: 0, toString: function () { return [this.major, this.minor, this.rev, this.build].join('.'); } },
        _no_observe:true,//防止observe
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
            return list.filter(function (item) { return item != ele; });
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
                this.state = _pending;
                this._result = undefined;
                res.then(function (res) {
                    this._doNext(res, _fulfilled);
                }.bind(this), function (res) {
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
                    if (res instanceof Error)
                        this._doNext(res, _rejected);
                    else
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
        //所有resolve才返回resolve, 否则返回reject
        //all([1, 2,...], function(p){ return bingo.Promise.resolve(p);}).then
        //all([promise1, promise1,...]).then
        all: function (args, fn) {
            var list = arguments.length == 1 ? args : _makeArgs(args, fn);
            return Promise(function (resolve, reject) {
                var resList = [], len = list.length;
                if (list.length > 0)
                    bingo.each(list, function (item, index) {
                        if (!item || !item.then) {
                            resList[index] = item;
                            (--len) || resolve(resList);
                        } else
                            item.then(function (res) {
                                resList[index] = res;
                                (--len) || resolve(resList);
                            }, reject);
                    });
                else
                    resolve(resList);
            });
        },
        //有一个reject或resolve都返回reject或resolve
        //race([1, 2,...], function(p){ return bingo.Promise.resolve(p);}).then
        //race([promise1, promise1,...]).then
        race: function (args, fn) {
            var list = arguments.length == 1 ? args : _makeArgs(args, fn);
            return Promise(function (resolve, reject) {
                if (list.length > 0)
                    bingo.each(list, function (item, index) {
                        if (!item || !item.then)
                            resolve(item);
                        else
                            item.then(resolve, reject);
                    });
                else
                    resolve();
            });
        }
    });
    var _makeArgs = function (args, fn) {
        var list = [];
        bingo.each(args, function (item, index) {
            list.push(fn(item, index));
        });
        return list;
    };
    Promise.when = Promise.all;

    bingo.Promise = Promise;

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
                    n != 'bgIsDispose' && (this[n] = null);
                }, this);
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
            if (this._no_observe === true) return this;
            if (bingo.isBoolean(prop)) { deep = prop; prop = null; }
            _defObserve(this, prop ? [prop] : Object.keys(this), deep);
            return this;
        },
        bgObServe: function (prop, fn) {
            /// <summary>
            /// bgObServe(function(change){})<br/>
            /// bgObServe('prop', function(change){})
            /// </summary>
            if (this._no_observe === true) return this;
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
            if (this._no_observe === true) return this;
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
        }
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
        observe: function (obj, prop, fn) {
            if (bingo.isFunction(obj)) {
                var colFn = obj;
                fn = prop;
                var obs, tid, cList = [], old, publish = function (isPub, org) {
                    var val;
                    try {
                        val = colFn();
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
                    if (refs !== true)
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
                    }
                };
                done();
                return ret;
            } else if (obj) {
                var bo = _splitProp(obj, prop, false),
                    obj = bo[0],pname = bo[1],
                    sFn = function () {
                        return obj[pname];
                    };
                return bingo.observe(sFn, fn);

            }
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

; (function (bingo) {
    "use strict";

    //IE必须先添加到document才生效
    var _ev = 'DOMNodeRemoved', _aT;
    document.documentElement.addEventListener(_ev, function (e) {
        var target = e.target;
        setTimeout(function () {
            var parentNode = target ? target.parentNode : null;
            if (!parentNode) {
                target.bgTrigger(_ev, [e]);
                _aT || (_aT = setTimeout(function () { _aT = null; _linkAll.bgTrigger('onLinkNodeAll'); }, 0));
                target.hasChildNodes() && bingo.each(target.querySelectorAll('*'), (function () {
                    this.bgTrigger(_ev, [e]);
                }));
            }
        }, 0);
    }, false);

    bingo.linkNode = function (node, callback) {
        if (callback) {
            if (!node) { callback(); return; }
            node.bgOne(_ev, callback);
        }
    };

    bingo.unLinkNode = function (node, callback) {
        if (node) {
            if (callback)
                node.bgOff(_ev, callback);
            else
                node.bgOff();
        }
    };

    Object.prototype.bgDefProps({
        bgLinkNode: function (node) {
            var fn = bingo.proxy(this, function () {
                this.bgDispose();
            });
            bingo.linkNode(node, fn);
            (this._linkNodeFn || (this._linkNodeFn = [])).push(fn);
            this.bgOnDispose(function () { this.bgUnLinkNode(node); });
            return this;
        },
        bgUnLinkNode: function (node) {
            var fnL = this._linkNodeFn;
            fnL && fnL.length > 0 && fnL.forEach(function (item) {
                bingo.unLinkNode(this, item);
            }, node);
            this._linkNodeFn = [];
            return this;
        },
        bgLinkNodeAll: function (fn) {
            if (fn) {
                var $this = this, fn1 = function () {
                    fn.apply($this, arguments);
                    $this.bgIsDispose && _linkAll.bgUnLinkNodeAll(fn1);
                };
                fn._bglfall_ = fn1;
                _linkAll.bgOn('onLinkNodeAll', fn1);
            }
        },
        bgUnLinkNodeAll: function (fn) {
            fn && _linkAll.bgOff('onLinkNodeAll', fn._bglfall_);
        }
    });
    var _linkAll = {};

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
        _loadFile = function (file, fn) {
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
        },
        _done = function () {
            _tid = null;
            bingo.each(_loading, function (item) {
                if (item.status > 0) return;
                var file = item.file;
                item.status = 1;//加载中
                bingo.config().using(file, function () {
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

    var _usingIn = function (url) {
        return bingo.Promise(function (r) {
            _loadFile(url, function (url) { r(url); });
        });
    };

    bingo.extend({
        using: function (url) {
            /// <summary>
            /// bingo.using('/js/file1.js').then <br />
            /// </summary>
            /// <param name="p">url</param>

            return bingo.route(url).usingPromise();
        },
        usingAll: function (lv) {
            bingo.isNumeric(lv) || (lv = bingo.using.Normal);
            return bingo.Promise(function (r) {
                _addAll(r, lv);
            });
        }
    });

    bingo.extend(bingo.using, {
        First: 0,
        NormalBefore: 45,
        Normal: 50,
        NormalAfter: 55,
        Last: 100
    });
    //end using===================================

    var _noop = bingo.noop, _htmlType = 'text/html',
        _textType = 'text/plain', _jsonType = 'application/json',
        _mimeToDataType = function (mime) {
        return mime && (mime == _htmlType ? 'html' :
          mime == _jsonType ? 'json' :
          /^(?:text|application)\/javascript/i.test(mime) ? 'script' :
          /^(?:text|application)\/xml/i.test(mime) && 'xml') || 'text';
    }, _appendQuery = function (url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }, _serializeData = function (options) {
        if (!options.data) return;
        var p = [];
        if (bingo.isObject(options.data)){
            bingo.eachProp(options.data, function (item, name) {
                p.push(encodeURIComponent(name) + '=' + encodeURIComponent(bingo.isObject(item) || bingo.isArray(item) ? JSON.stringify(item): item));
            });
            options.data = p.join('&').replace('%20', '+');
        }
        if (!options.type || options.type.toUpperCase() == 'GET')
            options.url = _appendQuery(options.url, options.data);
    }, _ajaxOpt = {
        type: 'GET',
        beforeSend: _noop,
        success: _noop,
        error: _noop,
        complete: _noop,
        context: null,
        global: true,
        xhr: function () {
            return new window.XMLHttpRequest()
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
    }, _ajax = function (options) {
        var settings = bingo.extend({}, options);
        for (var key in _ajaxOpt) if (settings[key] === undefined) settings[key] = _ajaxOpt[key];

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
          RegExp.$2 != window.location.host;

        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url);
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = _appendQuery(settings.url, 'callback=?');
            return _ajaxJSONP(settings);
        }

        if (!settings.url) settings.url = window.location.toString();
        _serializeData(settings);

        var mime = settings.accepts[dataType],
            baseHeaders = {},
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = _ajaxOpt.xhr(), abortTimeout;

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
        if (mime) {
            mime += ', */*; q=0.01';
            baseHeaders['Accept'] = mime;
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }
        if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded; charset=UTF-8');
        settings.headers = bingo.extend(baseHeaders, settings.headers || {});

        var context = settings.context;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout);
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || _mimeToDataType(xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;

                    try {
                        if (dataType == 'script') (1, eval)(result);
                        else if (dataType == 'xml') result = xhr.responseXML;
                        else if (dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
                    } catch (e) { error = e }

                    if (error)
                        settings.error.call(context, xhr, 'parsererror', error);
                    else
                        settings.success.call(context, result, 'success', xhr);
                } else {
                    settings.error.call(context, xhr, 'error', null);
                }
            }
        };

        var async = 'async' in settings ? settings.async : true;
        xhr.open(settings.type, settings.url, async);

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);

        if (settings.beforeSend.call(context, xhr, settings) === false) {
            xhr.abort();
            return false;
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = _noop;
            xhr.abort();
            ajaxError(null, 'timeout', xhr, settings);
        }, settings.timeout);

        xhr.send(settings.data ? settings.data : null);
        return xhr;
    }, _ajaxJSONP = function (options) {
        var callbackName = 'jsonp' + bingo.makeAutoId(),
          script = document.createElement('script'),
          abort = function () {
              head.removeChild(script);
              if (callbackName in window) window[callbackName] = _noop
          },
          xhr = { abort: abort }, abortTimeout;

        if (options.error) script.onerror = function () {
            xhr.abort();
            options.error();
        };

        window[callbackName] = function (data) {
            clearTimeout(abortTimeout);
            head.removeChild(script);
            delete window[callbackName];
            settings.success.call(options.context, data, 'success', xhr);
        };

        _serializeData(options);
        script.src = options.url.replace(/=\?/, '=' + callbackName);
        head.appendChild(script);

        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.abort();
        }, options.timeout);

        return xhr;
    };

    bingo.ajax = function (url, p) {
        return bingo.route(url).ajaxPromise(p);
    };

    var _tagTestReg = /^\s*<(\w+|!)[^>]*>/;
    bingo.tmpl = function (p, aP) {
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
                    return bingo.route(p).tmplPromise(aP);
                }
            } else
                node = document.getElementById(p.substr(1));
        }
        if (node) {
            var cLen = node.children.length, first = node.firstElementChild;
            if (cLen == 1 && first.tagName.toLowerCase() == 'script')
                html = first.innerHTML;
            else
                html = node.innerHTML;
        }
        return _Promise.resolve(html);
    };

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
            to: 'modules/{controller*}.html',
            //第二种配置
            to: {
                //（可以function(url, params)）
                ajax:'modules/{controller*}.html',
                tmpl:'modules/{controller*}.html',
                using:''modules/{controller*}.html'
            },
            //默认
            promise:{
                ajax:function(p){
                    return bingo.config().tmpl(this.tmpl, p);
                },
                tmpl:function(p){
                    return bingo.config().ajax(this.ajax, p);
                },
                usin:function(p){
                    return _usingIn(this.using);
                }
            }
            //默认值
            defaultValue: { app: '', controller: 'user/list' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/user/list');
                返回结果==>{tmpl:'modules/user/list.html'}
    */
    //路由
    bingo.route = function (p, context) {
        if (arguments.length == 1)
            return bingo.routeContext(p).to;
        else
            p && context && _routes.add(p, context);
    };

    /*
        //根据url生成routeContext;
        var routeContext = bingo.routeContext('view/user/list');
            返回结果==>{
                url:'view/user/list',
                toUrl:'modules/user/list.html',
                params:{ app: '', controller: 'user/list' }
            }
    */
    //
    bingo.routeContext = function (url) {
        return _routes.getRouteByUrl(url);
    };

    /*
        //生成路由地址
        bingo.routeLink('view', { app: '', controller: 'user/list' });
            返回结果==>'view/user/list'
    */
    bingo.routeLink = function (name, p) {
        var r = _routes.getRuote(name);
        return r ? _paramToUrl(r.context.url, p, 1) : '';
    };

    /*
        //生成路由地址query
        bingo.routeLinkQuery('view/user/list', { id: '1111' });
            返回结果==>'view/user/list$id:1111'
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
        var context = { app: null, controller: null, component: null };
        var params = this.params;
        if (params) {
            var appName = params.app;
            var app = bingo.app(appName);
            context.app = app;
            params.controller && (context.controller = app.controller(params.controller));
            context.controller && (context.controller = context.controller.fn);

            params.component && (context.component = app.component(params.component));
            context.component && (context.component = context.component.fn);
        }
        return context;
    }, _makeRouteContext = function (name, url, to, params) {
        //生成 routeContext
        return { name: name, params: params, url: url, to: to, context: _getRouteContext };
    },
    _passParam = ',component,controller,service,app,queryParams,',
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

    var _routes = {
        datas: [],
        defaultRoute: {
            url: '**',
            to: function (url, param) { return url; }
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

            //var toUrl = bingo.isFunction(routeContext.toUrl) ?
            //    routeContext.toUrl.call(routeContext, url, params)
            //    : routeContext.toUrl;

            if (querys.length > 1) {
                params || (params = {});
                querys[1].replace(/([^=&]+)\=([^=&]*)/g, function (find, name, value) {
                    (name in params) || (params[name] = value);
                });
            }

            var to = routeContext.to || '';

            if (!bingo.isObject(to)) {
                to = _routes.makeTo(to, routeContext, url, params);
                to = {
                    using: to,
                    ajax: to,
                    tmpl: to
                };
            } else {
                to = bingo.extend({}, routeContext.to);
                bingo.eachProp(to, function (item, n) {
                    to[n] = _routes.makeTo(item, routeContext, url, params);
                });
            }
            var promise = routeContext.promise || {};
            bingo.extend(to, {
                tmplPromise: promise.tmpl || _tmplPromise,
                ajaxPromise: promise.ajax || _ajaxPromise,
                usingPromise: promise.using || _usingPromise
            });
            //console.log(to);

            //var toUrl = _paramToUrl(toUrl, params);

            return _makeRouteContext(name, url, to, params);
        },
        makeTo: function (to, routeContext, url, params) {
            bingo.isFunction(to) && (to = to.call(routeContext, url, params));
            return _paramToUrl(to, params);
        }
    };

    var _tmplPromise = function (p) {
        return bingo.config().tmpl(this.tmpl, p);
    }, _ajaxPromise = function (p) {
        return bingo.config().ajax(this.ajax, p);
    }, _usingPromise = function (p) {
        return _usingIn(this.using);
    };

    //route=====================================================


    //bingo.config=====================================================
    bingo.config({
        using: _fetch,
        ajax: function (url, p) {
            return _Promise(function (resolve, reject) {
                _ajax(bingo.extend({ type: 'post', dataType: 'json' }, p, {
                    url: url,
                    success: resolve,
                    error: reject
                }));
            });
        },
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

                return bingo.config().ajax(url, bingo.extend({
                    dataType: 'text', type: 'get'
                }, p)).then(tFn).catch(tFn);
            }
        }
    });
    var _tmplCacheObj = {};
    //end bingo.config=====================================================

})(bingo);


(function (bingo) {

    /*
        与bg-route同用, 取bg-route的url等相关
        $location.href('view/system/user/list');
        var href = $location.href();
        var params = $location.params();
    
    */
    var _routeCmdName = 'bg-route',
        _dataKey = '_bg_location_',
        _documentElement = document.documentElement;

    //bingo.location('main') 或 bingo.location($('#id')) 或 bingo.location(docuemnt.body)

    bingo.location = function (p) {
        /// <summary>
        /// location 没有给删除如果dom在一直共用一个
        /// </summary>
        /// <param name="p">可选，可以是字串、jquery和dom node, 默认document.documentElement</param>
        /// <returns value='_locationClass.NewObject()'></returns>
        bingo.isString(p) && (p = '[bg-name="' + p + '"]');
        var node = null;
        if (bingo.isString(p))
            node = document.querySelectorAll(p)[0];
        else if (p)
            node = p;

        var isRoute = node ? true : false;
        if (!isRoute)
            node = _documentElement;

        var o = node[_dataKey];
        if (!o) {
            o = new _locationClass().ownerNode(node).isRoute(isRoute).name(node.getAttribute('bg-name') || '');
            o.bgLinkNode(node);
            o.bgOnDispose(function () {
                node[_dataKey] = null;
                this.bgTrigger('onClosed');

            });
            node[_dataKey] = o;
        }
        return o;
    };

    bingo.location.bgEventDef('onHref onHrefBefore onLoadBefore onLoaded');

    var _hashReg = /#([^#]*)$/,
        _hash = function (url) {
            return _hashReg.test(url) ? RegExp.$1 : '';
        };
    bingo.extend(bingo.location, {
        href: function (url, target) {
            var loc = target instanceof _locationClass ? target : bingo.location(target);
            if (loc.isRoute()) {
                loc.ownerNode().setAttribute(_routeCmdName, url);
                loc.bgTrigger('onChange', [url]);
            }
        },
        hash: function (url) {
            return _hash(url);
        }
    });

    var _locationClass = bingo.location.Class = bingo.Class(function () {

        this.Prop({
            ownerNode: null,
            //是否路由出来的, 否则为window
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
                bingo.location.href(url, bingo.isNullEmpty(target) ? this : target);
            },
            reload: function (target) {
                return this.href(this.url(), target);
            },
            onLoaded: function(callback){
                return this.on('onLoaded', callback);
            },
            url: function () {
                if (this.isRoute())
                    return this.ownerNode().getAttribute(_routeCmdName);
                else
                    return window.location + '';
            },
            hash: function () {
                return bingo.location.hash(this.url());
            },
            toString: function () {
                return this.url();
            },
            views: function () {
                return bingo.view(this.ownerNode())._bgpri_.children;
            },
            close: function () {
                if (!this.isRoute()) return;
                if (this.bgTrigger('onCloseBefore') === false) return;
                var node = this.ownerNode();
                node.parentNode.removeChild(node);
            }
        });

        this.Event('onChange onCloseBefore onClosed');

    });

    //bingo.ready(function () {
    //    $(_documentElement).on('click', '[href]', function (e) {
    //        if (bingo.location.bgTrigger('onHrefBefore', [e]) === false) return false;
    //        var jo = $(this);
    //        var url = _hash(jo.attr('href'));
    //        if (!bingo.isNullEmpty(url)) {
    //            var target = jo.attr('bg-target');
    //            if (bingo.location.bgTrigger('onHref', [this, url, target]) === false) return;
    //            var $loc = bingo.location(this);
    //            $loc.href(url, target);
    //        }

    //    });
    //});

    //$location.href('view/demo/userlist')
    //$location.href('view/demo/userlist', 'main')
    bingo.service('$location', ['node', function (node) {
        return bingo.location(node);
    }]);

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
            compile: ['$compile', 'node', '$attr', '$location', function ($compile, node, $attr, $location) {

                //只要最后一次，防止连续点击链接
                var _last = null, _href = function (url) {
                    if (bingo.location.bgTrigger('onLoadBefore', [url, $location]) === false) return;
                    _last && !_last.bgIsDispose && _last.stop();
                    _last = $compile(url).htmlTo(node);
                    return _last.compile().then(function () {
                        _last = null;
                        $location.bgTrigger('onLoaded', [$location, url]);
                        bingo.location.bgTrigger('onLoaded', [$location]);
                    });
                };
                $location.onChange(_href);

                var content = $attr.content,
                    pview = $attr.view.$parentView(),
                    has = pview.bgTestProps(content);

                if (has) {
                    var obs = pview.$layout(content, function (c) {
                        if ($attr.bgIsDispose) return;
                        var value = c[0].value;
                        return value && _href(value);
                    });
                    $attr.bgDispose(function () {
                        obs.unObserve();
                    });
                } else {
                    has = window.bgTestProps(content);
                    var url = has ? window.bgDataValue(content) : content;
                    return url && _href(url);
                }

            }]
        };
    }); //end bg-route

})(bingo);


(function (bingo, undefined) {
    "use strict";

    var doc = document, _docEle = doc.documentElement;

    bingo.view = function (node) {
        /// <summary>
        /// 获取view<br />
        /// bingo.view(document.body)
        /// </summary>
        return _getVNode(node).view;
    };

    var _rootView = null;
    bingo.rootView = function () { return _rootView; };

    var _Promise = bingo.Promise, _promisePush = function (promises, p) {
        p && promises.push(p);
        return p;
    }, _retPromiseAll = function (promises) {
        return promises.length > 0 ? _Promise.all(promises) : undefined;
    };

    //view==提供视图==================
    var _viewClass = bingo.viewClass = bingo.Class(function () {

        var _eDef = ['$readyAll'];// ['$initData','$initDataSrv', '$ready','$readyAll'];
        this.Event(_eDef.join(''));

        this.Private({
            setParent: function (view) {
                if (view) {
                    this.pView = view;
                    view._bgpri_.children.push(this.ow);
                }
            },
            removeChild: function (view) {
                this.children = bingo.removeArrayItem(view, this.children);
            },
            //compile: function () {
            //    this.vNode.bgIsDispose || this.vNode._compile();
            //},
            controller: function () {
                if (this.bgIsDispose) return;
                var ctrls = this.ctrls, pms = [],
                    ow = this.ow;
                if (ctrls.length > 0) {
                    var p = { node: this.node };
                    bingo.each(ctrls, function (item) {
                        _promisePush(pms, bingo.inject(item, this, p, this));
                    }, ow);
                    this.ctrls = [];
                    //controller之后检查一次, 暂定只有先在$view里先定义
                    //如$view.title = ''; 先定义
                }
                ow.bgToObserve(true);
                return _retPromiseAll(pms);
            },
            sendReady: function (build) {
                this.sendReady = bingo.noop;
                var ow = this.ow;
                var pView = this.pView;

                ow.bgSync().done(function () {
                    this.bgEnd('$readyAll');
                });

                var step = function (name) {
                    var list = this[name], $this = this;
                    return function () {
                        var pm = list.length > 0 ? _Promise.all(list, function (fn) {
                            return fn.call(ow);
                        }) : undefined;
                        $this[name] = null;
                        return pm;
                    };
                }.bind(this);

                var pm = _Promise.resolve()
                    .then(step('initPmSrv'))
                    .then(step('initPm'))
                    .then(step('readyPm'))
                    .then(function () {
                        ow.$isReady = true;
                        ow.$update();
                        ow.bgSyncDec();
                        pView && pView.bgSyncDec();
                    }).catch(function (e) {
                        bingo.trace(e);
                    });
                build && build.push(pm);
                return pm;
            }
        });

        //这里只定义view方法， 并用于defcomp, 不要放属性
        var _def = {
            $parentView: function () { return this._bgpri_.pView },
            $setApp: function (app) {
                this._bgpri_.app = app;
            },
            $getApp: function () {
                return this._bgpri_.app || bingo.app(null);
            },
            $addController: function (ctrl, name) {
                this._ctrlname = name;
                ctrl && this._bgpri_.ctrls.push(ctrl);
            },
            $getViewnode: function (node) {
                return node ? _getVNode(node) : this._bgpri_.vNode;
            },
            $getNode: function (selector) {
                var node = this._bgpri_.node;
                return selector ? node.querySelectorAll(selector) : node;
            },
            $initData: function (fn) {
                if (this._bgpri_.initPm)
                    this._bgpri_.initPm.push(fn);
                else
                    fn.call(this);
                return this;
            },
            $initDataSrv: function (fn) {
                if (this._bgpri_.initPmSrv)
                    this._bgpri_.initPmSrv.push(fn);
                else
                    fn.call(this);
                return this;
            },
            $ready: function (fn) {
                if (this._bgpri_.readyPm)
                    this._bgpri_.readyPm.push(fn);
                else
                    fn.call(this);
                return this;
            },
            $observe: function (p, fn, dispoer, check) {
                var fn1 = function () {
                    //这里会重新检查非法绑定
                    //所以尽量先定义变量到$view, 再绑定
                    this.$updateAsync();
                    return fn.apply(this, arguments);
                }.bind(this);
                fn1.orgFn = fn.orgFn;//保存原来observe fn
                var obs = !bingo.isFunction(p) ? bingo.observe(this, p, fn1)
                    : bingo.observe(p, fn1);
                //check是否检查, 如果不检查直接添加到obsList
                if (!check || !obs.isObs)
                    (obs.isObs ? this._bgpri_.obsList : this._bgpri_.obsListUn).push([obs, dispoer, check]);
                return obs;
            },
            $layout: function (p, fn, fnN, dispoer, check) {
                bingo.isNumeric(fnN) || (fnN = 1);
                return this.$observe(p, bingo.aFrameProxy(fn, fnN), dispoer, check);
            },
            $update: function (force) {
                if (!this.$isReady) return;
                this.bgToObserve(true);

                //检查非法观察者
                this._bgpri_.obsListUn = this._bgpri_.obsListUn.filter(function (item, index) {
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
                            if (!item[2]) this._bgpri_.obsList.push(item);
                            return false;
                        }
                    }
                    return true;
                }, this);
            },
            $updateAsync: function () {
                if (this._upastime_) clearTimeout(this._upastime_);
                this._upastime_ = setTimeout(function () { this.$update(); }.bind(this), 1);
            },
            $html: function (node, html) {
                if (arguments.length > 0) {
                    return bingo.compile(this).html(html).htmlTo(node).compile();
                } else
                    return jo.innerHTML;
            },
            $getComp: function (name) {
                return this._bgpri_.comp[name];
            },
            $removeComp: function (name) {
                this.bgIsDispose || delete this._bgpri_.comp[name];
            },
            $defComp: function (p, name) {
                var init;
                bingo.eachProp(p, function (item, name) {
                    if (bingo.inArray(name, _eDef) >= 0) {
                        this[name](item);
                    } else if (name == '$init') {
                        init = item;
                    }
                    else if (!(name in _def))
                        this[name] = item;
                }, this);

                init && init.call(this);

                if (name) {
                    var comp = this.$parentView()._bgpri_.comp;
                    comp[name] = this;
                }

                return this;
            }
        };  //end _def
        //var _defKey = Object.keys(_def).concat(_eDef);

        this.Define(_def);

        this.Init(function (parentView, node, build) {
            this.Private({
                ow: this,
                node: node,//view拥有node
                children: [],
                ctrls: [],
                obsList: [],
                obsListUn: [],
                comp: {},
                initPm:[],
                initPmSrv:[],
                readyPm:[],
                readyAllPm: []
            });
            this.$isReady = false;

            this.bgLinkNode(node);

            this.bgSyncAdd();
            if (parentView) {
                parentView.bgSyncAdd();
                this._bgpri_.setParent(parentView);
            }

            this._bgpri_.bgOnDispose(function () {
                bingo.each(this.obsList, function (item) {
                    item[0].bgIsDispose || item[0].unObserve();
                });

                bingo.each(this.obsListUn, function (item) {
                    item[0].bgIsDispose || item[0].unObserve();
                });

                //处理父子
                var pView = this.pView;
                if (pView && pView.bgDisposeStatus == 0)
                    pView._bgpri_.removeChild(this.ow);

            });
            this.bgDispose(this._bgpri_);

            if (build) {
                build.bgOn('ready', function () {
                    this._bgpri_.sendReady(build.ready);
                }.bind(this));
            }

        });
    }); //end _viewClass

    var _setVNode = function (node, vNode) {
        node.__bg_vNode = vNode;
    }, _getVNode = function (node) {
        return node.__bg_vNode || (node.parentNode && _getVNode(node.parentNode));
    }, _rmVNode = function (node) { node.__bg_vNode = undefined; };

    //viewnode==管理与node节点连接====================
    var _viewnodeClass = bingo.viewnodeClass = bingo.Class(function () {

        this.Define({
            _no_observe:true,
            _setParent: function (viewnode) {
                if (viewnode) {
                    this.parent = viewnode;
                    viewnode.children.push(this);
                }
            },
            _removeChild: function (viewnode) {
                this.children = bingo.removeArrayItem(viewnode, this.children);
            },
            $getAttr: function (name) {
                name = name.toLowerCase();
                var item;
                bingo.each(this.attrList, function () {
                    if (this.name == name) { item = this; return false; }
                });
                return item;
            },
            $html: function (html) {
                return this.view.$html.apply(this.view, [this.node, html]);
            },
            _removeText: function (text) {
                this._textList = bingo.removeArrayItem(text, this._textList);
            }
        });

        this.Init(function (view, node, parent, withData, build) {

            this.bgLinkNode(node);
            _setVNode(node, this);

            bingo.extend(this, {
                node: node,
                view: view,
                attrList: [],//command属性
                _textList: [],
                children: [],
                withData: withData || (parent && parent.withData)
            });

            parent || (view._bgpri_.vNode = this);
            this._setParent(parent);

            this.bgOnDispose(function () {
                _rmVNode(this.node);
                //处理父子
                var parent = this.parent;
                (parent && parent.bgDisposeStatus == 0) && parent._removeChild(this);

                //释放attrLst
                bingo.each(this.attrList, function (item) {
                    item.bgIsDispose || item.bgDispose();
                });

                //释放_textList
                bingo.each(this._textList, function (item) {
                    item.bgIsDispose || item.bgDispose();
                });

            });

            if (build) {
                build.bgOn('ctrl', function () {
                    bingo.each(this.attrList, function (item) {
                        var ctrl = item.command.controller;
                        ctrl && _promisePush(build.ctrl, item._inject(ctrl));
                    });
                }.bind(this));
                build.bgOn('compile', function () {
                    this.attrList.sort(function (item, item1) { return item.priority - item1.priority; });
                    bingo.each(this.attrList, function (item) {
                        var compile = item.command.compile;
                        compile && _promisePush(build.compile, item._inject(compile));
                        _promisePush(build.compile, item._getPms());
                    });
                }.bind(this));
                build.bgOn('link', function () {
                    bingo.each(this.attrList, function (item) {
                        var link = item.command.link;
                        link && _promisePush(build.link, item._inject(link));
                        _promisePush(build.link, item._getPms());
                    });
                }.bind(this));
                build.bgOn('init', function () {
                    bingo.each(this.attrList, function (item) {
                        item.$publish();
                    });
                }.bind(this));
            }

        });
    }); //end _viewnodeClass

    var _vm = {
        _cacheName: '__contextFun__',
        bindContext: function (cacheobj, content, hasRet, view, node, withData) {

            var cacheName = [content,hasRet].join('_');
            var contextCache = (cacheobj[_vm._cacheName] || (cacheobj[_vm._cacheName] = {}));
            if (contextCache[cacheName]) return contextCache[cacheName];

            hasRet && (content = ['try { return ', content, ';} catch (e) {bingo.observe.error(e);}'].join(''));

            return contextCache[cacheName] = (new Function('$view', 'node', '$withData', 'bingo', [
                    'with ($view) {',
                        //如果有withData, 影响性能
                        withData ? 'with ($withData) {' : '',
                            //this为node
                            'return function (event) {',
                                content,
                            '}.bind(node);',
                        withData ? '}' : '',
                    '}'].join('')))(view, node || view.viewnode.node, withData, bingo);//bingo(多版本共存)
        }
    }; //end _vm

    bingo.bindContext = function (owner, content, view, node, withData, event, hasRet) {
        var fn = _vm.bindContext(owner, content, hasRet, view, node, withData);
        return fn(event);
    };

    //_attrClass attr====管理与指令连接================
    var _attrClass = bingo.attrClass = bingo.Class(function () {

        this.Define({
            _no_observe: true,//防止observe
            _inject: function (p) {
                return bingo.inject(p, this.view, {
                    node: this.node,
                    $viewnode: this.viewnode,
                    $attr: this,
                    $withData: this.withData
                }, this.command);
            },
            $eval: function (event) {
                /// <summary>
                /// 执行内容, 根据执行返回结果, 会报出错误
                /// 在执行之前可以改变content
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var fn = _vm.bindContext(this, this.content, false, this.view, this.node, this.withData);
                return fn(event);
            },
            $results: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误, 没有经过过滤器
                /// 在执行之前可以改变content
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var fn = _vm.bindContext(this, this.content, true, this.view, this.node, this.withData);
                return fn(event);
            },
            _makeValueObj: function () {
                if (this._makeValueParams) return this._makeValueParams;
                var content = this.content, withData = this.withData,
                    view = this.view,
                    hasW = !!withData && withData.bgTestProps(content),
                    hasView = hasW ? false : view.bgTestProps(content),
                    hasWin = hasView ? false : window.bgTestProps(content),
                    obj = hasW ? withData : hasW ? window : view;
                return (this._makeValueParams = [obj, hasW || hasView || hasWin]);
            },
            $hasProps: function () {
                return this._makeValueObj()[0].bgTestProps(this.content);
            },
            $value: function (val) {
                /// <summary>
                /// 设置或取值, 在执行之前可以改变content
                /// </summary>
                var content = this.content, obj = this._makeValueObj()[0];
                if (arguments.length == 0) {
                    return obj.bgDataValue(content);
                } else {
                    this.view.$updateAsync();
                    obj.bgDataValue(content, val);
                }
            },
            $publish: function () {
                return;
                bingo.each(this._obsList, function () {
                    this.bgIsDispose || this.publish();
                });
            },
            $observe: function (wFn, fn) {
                if (arguments.length == 1) {
                    fn = wFn;
                    wFn = function () {
                        return this.$results();
                    }.bind(this);
                }
                var obs = this.view.$observe(wFn, fn, this, true);
                this._obsList.push(obs);
                return obs;
            },
            $observeValue: function (fn) {
                this.$hasProps() || this.$value(undefined);
                return this.$observe(function () { return this.$value(); }.bind(this), fn);
            },
            $layout: function (wFn, fn) {
                if (arguments.length == 1) {
                    fn = wFn;
                    wFn = function () {
                        return this.$results();
                    }.bind(this);
                }
                var obs = this.view.$layout(wFn, fn, 0, this, true);
                this._obsList.push(obs);
                _promisePush(this._pms, obs.publish(true));
                return obs;
            },
            $layoutValue: function (fn) {
                this.$hasProps() || this.$value(undefined);
                return this.$layout(function () { return this.$value(); }.bind(this), fn);
            },
            _getPms: function () {
                var pms = this._pms;
                this._pms = [];
                return _retPromiseAll(pms);
            }
        });

        this.Init(function (view, viewnode, type, attrName, attrValue, command, build) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="viewnode">属性名称</param>
            /// <param name="attrName">属性名称</param>
            /// <param name="attrValue">属性名称</param>
            /// <param name="command">指令定义</param>

            //认为viewnode widthData只在编译时设置
            bingo.extend(this, {
                node:viewnode.node,
                view: view,
                viewnode: viewnode,
                type: type,
                name: attrName.toLowerCase(),
                command: command,
                priority: command.priority || 50,
                withData: viewnode.withData,
                content: attrValue,
                _obsList: [],
                _pms:[]
            });

            viewnode.attrList.push(this);

            this.bgOnDispose(function () {
                bingo.each(this._obsList, function (obs) {
                    obs.bgIsDispose || obs.unObserve();
                });
            });

        });
    }); // end _attrClass

    var _textTagS = {
        _regex: /\{\{(.+?)\}\}/gi,
        hasTag: function (text) {
            this._regex.lastIndex = 0;
            return this._regex.test(text);
        },
        isRmTxNode: function (node, parentNode) {
            if (node == parentNode || node.parentNode == parentNode)
                return false
            else
                return node.parentNode ? this.isRmTxNode(node.parentNode, parentNode) : true;
        },
        createTextNode: function (view, viewnode, node, attrName, attrValue, withData, pNode, build) {
            //parentNode为所属的节点， 属性节点时用, text节点时为空

            var nodeType = node.nodeType, parentNode = viewnode.node;

            withData || (withData = bingo.extend({}, viewnode.withData, withData));
            attrName && (attrName = attrName.toLowerCase());
            node.nodeValue = '';

            var isInited = false;

            var textNode = {
                _no_observe: true,//防止observe
                type: nodeType,
                name: attrName,
                content: attrValue,
                _init: function () {
                    if (isInited) return;
                    isInited = true;

                    var nodeValue = attrValue,
                        tagList = [];

                    var _setValue = function (value) {
                        node.nodeValue = value;
                    }, _changeValue = function () {
                        var allValue = nodeValue;
                        bingo.each(tagList, function (tag) {
                            allValue = allValue.replace(tag.text, tag.value);
                        });
                        _setValue(allValue);
                    };;

                    //解释内容, afasdf{{test | val:'sdf'}}
                    var s = nodeValue.replace(_textTagS._regex, function (findText, textTagContain, findPos, allText) {
                        var context = _vm.bindContext(textNode, textTagContain, true, view, node, withData);

                        var obs = view.$layout(function () {
                            return context();
                        }, function (c) {
                            if (textNode.bgIsDispose || textNode._checkRemove()) return;
                            item.value = bingo.toStr(c.value);
                            _changeValue();
                        }, 0);
                        
                        var value = obs.value, item;
                        tagList.push(item = { text: findText, value: value, context: context, obs: obs });

                        return value;
                    });
                    _setValue(s);

                    textNode.bgOnDispose(function () {
                        bingo.each(tagList, function (tag) {
                            tag.obs.bgIsDispose || tag.obs.unObserve();
                            tag.bgDispose();
                        });
                        tagList = null;
                    });

                },
                _checkRemove: function () {
                    //如果是attr会在根据pNode情况判断
                    var isRm = isInited && _textTagS.isRmTxNode(nodeType == 3 ? node : pNode, parentNode);
                    isRm && this.bgDispose();
                    return isRm;
                }
            }; //end textNode

            viewnode._textList.push(textNode);
            if (nodeType == 3) {
                textNode.bgOnDispose(function () {
                    viewnode.bgDisposeStatus == 0 && viewnode._removeText(textNode);
                });
            }

            build.bgOn('init', function () {
                textNode._init();
            });

        } // end createTextNode
    }; // end _textTagS


    //aFrame====================================

    var _rAFrame = window.requestAnimationFrame,
        _cAFrame = window.cancelAnimationFrame,
        _aFrame = function (fn, frN, obj) {
            /// <param name="fn" value="fn.call(obj, obj)"></param>
            obj.id = _rAFrame(function () {
                if (frN == 0)
                    fn.call(obj, obj);
                else
                    _aFrame(fn, frN - 1, obj);
            });
        };

    if (!_rAFrame) {
        var prefixes = ['webkit','moz','ms','o']; //各浏览器前缀
        bingo.each(prefixes, function (prefix) {
            _rAFrame = window[prefix + 'RequestAnimationFrame'];
            if (_rAFrame) {
                _cAFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
                return false;
            }
        });

        if (!_rAFrame) {
            _rAFrame = function (callback) {
                return window.setTimeout(callback, 10);
            };
            _cAFrame = function (id) {
                window.clearTimeout(id);
            };
        }
    }

    bingo.aFrame = function (fn, frN) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="fn"></param>
        /// <param name="frN">第几帧， 默认0</param>
        (!bingo.isNumeric(frN) || frN < 0) && (frN = 0);
        var obj = {
            stop: function () { _cAFrame(this.id); },
            next: function (fn) { return bingo.aFrame(fn, frN); },
            frame:bingo.aFrame
        };
        _aFrame(fn, frN, obj);
        return obj;
    };
    bingo.aFramePromise = function (frN) {
        return _Promise(function (r) {
            bingo.aFrame(r, frN);
        });
    };
    bingo.aFrameProxy = function (fn, frN) {
        var doing = false;
        var fFn = function () {
            if (doing) return;
            doing = true;
            var args = arguments;
            bingo.aFrame(function () { doing = false; fn.apply(this, args); }.bind(this), frN);
        };
        //保存原来observe fn
        fFn.orgFn = fn;
        return fFn;
    };
    //end _rAFrame

    //compiles======================================

    var _removeNodes = function (nodes) {
        bingo.each(nodes, function (item) {
            item.parentNode && item.parentNode.removeChild(item);
        });
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
    }, _parseHTML = function (html, node, script) {
        var tagName = node ? node.tagName.toLowerCase() : '';
        var wrap = _wrapMap[tagName] || _wrapMap.div, depth = wrap[0];
        html = wrap[1] + html + wrap[2];
        var container = doc.createElement('div');
        container.innerHTML = html;
        while (depth--) {
            container = container.lastChild;
        }
        return container.childNodes;
    }, _insertDom = function (nodes, refNode, fName) {
        bingo.each(nodes, function (item) {
            if (fName == 'appendTo')
                refNode.appendChild(item);
            else
                refNode.parentNode[fName](item, refNode);
        });
    };

    bingo.parseHTML = _parseHTML;

    var _compiles = {
        attrName: '_bg_cpl_160220',
        isCmpNode: function (node) {
            return node[this.attrName] == "1";
        },
        setCmpNode: function (node) {
            node[this.attrName] = "1";
        },
        traverseNode: function (p) {
            /// <summary>
            /// 遍历node
            /// </summary>
            /// <param name="p" value='_newTraParam()'></param>

            //元素element 1, 属性attr 2,文本text 3,注释comments 8,文档document 9

            var node = p.node;
            if (node.nodeType === 1) {

                if (!this.isCmpNode(node)) {
                    this.setCmpNode(node);

                    return this.analyzeNode(node, p);
                }
                return this.traverseNodes(node.childNodes, p);
            } else if (node.nodeType === 3) {

                if (!this.isCmpNode(node)) {
                    this.setCmpNode(node);

                    //收集textNode
                    var text = node.nodeValue;
                    if (_textTagS.hasTag(text)) {
                        _textTagS.createTextNode(p.view, p.pViewnode, node, node.nodeName, text, p.withData,null, p.build);
                    }
                }
            }
            node = p = null;
        },
        traverseNodes: function (nodes, p) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="nodes"></param>
            /// <param name="p" value="_newTraParam()"></param>
            /// <param name="withDataList"></param>

            var injectTmplWithList = [], commentList = [],
                withDataList = p.withDataList,
                withData = p.withData, promises =[];

            var node, pBak = bingo.extend({}, p);
            var tmplIndex = -1;
            bingo.each(nodes, function (node) {
                if (this.isComment(node)) {
                    commentList.push(node);
                } else {
                    tmplIndex = withDataList ? this.getWithdataIndex(node) : -1;
                    if (tmplIndex >= 0)
                        withData = p.withData = withDataList[tmplIndex];
                    if (node.nodeType === 1 || node.nodeType === 3) {
                        p.node = node, p.withData = withData;
                        _promisePush(promises, this.traverseNode(p));
                        p = bingo.extend({}, pBak);
                    }
                }
            }, this);

            if (commentList.length > 0 || injectTmplWithList.length > 0) {
                _removeNodes(commentList.concat(injectTmplWithList));
            }

            return _retPromiseAll(promises);
        },
        commentTest: /^\s*#/,
        isComment: function (node) {
            return node.nodeType == 8 && this.commentTest.test(node.nodeValue)
        },
        injWithTmpl: function (nodes, index) {
            /// <summary>
            /// 注入withDataList html
            /// </summary>
            nodes = bingo.sliceArray(nodes);
            bingo.each(nodes, function (item) {
                item._bg_withIndex_ = index;
            });
            return nodes;
        },
        //取得注入的withDataList的index
        getWithdataIndex: function (node) {
            return '_bg_withIndex_' in node ? node._bg_withIndex_ : -1;
        },
        newView: function (p, node) {
            /// <param name="p" value='_newTraParam()'></param>

            p.view = new _viewClass(p.view, node, p.build);
            if (p.ctrl) {
                p.view.$addController(p.ctrl);
                p.ctrl = null;
            }
            //清空数据
            p.withData = p.pViewnode = null;
        },
        buildVNode: function (p, node, attrList, isNewView) {
            /// <param name="p" value='_newTraParam()'></param>

            //只会编译第一个节点， 所以tmpl一定要完整节点包起来
            isNewView && (this.newView(p, node));
            var view = p.view;

            var viewnode = p.pViewnode = new _viewnodeClass(view, node, p.pViewnode, p.withData, p.build);

            //处理attrList
            bingo.each(attrList, function () {
                new _attrClass(view, viewnode, this.type, this.aName, this.aVal, this.command, p.build);
                this.command.tmpl = null;
            });
            return viewnode;
        },
        _makeCmd: function (command, view, node, attrObj) {

            //防止修改command
            var opt = bingo.extend({}, command);

            opt.compilePre && _promisePush(attrObj.cmpPres, bingo.inject(opt.compilePre, view, { node: node }, opt));

            return opt;
        },
        addAttrs: function (attrObj, command, attrName, attrVal, attrType) {
            /// <param name="attrObj" value="window._attrObj_"></param>

            attrObj.replace = command.replace;
            attrObj.include = command.include;
            //只允许一个tmpl, tmpl为true时由compilePre设置
            attrObj.tmpl = command.tmpl;
            attrObj.isNewView || (attrObj.isNewView = command.view);
            //允许多个
            (!attrObj.compileChild) || (attrObj.compileChild = command.compileChild);
            var attr = { aName: attrName, aVal: attrVal, type: attrType, command: command };
            if (attrObj.replace || attrObj.include)
                attrObj.attrs = [attr];
            else
                attrObj.attrs.push(attr);
        },
        analyzeAttr: function (attrObj, app, node, isScriptNode, p) {
            /// <param name="attrObj" value="window._attrObj_"></param>
            /// <param name="node" value="window.document.body"></param>

            var attrs = node.attributes, aVal, aName, len = attrs.length,
                command;
            bingo.each(attrs, function (aT) {
                if (!_compiles.isCmpNode(aT)) {
                    _compiles.setCmpNode(aT);

                    aName = aT.nodeName;
                    aVal = aT.nodeValue;
                    //如果是script节点，将type内容识别模板指令
                    (isScriptNode && aName == 'type') && (aName = aVal);
                    command = app.command(aName);
                    if (command) {
                        command = _compiles._makeCmd(command.fn, p.view, node, attrObj);
                        if (command.compilePre)
                            aVal = aT.nodeValue;//compilePre有可能重写attr
                        _compiles.addAttrs(attrObj, command, aName, aVal, 'attr');

                        if (attrObj.replace || attrObj.include) return false;
                    } else if (aVal && _textTagS.hasTag(aVal)) {
                        attrObj.texts.push({ node: aT, aName: aName, aVal: aVal });
                    }
                }

            }); //end each node.attributes
            if (attrs.length != len)
                _compiles.analyzeAttr(attrObj, app, node, isScriptNode, p);
        },
        analyzeView: function (attrObj, node, p) {
            /// <param name="attrObj" value="window._attrObj_"></param>
            /// <param name="node" value='document.body'></param>
            /// <param name="p" value='_newTraParam()'></param>
            var attrList = attrObj.attrs, compileChild = attrObj.compileChild,
                promises = [];

            var viewnode;
            if (attrList.length > 0) {
                var tmpl = attrObj.tmpl || attrList[0].command.tmpl,//可能后期compliePre改动tmpl参数
                    replace = attrObj.replace, include = attrObj.include,
                    isNewView = attrObj.isNewView;
                
                var emptyTmpl = bingo.isNullEmpty(tmpl);
                if (replace || include || !emptyTmpl) {

                    //替换 或 include
                    if (replace || include) {
                        var oldNode = node;
                        //replace || include, 必须有tmpl
                        if (!emptyTmpl) {
                            promises.push(bingo.tmpl(tmpl).then(function (tmpl) {
                                var node = oldNode;
                                if (include) {
                                    var inclTag = '{{bg-include}}';
                                    (tmpl.indexOf(inclTag) >= 0) && (tmpl = bingo.replaceAll(tmpl, inclTag, node.outerHTML));
                                }
                                tmpl = bingo.trim(tmpl) || '<div></div>';
                                var pNode = node.parentNode;
                                var nT = _parseHTML(tmpl, pNode);
                                if (nT.length > 1) {
                                    //如果多个节点，自动用div包起来,所以tmpl一定要用完整节点包起来
                                    node = _parseHTML('<div></div>', pNode)[0];
                                    _insertDom(nT, node, 'appendTo');
                                } else {
                                    node = nT[0];
                                };

                                //插入新节点
                                _insertDom([node], oldNode, 'insertBefore');
                                //删除旧节点
                                _removeNodes([oldNode]);

                                //生成view node等
                                viewnode = _compiles.buildVNode(p, node, attrList, isNewView);

                                return compileChild && _compiles.traverseNodes(node.childNodes, p);
                            }));

                        } else //else !emptyTmpl
                            //删除本节点
                            _removeNodes([oldNode]);

                    } else {
                        //else replace || include

                        promises.push(bingo.tmpl(tmpl).then(function (tmpl) {
                            node.innerHTML = tmpl;
                            //只会编译第一个节点， 所以tmpl一定要完整节点包起来
                            viewnode = _compiles.buildVNode(p, node, attrList, isNewView);
                            return compileChild && _compiles.traverseNodes(node.childNodes, p);
                        }));
                    } //end //end replace || include

                } else {
                    //else replace || include || !emptyTmpl

                    viewnode = _compiles.buildVNode(p, node, attrList, isNewView);
                    compileChild && _promisePush(promises, _compiles.traverseNodes(node.childNodes, p));
                } //end replace || include || !emptyTmpl

            } //end attrList.length > 0

            if (!(replace || include)) {
                bingo.each(attrObj.texts, function () {
                    _textTagS.createTextNode(p.view, viewnode || p.pViewnode, this.node, this.aName, this.aVal, p.withData, node, p.build);
                });
            }
            tmpl = null;
            compileChild && _promisePush(promises, _compiles.traverseNodes(node.childNodes, p));
            return _retPromiseAll(promises);
        },
        analyzeNode: function (node, p) {
            /// <summary>
            /// 分析node
            /// </summary>
            /// <param name="node" value='document.body'></param>
            /// <param name="p" value='_newTraParam()'></param>
            var tagName = node.tagName, command = null;
            if (bingo.isNullEmpty(tagName)) return;
            tagName = tagName.toLowerCase();
            var isScriptNode = (tagName == 'script');

            var app = p.view.$getApp();

            command = app.command(tagName);

            var attrObj = {
                attrs: [],
                texts:[],
                replace: false,
                include: false,
                compileChild: !isScriptNode,
                tmpl: null,
                //存放compliePre返回的promise
                cmpPres: [],
                isNewView:false
            };

            if (command) {
                //node
                command = _compiles._makeCmd(command.fn, p.view, node, attrObj);
                _compiles.addAttrs(attrObj, command, tagName, '', 'node');
            } else if (node.attributes.length> 0) {
                _compiles.analyzeAttr(attrObj, app, node, isScriptNode, p);
            }

            var promises = [], cmpPres = attrObj.cmpPres;
            if (cmpPres.length == 0)
                _promisePush(promises, _compiles.analyzeView(attrObj, node, p));
            else {
                promises.push(_Promise.all(cmpPres).then(function () {
                    return _compiles.analyzeView(attrObj, node, p);
                }));
            }
            return _retPromiseAll(promises);
            
        } //end analyzeNode
    }; //end _compiles;

    var _cmpClass = bingo.Class(function () {

        this.Prop({
            view: null, url: null,tmpl:null,
            //nodes可以单个node和node数组
            nodes: null, html: null, controller: null, clearChild:false, withData: null, withDataList: null
        });

        this.Define({
            node: null,
            //0, appendTo; 1,htmlTo; 2,insertBefore
            type: 0,
            prop: function (args, type) {
                if (args.length == 0)
                    return this.node;
                this.type = type;
                this.node = args[0];
                return this;
            },
            appendTo: function (node) {
                return this.prop(arguments, 0);
            },
            htmlTo: function (node) {
                return this.prop(arguments, 1);
            },
            insertBefore: function (node) {
                return this.prop(arguments, 2);
            },
            _rendArgs: null,
            render: function (tmpl, datas, itemName, pWithData) {
                this._rendArgs = bingo.sliceArray(arguments);
                return this;
            },
            _render: function (tmpl, datas, itemName, pWithData) {
                this._rendArgs = null;

                datas = bingo.extend([], datas);
                pWithData = pWithData || {};
                var withDataList = [],
                    pIndex = '$index' in pWithData ? pWithData.$index : -1,
                    count = datas.length, list = [];
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

                    list = list.concat(_compiles.injWithTmpl(_parseHTML(tmpl, this.node), index));
                    //htmls.push(_compiles.injWithTmpl(tmpl, index, pIndex));
                });

                //var html = htmls.join('');
                this.nodes(list).withDataList(withDataList);
                return this;
            },
            stop: function () { this._stop = true; },
            _isEnd: function () {
                return this.bgIsDispose
                        || this._stop
                        || (this.view() && this.view().bgIsDispose);
            },
            _compile: function () {
                var nodes = bingo.isElement(this.nodes()) ? [this.nodes()] : bingo.sliceArray(this.nodes());
                var toNode = this.node, parentNode = toNode || nodes[0].parentNode;
                if (!parentNode) return _Promise.resolve();
                //用于编译后， 指示编译指令用
                var build = {
                    ctrl: [],
                    compile: [],
                    link: [],
                    init: [],
                    ready:[]
                };

                var view = this.view() || bingo.view(parentNode),
                    pViewnode = _getVNode(parentNode);

                //检查pViewnode, view不等于pViewnode.view
                //node上下关系并不与viewnode上下关系对应
                if (pViewnode && pViewnode.view != view) pViewnode = null;

                var withDataList = this.withDataList();

                var $this = this, step = function (name) {
                    return function () {
                        //处理command的compile, 或执行compile时期处理
                        build.bgTrigger(name);
                        return build[name].length > 0 && _Promise.all(build[name]);
                    };
                };

                return _Promise.all([_compiles.traverseNodes(nodes, {
                    node: null, pViewnode: pViewnode,
                    view: view, ctrl: this.controller(),
                    withData: this.withData(), withDataList: withDataList,
                    build: build
                })]).then(step('ctrl')).then(function () {
                    return view._bgpri_.controller();
                }).then(step('compile')).then(function () {
                    return bingo.aFramePromise().then(function () {
                        var pVN = pViewnode;
                        if (toNode) {
                            $this.type == 1 && (toNode.innerHTML = '');
                            _insertDom(nodes, toNode, $this.type == 2 ? 'insertBefore' : 'appendTo');
                        }
                    }).then(step('link')).then(step('init')).then(step('ready'));
                }).finally(function (e) {
                    (e instanceof Error) && bingo.trace(e);
                    build.bgOff();
                    build.bgDispose();
                    $this.bgDispose();
                });
            },
            compile: function () {
                if (!this._isEnd()) {
                    if (this._rendArgs) {
                        return this._render.apply(this, this._rendArgs)._compile();
                    } else if (this.nodes()) {

                        return this._compile();

                    } else if (bingo.isString(this.html())) {
                        return this.nodes(_parseHTML(this.html(), this.node, true))._compile();
                    } else if (this.url() || this.tmpl()) {
                        //以url方式加载, 必须先指parentNode;
                        var $this = this, view = this.view() || bingo.view(this.node);;
                        this.view(view);
                        return bingo.tmpl(this.url() || this.tmpl()).then(function (html) {
                            return html && $this.html(html).compile();
                        });
                    }
                }
                return _Promise.resolve();
            }
        });

    }); //end _cmpClass

    bingo.compile = function (view) {
        return new _cmpClass().view(view);
    };

    bingo.bgEventDef('ready');

    (function () {
        //初始rootView
        _compiles.setCmpNode(_docEle);
        _rootView = new _viewClass(null, _docEle);
        new _viewnodeClass(_rootView, _docEle);

        //触发bingo.ready
        _rootView.$ready(function () {
            bingo.bgEnd('ready');
        });

        //DOMContentLoaded 时起动
        var _readyName = 'DOMContentLoaded', _ready = function () {
            doc.removeEventListener(_readyName, _ready, false);
            window.removeEventListener('load', _ready, false);
            //等待动态加载js完成后开始
            bingo.usingAll().then(function () {
                bingo.compile(_rootView).nodes(_docEle).compile().finally(function () {
                    return _rootView._bgpri_.sendReady();
                });
            });
        };
        
        doc.addEventListener(_readyName, _ready, false);
        window.addEventListener("load", _ready, false);

    })();

})(bingo);


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


(function (bingo) {
    "use strict";
    var _Promise = bingo.Promise,
        _attr = function (node, name, val) {
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
        _cssfix = /^-ms-/,
	    _cssAlpha = /-([\da-z])/gi,
	    _cNameCase = function (all, letter) {
	        return (letter + "").toUpperCase();
	    },
	    _camelCase = function (string) {
	        return string.replace(_cssfix, "ms-").replace(_cssAlpha, _cNameCase);
	    },
        _csss = [
		    "width", "height", "fontSize", 'top',
		    "padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
		    "margin", "marginLeft", "marginRight", "marginTop", "marginBottom"
        ],
        _css = function (node, name, val) {
            if (!node || node.nodeType === 3 || node.nodeType === 8 || !node.style) {
                return;
            }
            var cssName = _camelCase(name), style = node.style;
            if (arguments.length < 3)
                return style[cssName];
            else
                style[cssName] = _csss.indexOf(name) >= 0 ? parseFloat(val) + 'px' : val;
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
        _val = function (node, val) {
            if (arguments.length < 2)
                return node.value;
            else
                node.value = val;
        };
    /*
        使用方法:
        bg-controller="function($view){}"   //直接绑定一个function
        bg-controller="ctrl/system/user"    //绑定到一个url
    */

    bingo.each(['bg-controller', 'bg-controller-add'], function (cmdName) {
        var _isAdd = cmdName == 'bg-controller-add';

        bingo.command(cmdName, function () {

            return {
                //优先级, 越小越前, 默认50
                priority: _isAdd ? 5 : 1,
                //模板, 可以是引用id, url, html和node节点
                //tmpl:'#div1'
                //tmpl:'tmpl/test.thml'
                //tmpl:'<div>{{text1}}</div>'
                //tmpl:document.body  //==> document.body.innerHTML
                tmpl: '',
                //是否替换节点, 默认为false
                replace: false,
                //是否indclude, 默认为false, 模板内容要包函{{bg-include}}
                include: false,
                //是否新view, 默认为false
                view: !_isAdd,
                //是否编译子节点, 默认为true
                compileChild: _isAdd,
                //编译前, 主要用于dom的重新改造, 只能注入$view/node/$ajax...
                //如果view == true , 注入的view属于上层, 原因是新view还没解释出来, 还处于分析
                //compilePre还可以修改本定义属性
                compilePre: null,
                //controller
                compile: null,
                //link
                link: null,
                //编译, 这时还没有appendTo文档，最好不要处理事件之类的
                //compilePre编译前-->command.controller初始数据-->view.controller-->compile编译-->插入到document-->link连接command)-->init-->ready
                controller: ['$view', '$compile', 'node', '$attr', function ($view, $compile, node, $attr) {
                    var attrVal = $attr.content, val = null, pView = $view.$parentView();
                    if (!bingo.isNullEmpty(attrVal)) {
                        if (pView.bgTestProps(attrVal))
                            val = pView.bgDataValue(attrVal);
                        else if (window.bgTestProps(attrVal))
                            val = window.bgDataValue(attrVal);
                    }

                    var cmp = function () {
                        return !_isAdd && bingo.usingAll().then(function () {
                            return $compile().nodes(node.childNodes).compile();
                        });
                    };

                    if (bingo.isNullEmpty(attrVal)
                        || bingo.isFunction(val) || bingo.isArray(val)) {
                        //如果是function或数组, 直接当action, 或是空值时
                        //添加controller
                        val && $view.$addController(val, attrVal);
                        //编译
                        return cmp();
                    } else {
                        //使用url方式, 异步加载action, 走mvc开发模式
                        var url = attrVal;

                        var routeContext = bingo.routeContext(url);
                        var context = routeContext.context();

                        if (context.controller) {
                            //如果controller不为空, 即已经定义controller
                            //设置app
                            $view.$setApp(context.app);
                            //添加controller
                            $view.$addController(context.controller, attrVal);
                            //编译
                            return cmp();
                        } else {
                            //如果找不到controller, 加载js
                            return bingo.using(url).then(function () {
                                var context = routeContext.context();
                                if (context.controller) {
                                    //设置app
                                    $view.$setApp(context.app);
                                    //添加controller
                                    $view.$addController(context.controller, attrVal);
                                    //编译
                                    return cmp();
                                }
                            });
                        }
                    }
                }]  //end controller
            };
        });
    }); // end bg-controller

    //bg-init初始数据用, bg-load节点准备好了。
    bingo.each(['bg-init', 'bg-load'], function (cName) {
        var priority = cName == 'bg-load' ? 999999 : 3;
        bingo.command(cName, function () {
            var cmd = {
                priority: priority
            };
            cmd[cName == 'bg-load' ? 'link' : 'compile'] = ['$attr', function ($attr) {
                $attr.$eval();
            }];
            return cmd;
        });
    }); //end bg-init

    bingo.command('bg-not-compile', function () {
        return {
            //是否编译子节点, 默认为true
            compileChild: false
        };
    });// end bg-not-compile

    bingo.command('bg-node', function () {
        return {
            compile: ['$attr', function ($attr) {
                $attr.$value($attr.node);
            }]
        };
    }); //end bg-node

    bingo.command('bg-text', function () {
        return {
            compile: ['$attr', 'node', function ($attr, node) {
                $attr.$layout(function (c) {
                    node.textContent = c.value;
                });
            }]
        };
    }); //end bg-text

    bingo.command('bg-html', function () {
        return {
            compile: ['$attr', '$viewnode', function ($attr, $viewnode) {
                $attr.$layout(function (c) {
                    return $viewnode.$html(c.value);
                });
            }]
        };
    }); //end bg-html

    bingo.command('bg-include', function () {
        return {
            compile: ['$attr', '$viewnode', '$tmpl', function ($attr, $viewnode, $tmpl) {

                var _html = function (p) {
                    return $tmpl(p).then(function (html) {
                        $viewnode.$html(html);
                    });
                };

                if ($attr.$hasProps())
                    $attr.$layoutValue(function (c) {
                        return $viewnode.$html(c.value);
                    });
                else
                    return _html($attr.content);
            }]
        };
    }); //end bg-include

    bingo.command('bg-if', function () {
        return {
            compileChild: false,
            compile: ['$attr', '$viewnode', 'node', '$tmpl', function ($attr, $viewnode, node, $tmpl) {
                return $tmpl(node).then(function (html) {

                    var _set = function (value) {
                        if (value) {
                            return $viewnode.$html(html).then(function () { _show(node); });
                        } else
                            _hide(node);
                    };

                    $attr.$layout(function (c) {
                        return _set(c.value);
                    });
                });
            }]
        };
    }); //end bg-if

    /*
        使用方法:
        bg-attr="{src:'text.html', value:'ddd'}"
        bg-prop="{disabled:false, checked:true}"
        bg-checked="true" //直接表达式
        bg-checked="helper.checked" //绑定到变量, 双向绑定
    */
    bingo.each('attr,prop,src,checked,unchecked,disabled,enabled,readonly,class'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return {
                compile: ['$view', '$attr', 'node', function ($view, $attr, node) {

                    var _set = function (val) {
                        switch (attrName) {
                            case 'attr':
                                //bg-attr="{src:'text.html', value:'ddd'}"
                                bingo.eachProp(val, function (item, n) {
                                    _attr(node, n, item);
                                });
                                break;
                            case 'prop':
                                bingo.eachProp(val, function (item, n) {
                                    _prop(node, n, item);
                                });
                                break;
                            case 'enabled':
                                _prop(node, 'disabled', !val);
                                break;
                            case 'unchecked':
                                _prop(node, 'checked', !val);
                                break;
                            case 'disabled':
                            case 'readonly':
                            case 'checked':
                                _prop(node, attrName, val);
                                break;
                            case 'class':
                                var cV = val;
                                if (bingo.isObject(val)) {
                                    cV = [];
                                    bingo.eachProp(val, function (item, n) {
                                        item && cV.push(n);
                                    });
                                    cV = cV.join(' ');
                                }
                                _prop(node, attrName, cV);
                                break;
                            default:
                                _attr(node, attrName, val);
                                break;
                        }

                    };

                    $attr.$layout(function (c) {
                        _set(c.value);
                    });

                    if (attrName == 'checked' || attrName == 'unchecked') {
                        var fn = function () {
                            var value = _prop(node, 'checked');
                            $attr.$value(attrName == 'checked' ? value : !value);
                        };
                        //如果是checked, 双向绑定
                        _on.call(node, 'click', fn);
                        $attr.bgOnDispose(function () {
                            _off.call(node, 'click', fn);
                        });
                    }

                }]
            };
        });
    }); //end attrs


    /*
        使用方法:
        bg-event="{click:function(e){}, dblclick:helper.dblclick, change:['input', helper.dblclick]}"
        bg-click="helper.click"     //绑定到方法
        bg-click="['input', helper.click]"     //绑定到数组, 等效于$().on('click', 'input', helper.click)
        bg-click="helper.click()"   //直接执行方法
    */
    bingo.each('event,click,blur,change,dblclick,focus,focusin,focusout,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,resize,scroll,select,submit,contextmenu'.split(','), function (eventName) {
        bingo.command('bg-' + eventName, function () {

            return ['$view', 'node', '$attr', function ($view, node, $attr) {

                var _bindList = [], bind = function (evName, callback) {
                    var fn = function () {
                        $view.$updateAsync();
                        return callback.apply(this, arguments);
                    };
                    _bindList.push([evName, fn]);
                    _on.call(node, evName, fn);
                };
                $attr.bgOnDispose(function () {
                    bingo.each(_bindList, function (item) {
                        _off.call(node, item[0], item[1]);
                    });
                });

                if (eventName != 'event') {
                    var fn = /^\s*\[(.|\n)*\]\s*$/g.test($attr.content) ? $attr.$results() : $attr.$value();
                    if (!bingo.isFunction(fn) && !bingo.isArray(fn))
                        fn = function (e) { return $attr.$eval(e); };
                    bind(eventName, fn);
                } else {
                    var evObj = $attr.$results();
                    if (bingo.isObject(evObj)) {
                        bingo.eachProp(evObj, function (fn, n) {
                            bind(n, fn);
                        });
                    }
                }

            }];

        });
    }); //end event

    /*
        使用方法:
        bg-style="{display:'none', width:'100px'}"
        bg-show="true"
        bg-show="res.show"
    */
    bingo.each('style,show,hide,visible'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return {
                compile: ['$attr', 'node', function ($attr, node) {

                    var _set = function (val) {

                        switch (attrName) {
                            case 'style':
                                //bg-style="{display:'none', width:'100px'}"
                                bingo.eachProp(val, function (item, n) {
                                    _css(node, n, item);
                                });
                                break;
                            case 'hide':
                                val = !val;
                            case 'show':
                                if (val) _show(node); else _hide(node);
                                break;
                            case 'visible':
                                val = val ? 'visible' : 'hidden';
                                _css(node, 'visibility', val);
                                break;
                            default:
                                _css(node, attrName, val);
                                break;
                        }
                    };

                    $attr.$layout(function (c) {
                        _set(c.value);
                    });

                }]
            };

        });
    }); //end style

    bingo.command('bg-model', function () {

        return {
            compile: ['$view', 'node', '$attr', function ($view, node, $attr) {


                var _type = _attr(node, 'type'),
                    _isRadio = _type == 'radio',
                    _isCheckbox = _type == 'checkbox',
                    _checkboxVal = _isCheckbox ? _val(node) : null,
                    _isSelect = node.tagName.toLowerCase() == 'select';

                var _getElementValue = function () {
                    return _isCheckbox ? (_prop(node, "checked") ? _checkboxVal : '') : _val(node);
                }, _setElementValue = function (value) {
                    value = _isSelect && bingo.isArray(value) ? value : bingo.toStr(value);
                    if (_isCheckbox) {
                        _prop(node, "checked", (_val(node) == value));
                    } else if (_isRadio) {
                        _prop(node, "checked", (_val(node) == value));
                    } else
                        _val(node, value);
                };

                var _eVal, eName, fn = function () {
                    var value = _getElementValue();
                    if (_eVal != value) {
                        _eVal = value;
                        $attr.$value(value);
                    }
                };
                if (_isRadio) {
                    eName = 'click';
                } else {
                    eName = 'change';
                    _on.call(node, 'change', fn);
                }
                if (eName) {
                    _on.call(node, eName, fn);
                    $attr.bgOnDispose(function () {
                        _off.call(node, eName, fn);
                    });
                }

                $attr.$layoutValue(function (c) {
                    var val = c.value;
                    _setElementValue(val);
                });

            }]
        };

    });//end model


    /*
        使用方法:
        bg-for="item in user.list"

        例:
        <select bg-for="item in list">
            ${if item.id == 1}
            <option value="${item.id}">text_${item.text}</option>
            ${else}
            <option value="${item.id}">text_${item.text}eee</option>
            ${/if}
        </select>
    */

    //bg-for
    //bg-for="datas"  ==等效==> bg-render="item in datas"
    //bg-for="item in datas"
    //bg-for="item in datas tmpl=#tmplid"    //tmpl以#开头认为ID
    //bg-for="item in datas tmpl=view/user/listtmpl"  //tmpl不以#开头认为url, 将会异步加载
    //bg-for="item in datas | asc"
    //bg-for="item in datas | asc tmpl=#tmplid"
    bingo.command('bg-for', function () {
        return {
            priority: 10,
            compileChild: false,
            compile: ['$view', '$compile', 'node', '$attr', '$tmpl', function ($view, $compile, node, $attr, $tmpl) {

                var attrData = _makeBindContext($attr);

                if (!attrData) return;
                var _itemName = attrData.itemName,
                    _tmpl = attrData.tmpl;

                _tmpl || $tmpl(node).then(function (s) {
                    _tmpl = s;
                });

                var _render = function (tmpl, datas) {
                    return $compile().render(tmpl, datas, _itemName, $attr.withData).htmlTo(node).compile().then(function () {
                        var m = $attr.viewnode.$getAttr('bg-model');
                        m && m.$publish();
                    });
                };
                $attr.$layout(function (c) {
                    var t = c.value,
                        isL  =bingo.isArray(t),
                        datas = isL ?t : bingo.sliceArray(t);
                    (!isL) && datas.length == 0 && (datas = t ? [t] : []);
                    return $tmpl(_tmpl).then(function (s) {
                        return _render(s, datas);
                    });
                    //return 'bg-for aaaaaaaaaaa';
                });

            }]
        };

    }); //end bg-for

    var _renderReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/,
        _makeBindContext = function ($attr) {
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
            });

            $attr.content = _dataName;

            return {
                itemName: _itemName,
                dataName: _dataName,
                tmpl: _tmpl
            };
        }; //end _makeBindContext

    //end bg-for 

    bingo.each(['bg-component', 'bg:component'], function (cmdName) {
        var isInner = (cmdName == 'bg-component');
        bingo.command(cmdName, function () {

            return {
                priority: 3,
                view: true,
                compileChild: false,
                replace: true,
                include: false,
                compilePre: ['$view', 'node', '$inject', function (pView, node, $inject) {
                    var attrVal = _attr(node, isInner ? 'bg-component' : 'bg-src'),
                        val, compName = _attr(node, 'bg-name');

                    if (!bingo.isNullEmpty(attrVal)) {
                        if (pView.bgTestProps(attrVal))
                            val = pView.bgDataValue(attrVal);
                        else if (window.bgTestProps(attrVal))
                            val = window.bgDataValue(attrVal);
                    }
                    var init = function (def) {
                        def = bingo.isFunction(def) ? $inject(def) : def;
                        //取得定义后， 得到$tmpl
                        this.tmpl = def.$tmpl || node;
                        this._bgcompdef_ = { def: def, name: compName };
                    }.bind(this);

                    if (val) {
                        return init(val);
                    } else {
                        //使用url方式, 异步加载action, 走mvc开发模式
                        var url = attrVal;

                        var routeContext = bingo.routeContext(url);
                        var context = routeContext.context();

                        if (context.component) {
                            return init(context.component);
                        } else {
                            return bingo.using(url).then(function () {

                                routeContext = bingo.routeContext(url);
                                context = routeContext.context();
                                if (context.component) {
                                    return init(context.component);
                                }
                            });
                        }
                    }
                }],
                controller: ['$view', '$compile', 'node', '$attr', function ($view, $compile, node) {
                    var pView = $view.$parentView(),
                        comdef = this._bgcompdef_,
                        def = comdef.def,
                        compName = comdef.name;
                   
                    $view.bgOnDispose(function () {
                        pView.$removeComp(compName);
                        //console.log('bg:component dispose', node.tagName);
                    });
                    if (def) {
                        var co = $view.$defComp(def, compName);
                        co.bgToObserve();
                        return $compile().nodes([node]).compile();
                    }

                }]  //end compile
            };

        }); //end bg-component

    });//end each bg-component

    
})(bingo);
