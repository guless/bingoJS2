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
