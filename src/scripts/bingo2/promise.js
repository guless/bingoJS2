﻿(function (bingo, undefined) {
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
        all: function (args, fn, alway) {
            return Promise(function (resolve, reject) {
                var list = _makeArgs(args, fn);
                var resList = [], len = list.length;
                if (list.length > 0) {
                    bingo.each(list, function (item, index) {
                        if (!item || !item.then) {
                            resList[index] = item;
                            (--len) || resolve(resList);
                        } else {
                            var tFn = function (res) {
                                resList[index] = res;
                                (--len) || resolve(resList);
                            };
                            item.then(tFn, alway ? tFn : reject);
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
                        if (!item || !item.then)
                            resolve(item);
                        else
                            item.then(resolve, reject);
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

    bingo.Promise = Promise;

})(bingo);
