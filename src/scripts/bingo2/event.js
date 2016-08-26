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
                list.forEach(function (item) {
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
    }, _rmEvent = function (o) {
        var events = o[_bgevsn];
        if (events) {
            o.bgOff(Object.keys(events).join(' '));
            o[_bgevsn] = null;
        }
    }, _splitEvName = function (eventName) {
        return !eventName ? [] : eventName.replace(/(^\s*)|(\s*$)/g, '').split(/\s+/g);
    };

    Object.prototype.bgDefProps({
        //bgOn('ready', fn)
        bgOn: function (eventName, callback) {
            _getEvent(this, eventName, true).on(callback, this);
            return this;
        },
        //bgOn('ready', fn)
        bgOne: function (eventName, callback) {
            _getEvent(this, eventName, true).on(callback, this, true);
            return this;
        },
        //bgOff() //删除所有事件
        //bgOff('ready')
        //bgOff('ready', fn)
        bgOff: function (eventName, callback) {
            if (arguments.length == 0)
                _rmEvent(this);
            else
                _getEvent(this, eventName).off(callback);
            return this;
        },
        //bgEnd('ready init')
        bgEnd: function (eventName) {
            _getEvent(this, eventName, true).end(this);
            return this;
        },
        //bgTrigger('ready')
        //bgTrigger('ready', [arg1, arg2])
        //bgTrigger('ready', [arg1, arg2], this)
        bgTrigger: function (eventName, args, thisArg) {
            return _getEvent(this, eventName).trigger(args, thisArg || this);
        },
        bgTriggerHandler: function (eventName, args, thisArg) {
            return _getEvent(this, eventName).trigger(args, thisArg || this, true);
        },
        //bgEventDef('ready init')
        bgEventDef: function (eventName) {
            /// <summary>
            /// bgEventDef('onOk onError')
            /// </summary>
            _splitEvName(eventName).forEach(function (item) {
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
                Object.keys(this).forEach(function (n) {
                    var item = this[n];
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
