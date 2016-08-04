
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
            //$layoutResult(function(c)), this.$result
            //$layoutResult('', function(c)), this.$attrs.$result
            //$layoutResult('datas', function(c)), this.$attrs.datas.$result
            $layoutResult: function () {
                var args= arguments, len = args.length,
                    prop = args[0],
                    fn = args[len > 1 ? 1 : 0],
                    ow = len > 1 ? (prop ? this.$attrs[prop] : this.$attrs) : this;

                return this.$layout(function () {
                    return this.$result && this.$result();
                }.bind(ow || {}), fn);
            },
            $layoutValue: function () {
                var args= arguments, len = args.length,
                    prop = args[0],
                    fn = args[len > 1 ? 1 : 0],
                    ow = len > 1 ? (prop ? this.$attrs[prop] : this.$attrs) : this;

                ow && (ow.$hasProps() || ow.$value(undefined));
                return this.$layout(function () { return this.$value && this.$value(); }.bind(ow || {}), fn);
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
                    if (this.bgIsDispose || (dispoer && dispoer.bgIsDispose)) return;
                    //this.$updateAsync();
                    return fn.apply(this, arguments);
                }.bind(this);
                fn1.orgFn = fn.orgFn;//保存原来observe fn
                var obs = !bingo.isFunction(p) ? bingo.observe(this, p, fn1, autoInit)
                    : bingo.observe(function(){ return (this.bgIsDispose || (dispoer && dispoer.bgIsDispose)) || p.apply(this, arguments);}.bind(this), fn1, autoInit);
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

                    var nodes = this.$nodes, context = _getCPRefNode(this);
                    this.$nodes = [];
                    return _compile({
                        cp: this, context: context, domBefore: function () {
                            _removeCPNodes(nodes);

                        }, opName: 'insertBefore'
                    }, ctrl);
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
            $loadTmpl: function (p, aP, bRoute) {

                if (bingo.isString(p) && p.indexOf('#') == 0) {
                    var id = p.substr(1);
                    var cp = (this.$ownerView || this.$view).$ownerCP;
                    var tmpl = cp.__tmpl && cp.__tmpl[id];
                    return bingo.isString(tmpl) ? _Promise.resolve(tmpl) : this.$app.tmpl(p);
                } else
                    return this.$app.tmpl(p, aP, bRoute);

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
        var node = p.context, optName = p.opName,
            isAppend = optName == 'appendTo',
            tmNode = _doc.createElement((isAppend ? node : node.parentNode).tagName),
            nextNode, pNode, domBefore = p.domBefore;
        if (!isAppend) {

            nextNode = _doc.createElement('script');
            nextNode.type = 'text/html';

            _doc.createElement
            _insertDom([nextNode], node, 'insertBefore');
            tmNode.appendChild(node.cloneNode(false));
        }
        return cp._render(bd).then(function () {
            return _Promise.resolve().then(bd.doneStep('CPCtrl')).then(bd.doneStep('ViewCtrl')).then(bd.doneStep('CPEvent')).then(function () {
                var nodeT = isAppend ? tmNode : tmNode.firstChild;
                _traverseCP(nodeT, cp, optName, bd);
            }).then(bd.doneStep('CPInit')).then(bd.doneStep('ViewInit')).then(function () {
                domBefore && domBefore();
                if (isAppend)
                    _insertDom(tmNode.childNodes, node, 'appendTo');
                else {
                    _insertDom(bingo.sliceArray(tmNode.childNodes, 0, -1), nextNode, 'insertBefore');
                    _removeNode(nextNode);
                }
                tmNode = nextNode = null;
            })
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
        var isP = bingo.isPlainObject(node), tmplP;
        if (isP) {
            ctrl = node.ctrl;
            tmplP = node.tmpl;
            node = node.node;
        }
        var cp = _getNodeCP(node) || _rootCP,
            app = cp.$app,
            view = cp.$view,
            isScript = node.tagName.toLowerCase() == 'script';
        
        return app.usingAll().then(function () {
            var r = (tmplP ? _Promise.resolve(tmplP) : app.tmpl(node)).then(function (tmpl) {
                tmplP || (node.innerHTML = '');
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
