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
            //aaaaa++;
            var obs = _getObserveData(obj, prop);
            obs && obs.push({ fn: fn });
            return obs;
        }, _delObs = function (obj, prop, fn) {
            var obd;
            if (obd = obj[_obsDName]) {
                var obs = obd.obs;
                if (bingo.isNull(prop)) {
                    if (!fn)
                        obd.sobs = [];
                    else {
                        //注意只会释放一次
                        _removeFn(obd.sobs, fn);
                        obd.sobs = obd.sobs.slice();
                        //obd.sobs = obd.sobs.filter(function (item) { return item.fn != fn; });
                    }
                } else if (obs[prop]) {
                    if (!fn)
                        obs[prop] = [];
                    else {
                        _removeFn(obs[prop], fn);
                        obs[prop] = obs[prop].slice();
                        //obs[prop] = obs[prop].filter(function (item) { return item.fn != fn; });
                    }
                }
            }
        }, _resObs = function (obj) {
            var obd = obj[_obsDName];
            if (obd) {
                obd.obs = [];
            }
            obj.bgToObserve();
        }, _removeFn = function (list, fn) {
            var index = bingo.inArray(function (item) { return item.fn == fn; }, list);
            if (index > -1) {
                list.splice(index, 1);
                _removeFn(list, fn);
            }
        };

    //window.aaaaa = 0;
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
            /// bgToObserve(['prop1','prop2'])<br/>
            /// bgToObserve('prop', true)
            /// bgToObserve(['prop1','prop2'], true)<br/>
            /// </summary>
            /// <param name="deep">是否自动深toObserve</param>
            if (this.bgNoObserve) return this;
            if (bingo.isBoolean(prop)) { deep = prop; prop = null; }
            _defObserve(this, prop ? (bingo.isArray(prop) ? prop : [prop]) : Object.keys(this), deep);
            return this;
        },
        bgObServe: function (prop, fn) {
            /// <summary>
            /// bgObServe(function(change){})<br/>
            /// bgObServe('prop', function(change){})
            /// bgObServe(['prop1','prop2'], function(change){})
            /// </summary>
            if (this.bgNoObserve) return this;
            if (bingo.isNull(prop) || bingo.isFunction(prop)) {
                this.bgToObserve();
                _addObs(this, null, prop || fn);
            } else {
                bingo.each(prop ? (bingo.isArray(prop) ? prop : [prop]) : Object.keys(this), function (item) {
                    _addObs(this, item, fn);
                }, this);
            }
            return this;
        },
        bgUnObServe: function (prop, fn) {
            /// <summary>
            /// bgUnObServe(fn)<br/>
            /// bgUnObServe('prop', fn)
            /// bgUnObServe(['prop1','prop2'], fn)
            /// </summary>
            //if (this.bgNoObserve) return this;
            if (bingo.isNull(prop) || bingo.isFunction(prop)) {
                _delObs(this, null, prop || fn);
            } else {
                bingo.each(prop ? (bingo.isArray(prop) ? prop : [prop]) : Object.keys(this), function (item) {
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
                    if (!obs) return;
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
            if (item == 'this') return;
            //测试模式
            if (test && !_existProp(last, item)) { has = false; return false; }
            if (index <= end) {
                if (!last[item]) {
                    last[item] = (nreg.test(l[index + 1]) ? {} : []);
                    last.bgToObserve(item, true);
                    last = last[item];
                } else
                    last = last[item];
            } else {
                name = item;
                if (!(name in last)) {
                    last[name] = null;
                    last.bgToObserve(name, true);
                }
            }
        });
        return [last, name, end == -1 ? _existProp(last, name) : has];
    }, _existProp = function (o, name) {
        return bingo.isArray(o) || bingo.isObject(o)
            || bingo.isWindow(o) || bingo.isElement(o) || bingo.isFunction(o) ? (name in o) : false;
    };

})(bingo);
