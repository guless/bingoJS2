
(function (bingo, undefined) {
    "use strict";

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
            $remove: function () {
                _removeNode(this.$getNode());
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
            bingo.using(node.src);
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
        var container = doc.createElement('div');
        container.innerHTML = html;
        while (depth--) {
            container = container.lastChild;
        }
        _parseSrcipt(container, script);
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
