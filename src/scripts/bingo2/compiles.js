
(function (bingo, undefined) {
    "use strict";

<<<<<<< HEAD
    var doc = document, _docEle = doc.documentElement;

    bingo.view = function (p) {
        /// <summary>
        /// 获取view<br />
        /// bingo.view(document.body)<br />
        /// bingo.view('main')
        /// </summary>
        bingo.isString(p) && (p = doc.querySelector('[bg-name="' + p + '"]'));
        return _getVNode(p).view;
    };

    var _rootView = null;
    bingo.rootView = function () { return _rootView; };

    var _Promise = bingo.Promise, _promisePush = function (promises, p) {
        p && promises.push(p);
        return p;
    }, _retPromiseAll = function (promises) {
        return promises.length > 0 ? _Promise.always(promises) : undefined;
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
                        var pm = list.length > 0 ? _Promise.always(list, function (fn) {
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
            $addController: function (ctrl, name, ctrlname) {
                name && (this.$name = name);
                ctrlname && (this.$ctrlname = ctrlname);
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
=======
    //CP: Content Provider(内容提供者)
    //todo ctrl 的注入promise问题处理
    //todo command:route ser
    //todo 特殊command支持attr风格， 如 {{if where="表达式" name="if1"}}
    //todo 删除注释内容

    //aFrame====================================

    var _rAFrame = window.requestAnimationFrame,
        _cAFrame = window.cancelAnimationFrame,
        _isAFrame = true,
        _aFrameList = [], _aFrameId,
        _aFrame = function (obj) {
            /// <param name="fn" value="fn.call(obj, obj)"></param>
            _aFrameList.push(obj);
            _aFrameCK();
        }, _aFrameCK = function () {
            if (!_aFrameId) {
                var fn = function () {
                    clearTimeout(_aFrameId);
                    _aFrameId = null;
                    var list = [], orgs = _aFrameList;
                    _aFrameList = [];
                    bingo.each(orgs, function (item) {
                        if (!item._stop) {
                            item.n--;
                            if (item.n < 0) {
                                item.fn(item);
                            } else {
                                list.push(item);
                            }
                        }
                    });
                    list.length > 0 && (_aFrameList = list.concat(_aFrameList));
                    if (_aFrameList.length > 0) return _aFrameCK();
                };
                _aFrameId = setTimeout(fn, 50);
                _rAFrame(fn);
            }
            return _aFrameId;
        };

    if (!_rAFrame) {
        var prefixes = ['webkit', 'moz', 'ms', 'o']; //各浏览器前缀
        bingo.each(prefixes, function (prefix) {
            _rAFrame = window[prefix + 'RequestAnimationFrame'];
            if (_rAFrame) {
                _cAFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
                return false;
            }
        });

        if (!_rAFrame) {
            _isAFrame = false;
            _rAFrame = function (callback) {
                return window.setTimeout(callback, 10);
            };
            _cAFrame = function (id) {
                window.clearTimeout(id);
            };
        }
    }
    bingo.isAFrame = _isAFrame;

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
        }, _retPromiseAll = function (promises) {
            return promises.length > 0 ? _Promise.always(promises) : undefined;
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
        bindContext: function (cacheobj, content, hasRet, view, node, withData) {

            var cacheName = [content, hasRet].join('_');
            var contextCache = (cacheobj[_vm._cacheName] || (cacheobj[_vm._cacheName] = {}));
            if (contextCache[cacheName]) return contextCache[cacheName];

            hasRet && (content = ['try { return ', content, ';} catch (e) {bingo.observe.error(e);}'].join(''));
            var fnDef = [
                        'with ($view) {',
                            //如果有withData, 影响性能
                            withData ? 'with ($withData) {' : '',
                                'return function (event) {',
                                    content,
                                '}.bind(_this_);',
                            withData ? '}' : '',
                        '}'].join('');
            try {
                return contextCache[cacheName] = (new Function('_this_', '$view', '$withData', 'bingo', fnDef))(node || view, view, withData, bingo);//bingo(多版本共存)
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
                return _vm.bindContext(this, contents, isRet, this.$view, this.$node, _pri.withData);
            },
            $hasProps: function () {
                return _pri.valueObj(this)[0].bgTestProps(this.$contents);
            },
            $value: function (val) {
                var contents = this.$contents, obj = _pri.valueObj(this)[0];
                if (arguments.length == 0) {
                    return obj.bgDataValue(contents);
                } else {
                    this.$view.$updateAsync();
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
                bd && bd.pushStep('CPInit', function () {
                    return [fn({})];
                }.bind(this));
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

        //新建view
        var view = _newBase({
            $ownerCP: null,
            $parent: null,
            $children: [],
            $controller: function (fn) {
                _pri.ctrls.push(fn);
            },
            $init: function (fn) {
                _pri.inits.push(fn);
            },
            $ready: function (fn) {
                _pri.readys.push(fn);
            },
            $observe: function (p, fn, dispoer, check, autoInit) {
                autoInit !== false && this.bgToObserve(true);
                var fn1 = function () {
                    //这里会重新检查非法绑定
                    //所以尽量先定义变量到$view, 再绑定
                    if (this.bgIsDispose) return;
>>>>>>> master
                    this.$updateAsync();
                    return fn.apply(this, arguments);
                }.bind(this);
                fn1.orgFn = fn.orgFn;//保存原来observe fn
<<<<<<< HEAD
                var obs = !bingo.isFunction(p) ? bingo.observe(this, p, fn1)
                    : bingo.observe(p, fn1);
                //check是否检查, 如果不检查直接添加到obsList
                if (!check || !obs.isObs)
                    (obs.isObs ? this._bgpri_.obsList : this._bgpri_.obsListUn).push([obs, dispoer, check]);
                return obs;
            },
            $layout: function (p, fn, fnN, dispoer, check) {
                return this.$observe(p, bingo.aFrameProxy(fn, fnN), dispoer, check);
            },
            $layoutAfter: function (p, fn, dispoer, check) {
                return this.$layout(p, fn, 1, dispoer, check);
            },
            $update: function (force) {
                if (!this.$isReady) return;
                this.bgToObserve(true);

                //检查非法观察者
                this._bgpri_.obsListUn = this._bgpri_.obsListUn.filter(function (item, index) {
=======
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
>>>>>>> master
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
<<<<<<< HEAD
                            if (!item[2]) this._bgpri_.obsList.push(item);
=======
                            if (!item[2]) _pri.obsList.push(item);
>>>>>>> master
                            return false;
                        }
                    }
                    return true;
                }, this);
            },
            $updateAsync: function () {
                if (this._upastime_) clearTimeout(this._upastime_);
<<<<<<< HEAD
                this._upastime_ = setTimeout(function () { this.$update(); }.bind(this), 1);
            },
            $html: function (node, html) {
                if (arguments.length > 0) {
                    return bingo.compile(this).html(html).htmlTo(node).compile();
                } else
                    return jo.innerHTML;
            },
            $remove: function () {
                _removeNode(this.$getNode());
            },
            $getComp: function (name) {
                return this._bgpri_.comp[name];
            },
            $removeComp: function (name) {
                this.bgIsDispose || delete this._bgpri_.comp[name];
            },
            $setCompCfg: function (p, name) {
                var cfg = this._bgpri_.compCfg[name] || {};
                bingo.extend(cfg, p);
                this._bgpri_.compCfg[name] = cfg;
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

                var cfg = {};
                if (name) {
                    var pView = this.$parentView();
                    var comp = pView._bgpri_.comp;
                    comp[name] = this;
                    cfg = pView._bgpri_.compCfg[name] || {};
                    delete pView._bgpri_.compCfg[name];
                }

                init && init.call(this, cfg);

                return this;
            },
            $createComp: function (p) {
                var pNode = p.context || this.$getNode();
                var name = p.name || bingo.makeAutoId();
                var src = p.src;
                var tmpl = '<bg:component bg-src="' + src + '" bg-name="' + name + '"></bg:component>';
                this.$setCompCfg(p, name);
                return bingo.compile(this).html(tmpl).appendTo(pNode).compile().then(function () {
                    return this.$getComp(name);
                }.bind(this));
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
                compCfg: {},
                initPm: [],
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
=======
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
            $insertBefore: function (p, ref) {
                return this.$ownerCP.$insertBefore(p, ref);
            },
            $insertAfter: function (p, ref) {
                return this.$ownerCP.$insertAfter(p, ref);
            },
            $inject: function (p, injectObj, thisArg) {
                return bingo.inject(p, this, bingo.extend({ $cp: this.$ownerCP }, injectObj), thisArg);
            },
            $reload: function () {
                return this.$ownerCP.$reload();
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
            bd.pushStep('ViewCtrl', function () {
                if (this.bgIsDispose) return;
                var ctrls = _pri.ctrls, promises = [];
                if (ctrls.length > 0) {
                    _pri.ctrls = [];
                    bingo.each(ctrls, function (item) {
                        _promisePush(promises, this.$inject(item));
                            //.then(function () {
                            //    this.bgToObserve();
                            //}.bind(this)));
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
            },
            reload: function (cp) {
                var ret = this.getContent(cp);
                if (_isPromise(ret))
                    ret.then(function (s) {
                        return cp.$html(bingo.trim(s));
                    });
                else
                    ret = cp.$html(bingo.trim(ret));
                return ret;
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
            $html: function (s) {
                if (arguments.length > 0) {
                    _clearCP(this);
                    this.$tmpl(s);

                    return _compile({ cp: this, context: _getCPRefNode(this), opName: 'insertBefore' });
                } else {
                    var list = [];
                    bingo.each(this.$nodes, function (item) {
                        list.push(item.nodeType == 1 ? item.outerHTML : item.textContent);
                    });
                    return list.join('');
                }
            },
            $insertBefore: function (p, ref) {
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
                    }).then(function (cpT) {
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
            $insertAfter: function (p, ref) {
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
                    }).then(function (cpT) {
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
                if (this.$cmd != 'view' && this.$name) {
                    this.$view[this.$name] = this.$export || this.$ownerView || this.$view;
                }
                return _renderThread();
            },
            $controller: function (fn) {
                _pri.ctrl = fn;
            },
            $inject: function (p, injectObj, thisArg) {
                return bingo.inject(p, this.$view, bingo.extend({ $cp: this }, injectObj), thisArg);
            },
            $reload: function () {
                return _pri.reload(this);
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
                this.$view[this.$name] = this.$export || this.$ownerView || this.$view;
            }
            return promises;
        }.bind(cp));

        //处理command定义
        cmdDef = app.command(cp.$cmd);
        cmdDef && (cmdDef = cmdDef.fn);
        _promisePush(_renderPromise, cmdDef && cmdDef(cp));
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
    }, _newVirtualNode = function (cp, node, bd) {
        //如果是新view, 读取$ownerView
        var view = cp.$ownerView || cp.$view;
        var vNode = _newBase({
            $view: view,
            $app: view.$app,
            $cp: cp,
            $node: node,
            $attrs: _newBase({}),
            _addAttr: function (name, contents) {
                return this.$attrs[name] = _newVirtualAttr(this, name, contents, bd);
            }
        });
        _virtualAttrs(vNode, node);
        cp.$virtualNodes.push(vNode);
        vNode.bgOnDispose(function () {
            var attrs = this.$attrs;
            bingo.eachProp(attrs, function (item) {
                item.bgDispose();
            });
        });
        return vNode;
    }, _newVirtualAttr = function (vNode, name, contents, bd) {
        var cp = vNode.$cp;
        var vAttr = _newBindContext({
            $cp: cp,
            $vNode: vNode,
            $node: vNode.$node,
            $app: vNode.$app,
            $view: vNode.$view,
            $name: name,
            $contents: contents,
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
            }
        }, bd);

        vAttr.$withData(cp.$withData());

        var _eventList = [];
        vAttr.bgOnDispose(function () {
            bingo.each(_eventList, function (item) {
                _off.apply(this.$node, item);
            }.bind(this));
        });

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
        if (lv <= 0) {
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
    }, _cpCtrls = [], _cpCtrlStep = function () {
        var ctrls = _cpCtrls;
        if (ctrls.length > 0) {
            _cpCtrls = [];
            bingo.each(ctrls, function (ctrl) {
                ctrl();
                _cpCtrlStep();
            });
        }
    }, _viewCtrls = [], _viewCtrlStep = function () {
        var ctrls = _viewCtrls;
        if (ctrls.length > 0) {
            _viewCtrls = [];
            bingo.each(ctrls, function (ctrl) {
                ctrl();
                _viewCtrlStep();
            });
        }
    }, _newBuild = function () {
        var _stepObj = {}, _doneStep = function (stepList) {
            var promises = [];
            bingo.each(stepList, function (fn) {
                _promisePushList(promises, fn());
            });
            return _retPromiseAll(promises);
        };
        return {
            pushStep: function (name, fn) {
                if (_stepObj[name])
                    _stepObj[name].push(fn);
                else
                    _stepObj[name] = [fn];
            },
            doneStep: function (name, reverse) {
                var stepList = _stepObj[name],
                  has = stepList && stepList.length > 0;
                if (has) {
                    _stepObj[name] = [];
                    reverse && stepList.reverse();
                }
                return function () { return has ? _doneStep(stepList) : null };
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

>>>>>>> master

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
<<<<<<< HEAD
            bingo.using(node.src);
=======
            bingo.defualtApp.using(node.src);
>>>>>>> master
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
<<<<<<< HEAD
        var container = doc.createElement('div');
=======
        var container = _doc.createElement('div');
>>>>>>> master
        container.innerHTML = html;
        while (depth--) {
            container = container.lastChild;
        }
        _parseSrcipt(container, script);
<<<<<<< HEAD
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
        traverseNode: function (p, nodeType, bNodes, idx) {
            /// <summary>
            /// 遍历node
            /// </summary>
            /// <param name="p" value='_newTraParam()'></param>

            //元素element 1, 属性attr 2,文本text 3,注释comments 8,文档document 9

            var node = p.node;
            if (nodeType === 1) {

                if (!this.isCmpNode(node)) {
                    this.setCmpNode(node);

                    return this.analyzeNode(node, p, bNodes, idx);
                }
                return node.hasChildNodes() && this.traverseNodes(node.childNodes, p);
            } else {

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
        traverseNodes: function (nodes, p, fisrt) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="nodes"></param>
            /// <param name="p" value="_newTraParam()"></param>
            /// <param name="withDataList"></param>

            var injectTmplWithList = [],
                withDataList = p.withDataList,
                withData = p.withData, promises =[];

            var node, pc,
                tmplIndex = -1, nodeType, bNodes = fisrt ? p.build.nodes : null;
            bingo.each(nodes, function (node, idx) {
                nodeType = node.nodeType;
                if (nodeType == 1 || nodeType == 3) {
                    pc = bingo.extend({}, p);
                    tmplIndex = withDataList ? this.getWithdataIndex(node) : -1;
                    if (tmplIndex >= 0)
                        withData = pc.withData = withDataList[tmplIndex];
                    if (node.nodeType === 1 || node.nodeType === 3) {
                        pc.node = node;
                        _promisePush(promises, this.traverseNode(pc, nodeType, bNodes, idx));
                    }
                };
            }, this);

            return _retPromiseAll(promises);
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
        analyzeView: function (attrObj, node, p, bNodes, idx) {
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
                                var nT = _parseHTML(tmpl, pNode, true);
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
                                _removeNode(oldNode);
                                bNodes && (bNodes[idx] = node);

                                //生成view node等
                                viewnode = _compiles.buildVNode(p, node, attrList, isNewView);

                                return compileChild && _compiles.traverseNodes(node.childNodes, p);
                            }));

                        } else //else !emptyTmpl
                            //删除本节点
                            _removeNode(oldNode);

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
        analyzeNode: function (node, p, bNodes, idx) {
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
                _promisePush(promises, _compiles.analyzeView(attrObj, node, p, bNodes, idx));
            else {
                promises.push(_Promise.always(cmpPres).then(function () {
                    return _compiles.analyzeView(attrObj, node, p, bNodes, idx);
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
            //0, appendTo; 1,htmlTo; 2,insertBefore; 3,replace
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
            replaceTo: function (node) {
                return this.prop(arguments, 3);
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

                    list = list.concat(_compiles.injWithTmpl(_parseHTML(tmpl, this.node, true), index));
                    //htmls.push(_compiles.injWithTmpl(tmpl, index, pIndex));
                }, this);

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
                    ready: [],
                    //返回解释后的节点， 可能replace之类，变得不一样
                    nodes: bingo.sliceArray(nodes)
                };


                var view = this.view() || bingo.view(parentNode),
                    pViewnode = this.view() ? this.view().$getViewnode() : _getVNode(parentNode);

                //检查pViewnode, view不等于pViewnode.view
                //node上下关系并不与viewnode上下关系对应
                if (pViewnode && pViewnode.view != view) pViewnode = null;

                var withDataList = this.withDataList();

                var $this = this, step = function (name) {
                    return function () {
                        if ($this._isEnd()) return;
                        //处理command的compile, 或执行compile时期处理
                        build.bgTrigger(name);
                        return build[name].length > 0 && _Promise.always(build[name]);
                    };
                };

                return _Promise.always([_compiles.traverseNodes(nodes, {
                    node: null, pViewnode: pViewnode,
                    view: view, ctrl: this.controller(),
                    withData: this.withData(), withDataList: withDataList,
                    build: build
                }, true)]).then(step('ctrl')).then(function () {
                    return $this._isEnd() || view._bgpri_.controller();
                }).then(step('compile')).then(function () {
                    return bingo.aFramePromise().then(function () {
                        if ($this._isEnd()) return;
                        var pVN = pViewnode;
                        if (toNode) {
                            var mn = 'appendTo', type = $this.type;
                            switch (type) {
                                case 1:
                                    toNode.innerHTML = ''
                                    break;
                                case 2:
                                case 3:
                                    mn = 'insertBefore';
                                    break;
                            }
                            _insertDom(build.nodes, toNode, mn);
                            type == 3 && (_removeNode(toNode));
                        }
                    }).then(step('link')).then(step('init')).then(step('ready'));
                }).finally(function (e) {
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
=======
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
    var _compile = function (p) {
        var view = p.view;
        var bd = _newBuild();
        var cp = p.cp || _newCP({
            $app: view.$app || bingo.defualtApp,
            $parent: p.parent || view.$ownerCP,
            $view: view, $contents: p.tmpl
        }, false, bd).$tmpl(p.tmpl);

        return cp._render(bd).then(function () {
            return _Promise.resolve().then(bd.doneStep('CPCtrl')).then(bd.doneStep('ViewCtrl')).then(function () {
                //_cpCtrlStep();
                //_viewCtrlStep();
                var node = p.context, opName = p.opName;
                _traverseCP(node, cp, opName, bd);
                //return bingo.aFramePromise().then(function () {
                //    var node = p.context, opName = p.opName;
                //    _traverseCP(node, cp, opName, bd);
                //});
            }).then(bd.doneStep('CPInit')).then(bd.doneStep('ViewInit'))
            .then(bd.doneStep('ViewReady'));

            //return _complieInit().then(function () { return cp; });
        }).then(function () { bd.bgDispose(); return cp; });
    };

    //<>&"
    //&lt;&gt;&amp;&quot;
    var _attrEncode = bingo.attrEncode = function (s) {
        return !s ? '' : s.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\&/g, '&amp;').replace(/\"/g, '&quot;');
    };
    bingo.attrDecode = bingo.htmlDecode;


    //查找dom 节点 <div>
    var _domNodeReg = /\<.*?\[\[.*?\]\][^>]*\>/gi,
        //解释可绑定的节点属性: attr="fasdf[[user.name]]"
        _domAttrReg = /\s*(\S+)\s*=\s*((\")(?:\\\"|[^"])*?\[\[.+?\]\](?:\\\"|[^"])*\"|(\')(?:\\\'|[^'])*?\[\[.+?\]\](?:\\\'|[^'])*\')/gi,
        //用于解释节点属性时， 将内容压成bg-virtual
        //如:<div value="[user.name]" style="[[user.style]]"></div>
        //解释成<div  bg-virtual="{value:'user.name', style:'user.style'}"></div>
        _domNodeRPReg = /\s*(\/?\>)$/,
        //如果绑定纯变量时去除"', 如valu="[[user.name]]", 解释后value=[[user.name]]
        _domAttrPotReg = /^\s*['"](.*?)['"]\s*$/,
        //如果绑定纯变量时去除[], 如valu=[[user.name]], 解释后value=user.name
        _domAttrOnlyReg = /^\s*\[\[(.*?)\]\]\s*$/,
        //转义多个绑定时， 如果style="[[ok]]asdf[[false]]sdf", 解释后 style="''+ ok + 'asdf' + false + 'sdf"
        _domAttrMultReg = /\[\[(.*?)\]\]/g,
        _domAttrVirName = 'bg-virtual',
        _domAttrVirSt = [' ', _domAttrVirName, '="'].join(''),
        _domAttrVirEn = '" $1',
        _domAttrQuery = '[' + _domAttrVirName + ']';

    var _renderAttr = function (tmpl) {
        tmpl = tmpl.replace(_domNodeReg, function (find, pos, contents) {

            _domAttrReg.lastIndex = 0;
            var domAttrs = {}, has = false, isV = false;
            var findR = find.replace(_domAttrReg, function (findAttr, name, contents, dot, dot1) {

                if (isV || name == 'bg-virtual') { has = false; isV = true; return; }
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
            context = JSON.parse(attr);

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

    bingo.compile = function (node) {
        var cp = _getNodeCP(node) || _rootCP,
            app = cp.$app,
            view = cp.$view;
        return app.usingAll().then(function () {
            var r = app.tmpl(node).then(function (tmpl) {
                node.innerHTML = '';
                return _compile({
                    tmpl: tmpl,
                    view: view,
                    parent: view.$ownerCP || cp,
                    context: node,
                    opName: 'appendTo'
                }).then(function (cpT) {
                    cpT.$parent.$children.push(cpT);
                    return cpT;
                });
            });
            return r;
        });
>>>>>>> master
    };

    bingo.bgEventDef('ready');

    (function () {
<<<<<<< HEAD
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

=======

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
>>>>>>> master
    })();

})(bingo);
