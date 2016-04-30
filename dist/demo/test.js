//tran command
(function () {
    //todo tranvse后layout

    var _Promise = bingo.Promise,
        _isPromise = _Promise.isPromise, _promisePush = function (promises, p) {
            _isPromise(p) && promises.push(p);
            return p;
        }, _retPromiseAll = function (promises) {
            return promises.length > 0 ? _Promise.always(promises) : undefined;
        };

    var _isLinkNodeType = function (type) {
        return type == 1 || type == 8;
    },
    _isRemoveAll = function (nodes) {
        return bingo.inArray(function (item, i) {
            return _isLinkNodeType(item.nodeType) ? !!item.parentNode : false;
        }, nodes) < 0;
    },
    _linkNodes = function (cacheName, nodes, callback) {
        bingo.each(nodes, function (item) {
            if (_isLinkNodeType(item.nodeType)) {
                var fn = function () {
                    //删除没用的node
                    nodes = bingo.removeArrayItem(function (item) {
                        return item == this || !item.parentNode;
                    }.bind(this), nodes);
                    if (callback && _isRemoveAll(nodes)) callback();
               };
                (item[cacheName] || (item[cacheName] = [])).push(fn);
               bingo.linkNode(item, fn);
            }
        });
    },
    _unLinkNodes = function (cacheName, nodes) {
        bingo.each(nodes, function (item) {
            item[cacheName] && bingo.each(item[cacheName], function (fn) {
                bingo.unLinkNode(item, fn);
            });
        });
    };

    var _vm = {
        _cacheName: '__contextFun__',
        bindContext: function (cacheobj, content, hasRet, view, node, withData) {

            var cacheName = [content, hasRet].join('_');
            var contextCache = (cacheobj[_vm._cacheName] || (cacheobj[_vm._cacheName] = {}));
            if (contextCache[cacheName]) return contextCache[cacheName];

            hasRet && (content = ['try { return ', content, ';} catch (e) {bingo.observe.error(e);}'].join(''));
            //console.log('bind', node || view);
            return contextCache[cacheName] = (new Function('_this_', '$view', '$withData', 'bingo', [
                    'with ($view) {',
                        //如果有withData, 影响性能
                        withData ? 'with ($withData) {' : '',
                            'return function (event) {',
                                content,
                            '}.bind(_this_);',
                        withData ? '}' : '',
                    '}'].join('')))(node || view, view, withData, bingo);//bingo(多版本共存)
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
    }, _newBindContext = function (p) {
        //绑定上下文
        var _pri = {
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
        return _newBase({
            $view:null,
            $node:null,
            $contents: '',
            $withData: function (name, p) {
                _pri.withData[name] = p;
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
            }
        }).$extend(p);
    }, _newView = function (p) {

        var _pri = {
            obsList: [],
            obsListUn: [],
            ctrls:[]
        };

        //新建view
        var view = _newBase({
            $controller: function (fn) {
                _pri.ctrls.push(fn);
            },
            _doneCtrl: function () {
                var ctrls = _pri.ctrls;
                if (ctrls) {
                    _pri.ctrls = [];
                    bingo.each(ctrls, function (item) {
                        item && item.call(this, this);
                    }, this);
                }
                this.bgToObserve();
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
                    (obs.isObs ? _pri.obsList : _pri.obsListUn).push([obs, dispoer, check]);
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
                this._upastime_ = setTimeout(function () { this.$update(); }.bind(this), 1);
            }
        }).$extend(p);

        view.bgOnDispose(function () {
            bingo.each(_pri.obsList, function (item) {
                item[0].bgIsDispose || item[0].unObserve();
            });

            bingo.each(_pri.obsList, function (item) {
                item[0].bgIsDispose || item[0].unObserve();
            });
        });

        //编译时同步用
        _addView(view);
        return view;
    }, _newCP = function (p) {
        //todo asdfsf
        var _pri = {
            obsList: [],
            removeNodes: function (nodes) {
                if (nodes) {
                    _unLinkNodes('_cpLinkC', nodes);
                    bingo.each(nodes, function (item) {
                        _removeNode(item);
                    });
                }
            },
            clear: function (cp) {
                bingo.each(cp.$children, function (item) {
                    item.bgDispose();
                });
                bingo.each(cp.$virtualAttrs, function (item) {
                    item.bgDispose();
                });
                if (cp.$childView)
                    cp.$childView.bgDispose();
                cp.$children = cp.$virtualAttrs = cp.$childView = null;
            },
            getContent: function (cp) {
                if (cp._tmplFn)
                    return cp._tmplFn();
                else
                    return cp.$contents;
            },
            getPNode: function (cp) {
                var nodes = cp.$nodes;
                var index = bingo.inArray(function (item) { return !!item.parentNode; }, nodes);
                return index > -1 ? nodes[index] : null;
            }
        };

        //新建command的CP参数对象
        var cp = _newBindContext({
            $childView:null,
            $app:null,
            $cmd: '',
            $attrs: null,
            $nodes: null,
            $virtualAttrs:null,
            $setNodes: function (nodes) {
                _pri.removeNodes(this.$nodes);
                this.$nodes = nodes;
                _linkNodes('_cpLinkC', nodes, function () {
                    this.bgDispose();
                }.bind(this));
            },
            $getAttr:function(name){
                return this.$attrs.$getAttr(name);
            },
            $setAttr: function (name, contents) {
                this.$attrs.$setAttr(name, contents);
            },
            $parent:null,
            $children: null,
            $removeChild: function (cp) {
                this.$children = bingo.removeArrayItem(cp, this.$children);
            },
            $getChild: function (id) {
                var item;
                //console.log(id, this.$children);
                bingo.each(this.$children, function () {
                    if (this.$id == id) {
                        item = this;
                        return false;
                    }
                });
                return item;
            },
            $html: function (s) {
                if (arguments.length > 0) {
                    _pri.clear(this);
                    this.$tmpl(s);

                    return _compile({ cp: this, context: _pri.getPNode(this) });
                } else {
                    var list = [];
                    bingo.each(this.$nodes, function (item) {
                        list.push(item.nodeType == 1 ? item.outerHTML : item.textContent);
                    });
                    return list.join('');
                }
            },
            $text: function (s) {
                if (arguments.length > 0) {
                    _pri.clear(this);
                    this.$contents = this.tmplTag = bingo.htmlEncode(s);

                    return _traverseCP(_pri.getPNode(this), this, 'insertBefore');
                } else {
                    var list = [];
                    bingo.each(this.$nodes, function (item) {
                        list.push(item.textContent);
                    });
                    return list.join('');
                }
            },
            $tmpl: function (fn) {
                this._tmplFn = bingo.isFunction(fn) ? fn : function () { return fn; };
                return this;
            },
            _render: function () {
                var ret = _pri.getContent(this);
                if (_isPromise(ret))
                    ret.then(function (s) {
                        _traverseCmd(s, this);
                    }.bind(this));
                else
                     _traverseCmd(ret, this);
                _promisePush(_renderPromise, ret)
                return this;
            },
            $render: function () {
                this._render();
                return _renderThread();
            },
            $controller: function (fn) {
                this._ctrl = fn;
            },
            _doneCtrl: function () {
                var ctrl = this._ctrl;
                if (ctrl) {
                    this._ctrl = null;
                    ctrl.call(this, this.$view);
                }
            },
            $layout: function (wFn, fn, num, init) {
                if (arguments.length == 1) {
                    fn = wFn;
                    wFn = function () {
                        return this.$result();
                    }.bind(this);
                }
                _initList.push(function () {
                    var obs = this.$view.$layout(wFn, fn, num, this, true);
                    _pri.obsList.push(obs);
                    return (init !== false) ? obs.publish(true) : null;
                }.bind(this));
            }
        }).$extend(p);

        cp.bgOnDispose(function () {
            var parent = this.$parent;
            if (parent && !parent.bgIsDispose) {
                parent.$removeChild(this);
            }
            bingo.each(this.$elseList, function (cp) {
                cp.bgIsDispose || cp.bgDispose();
            });
            bingo.each(_pri.obsList, function (obs) {
                obs.bgIsDispose || obs.unObserve();
            });
            this.$attrs.bgDispose();
            if (!parent || !parent.bgIsDispose) {
                _pri.removeNodes(this.$nodes);
            }
            _pri.clear(this);
        });

        //编译时同步用
        _cpList.push(cp);
        return cp;
    }, _newCPAttr = function (contents) {
        return _newBindContext({
            $contents: contents,
        });
    }, _newCPAttrs = function (contents) {
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
                        this[name] = _newCPAttr(contents);
                    }
                },
                _setCP: function (cp) {
                    this.$view = cp.$view;
                    this.cp = cp;
                    bingo.each(_names, function (item) {
                        this[item].cp = cp;
                        this[item].$view = cp.$view;
                    }, this);
                }
            });
        _attrs.bgOnDispose(function () {
            bingo.each(_names, function (item) {
                this[name].bgDispose();
            }, this);
            console.log('dispose attrs');
        });
        return _attrs;
    }, _newVirtualAttr = function (contents) {
        return _newBindContext({
            $contents: contents,
        });
    };


    var _commands = {}, _defCommand = function (name, fn) {
       
        if (arguments.length == 1)
            return _commands[name];
        else
            _commands[name] = fn;
    };

    bingo.controller('view_test1', function ($view) {
        console.log('view controller', $view);
        //user.desc
        $view.user = {
            desc: 'asdfasdfasfdasdf11<br />asdfasdf<div>sdf</div> {{html "<div>div</div><div>div1</div>asdf" /}}sdfssdf',
            enabled: true,
            role:'test'
        };

        window.view1 = $view;
    });

    _defCommand('view', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var ctrl = cp.$getAttr('controller');
        if (ctrl) {
            ctrl = bingo.controller(ctrl);
            ctrl && cp.$view.$controller(ctrl.fn);
        }

        return cp;
    });

    _defCommand('controller', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('');

        cp.$view.$controller(function () {
            cp.$eval();
        });

        return cp;
    });


    _defCommand('for', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var src = cp.$getAttr('src');

        var itemName = 'item', dataName = 'datas';
        cp.$contents = dataName;
        cp.$tmpl('');

        cp.$layout(function () {
            return cp.$result();
        }, function (c) {
            cp.$html(c.value);
        });

        return cp;
    });

    _defCommand('if', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('');

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
        };

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            //console.log('if====>', cp.$contents);
            cp.$html(_getContent(-1, c.value));
        });

        bingo.each(_elseList, function (item, index) {
            item.$attrs.$contents && cp.$layout(function () {
                return item.$attrs.$result();
            }, function (c) {
                cp.$html(_getContent(index, c.value));
            }, 0, false);
        });

        return cp;
    });

    _defCommand('include', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl(function () {
            return bingo.tmpl(cp.$getAttr('src'));
        });

        return cp;
    });

    _defCommand('html', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            cp.$html(c.value);
        });

        return cp;
    });

    _defCommand('text', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            cp.$text(c.value);
        });

        return cp;
    });

    _defCommand('select', function (cp) {
        /// <param name="cp" value="_newCP()"></param>
        cp.$tmpl('{{view /}}<select>{{for item in datas}}<option value="1"></option>{{/for}}</select>');

        cp.$controller(function ($view) {
            console.log('select1 controller');
            $view.idName = '';
            $view.textName = '';
            $view.id = '';
            $view.datas = '';
        });

        return cp;
    });



    var tmpl = document.getElementById('tmpl1').innerHTML;


    //指令解释:
    //{{cmd /}}
    //{{cmd attr="asdf" /}}
    //{{cmd attr="asdf"}} contents {{/cmd}}
    var _commandReg = /\{\{\s*(\S+)\s*(.*?)\/\}\}|\{\{\s*(\S+)\s*?(.*?)\}\}((?:.|\n|\r)*)\{\{\/\3\}\}/gi,
        //解释else
        _checkElse = /\{\{\s*(\/?if|else)\s*(.*?)\}\}/gi,
        //解释指令属性: attr="fasdf"
        _cmdAttrReg = /(\S+)\s*=\s*(?:\"((?:\\\"|[^"])*?)\"|\'((?:\\\'|[^'])*?)\')/gi;

    //scriptTag
    var _getScriptTag = function (id) { return ['<' , 'script type="text/html" bg-id="', id, '"></', 'script>'].join(''); };

    var _allViews = [],
        _addView = function (view) {
            _allViews.push(view);
            _viewList.push(view);
        },
        _removeView = function (view) {
            _allViews = bingo.removeArrayItem(view, _allViews);
            _viewList = bingo.removeArrayItem(view, _viewList);
        },
        _getView = function (name) {
            var index = bingo.inArray(function (item) { return item.$name == name; }, _allViews);
            return index > -1 ? _allViews[index] : null;
        };

    var _traverseCmd = function (tmpl, cp) {
        _commandReg.lastIndex = 0;
        var list = [], view, app;
        //console.log(cp.cmd, cp)
        bingo.isString(tmpl) || (tmpl = bingo.toStr(tmpl));
        tmpl = tmpl.replace(_commandReg, function (find, cmd, attrs, cmd1, attrs1, content1) {
            //console.log('_commandEx', arguments);
            var id = bingo.makeAutoId(), elseList, whereList, item;
            content1 && (content1 = bingo.trim(content1));
            if (cmd1 == 'if') {
                var elseContent = _traverseElse(content1);
                content1 = elseContent.contents;
                elseList = elseContent.elseList;
                whereList = elseContent.whereList;
            }
            item = {
                $id: id,
                $cmd: cmd1 || cmd,
                $attrs: _traverseAttr(attrs1 || attrs),
                $contents: content1 || '',
                $elseList: elseList,
                $whereList: whereList
            };
            (item.$cmd == 'view') && (view = item);
            list.push(item);

            return _getScriptTag(id);
        });

        if (view) {
            app = bingo.app(view.$attrs.$getAttr('app'));
            view = _newView({
                $name: view.$attrs.$getAttr('name'),
                $app: app
            });
            cp.$childView = view;
        } else {
            app = cp.$app;
            view = cp.$view;
        }

        var children = [], tempCP, cmdDef, elseList, whereList;
        bingo.each(list, function (item) {
            //console.log('cmd', item.$cmd, view);
            tempCP = _newCP(item);
            tempCP.$view = view;
            tempCP.$attrs._setCP(tempCP);
            tempCP.$app = app;
            tempCP.$parent = cp;
            cmdDef = _defCommand(item.$cmd);
            elseList = tempCP.$elseList;
            if (elseList) {
                var cpT, whereList = tempCP.$whereList;
                bingo.each(elseList, function (item, index) {
                    cpT = _newCP({
                        $app: app,
                        $attrs: _traverseAttr(whereList[index]),
                        $view: view, $contents: item
                    });
                    cpT.$attrs._setCP(cpT);
                    //cpT._render();
                    //_promisePush(promises, cpT.$render());
                    elseList[index] = cpT;
                });
                tempCP.$whereList = null;
            }
            cmdDef && cmdDef(tempCP);
            tempCP._render();
            //_promisePush(promises, tempCP.$render());
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
    }, _traverseAttr = function (s) {
        _cmdAttrReg.lastIndex = 0;
        var item, attrs = _newCPAttrs(s);
        while (item = _cmdAttrReg.exec(s)) {
            attrs.$setAttr(item[1], item[2] || item[3]);
        }
        return attrs;
    }, _renderPromise = [], _renderThread = function () {
        var promises = _renderPromise;
        _renderPromise = [];
        return _Promise.always(promises).then(function () {
            if (_renderPromise.length > 0) return _renderStep();
        });
    }, _cpList = [], _ctrlStep = function () {
        var cpList = _cpList;
        if (cpList.length > 0) {
            _cpList = [];
            bingo.each(cpList, function (cp) {
                cp._doneCtrl();
                _ctrlStep();
            });
        }
    }, _viewList = [], _ctrlStepView = function () {
        var viewList = _viewList;
        if (viewList.length > 0) {
            _viewList = [];
            bingo.each(viewList, function (view) {
                view._doneCtrl();
                _ctrlStepView();
            });
        }
    }, _initList = [], _initStepView = function () {
        var initList = _initList;
        var promises = [];
        if (initList.length > 0) {
            _initList = [];
            bingo.each(initList, function (fn) {
                _promisePush(promises, fn());
            });
        }
        return _Promise.always(promises);
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
        _commentPrefix = 'bgcpid_',
        //取得cp空白节点
        _getCpEmptyNode = function (cp) {
            var html = (_isComment) ?
                ['<!--', _commentPrefix, cp.$id, '-->'].join('') :
                _getScriptTag(cp.$id);
            return _parseHTML(html)[0];
        },
        _isScriptTag = /script/i,
        //取得render cp标签节点
        _getEmptyRenderId = function (node) {
            return (_isScriptTag.test(node.tagName)) ?
                node.getAttribute('bg-id') : null;
        },//,
        //_getEmptyNodeId = function (node) {
        //    if (_isComment) {
        //        if (node.nodeType == 8) {
        //            var val = node.nodeValue;
        //            if (val.indexOf(_commentPrefix) == 0) {
        //                return val.replace(_commentPrefix, '');
        //            }
        //        }
        //    } else {
        //        return (_isScriptTag.test(node.tagName)) ?
        //            node.getAttribute('bg-id') : null;
        //    }
        //},

        //检查是否空内容（没有nodeType==1和8）, 如果为空， 添加一个临时代表
        _checkEmptyNodeCp = function (nodes, cp) {
            var empty = nodes.length == 0;
            if (!empty) {
                //是否有element节点, 注释节点不算
                empty = (bingo.inArray(function (item) {
                    return item.nodeType == 1;
                    //return _isLinkNodeType(item.nodeType);
                }, nodes) < 0);
            }
            empty && nodes.push(_getCpEmptyNode(cp));
        };

    var _traverseCP = function (refNode, cp, optName) {
        var tmpl = _renderAttr(cp.tmplTag);
        //console.log('tmpltmpltmpltmpl', tmpl);
        var nodes = _parseHTML(tmpl, optName == 'appendTo' ? refNode : refNode.parentNode, true);
        //console.log(cp.$cmd, nodes.length);
        if (nodes.length > 0) {
            var pNode = nodes[0].parentNode;
            _virtualAttr(cp, nodes);
            _traverseNodes(nodes, cp);
            nodes = bingo.sliceArray(pNode.childNodes);
        }

        _checkEmptyNodeCp(nodes, cp);
        _insertDom(nodes, refNode, optName);
        cp.$setNodes(nodes);
    }, _traverseNodes = function (nodes, cp) {

        var id, tempCP;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                id = _getEmptyRenderId(item);
                if (id) {
                    tempCP = cp.$getChild(id);
                    if (tempCP) {
                        //console.log('tempCP', tempCP);
                        _traverseCP(item, tempCP, 'insertBefore');
                        _removeNode(item);
                    }
                } else {
                    _traverseNodes(_queryAll('script', item), cp);
                }
            }
        });
    };

    //_compile({view:view, tmpl:tmpl, context:'#context1'});
    //_compile({cp:cp, context:node});
    var _compile = function (p) {
        var view = p.view;
        var cp = p.cp || _newCP({
            $app:view ? view.$app : null,
            $view: view, $contents: p.tmpl
        });
        return cp.$render().then(function () {
            console.log('compile',cp.$cmd, cp);
            _ctrlStep();
            _ctrlStepView();
            var node,opName;
            if (p.cp) {
                node = p.context;
                opName = 'insertBefore';
            } else {
                node = bingo.isString(p.context) ? _query(p.context) : p.context;
                opName = 'appendTo';
            }
            var fr = _traverseCP(node, cp, opName);
            console.log('_traverseCP', node.innerHTML);
            console.log('render End', new Date());
            return _initStepView();
        });
    };

    //console.time('aaaa');
    //var _tranContext = _newTranContext(), cmdList = _traverseCmd(tmpl, _tranContext);
    //_tranContext.promise().then(function () {
    //    console.log('cmdList', cmdList);
    //    //console.timeEnd('aaaa');
    //});

    var _attrENode = document.createElement('div'),
        _attrEReg = /^.*encode=['"](.*)['"].*$/i,
        _attrEncode = function (s) {
            _attrENode.setAttribute('encode', s);
            return _attrENode.outerHTML.replace(_attrEReg, '$1');
        };

    bingo.attrEncode = _attrEncode;
    bingo.attrDecode = bingo.htmlDecode;


    //查找dom 节点 <div>
    var _domNodeReg = /\<[^>]+\>/gi,
        //解释可绑定的节点属性: attr="fasdf[user.name]"
        _domAttrReg = /\s*(\S+)\s*=\s*((\")(?:\\\"|[^"])*?\[.+?\](?:\\\"|[^"])*\"|(\')(?:\\\'|[^'])*?\[.+?\](?:\\\'|[^'])*\')/gi,
        //用于解释节点属性时， 将内容压成bg-virtual
        //如:<div value="[user.name]" style="[user.style]"></div>
        //解释成<div  bg-virtual="{value:'user.name', style:'user.style'}"></div>
        _domNodeRPReg = /\s*(\/?\>)$/,
        //如果绑定纯变量时去除"', 如valu="[user.name]", 解释后value=[user.name]
        _domAttrPotReg = /^['"](.*)['"]$/,
        //如果绑定纯变量时去除[], 如valu=[user.name], 解释后value=user.name
        _domAttrOnlyReg = /^\[(.*)\]$/,
        _domAttrVirName = 'bg-virtual',
        _domAttrVirSt = [' ', _domAttrVirName, '="'].join(''),
        _domAttrVirEn = '" $1',
        _domAttrQuery = '[' + _domAttrVirName + ']';

    var _renderAttr = function (tmpl) {
        tmpl = tmpl.replace(_domNodeReg, function (find, pos, contents) {
            //console.log('domNodeReg', arguments);
            _domAttrReg.lastIndex = 0;
            var domAttrs = {}, has = false, isV = false;
            var findR = find.replace(_domAttrReg, function (findAttr, name, contents, dot, dot1) {
                //console.log('fndR', arguments);
                if (isV || name == 'bg-virtual') { has = false; isV = true; return; }
                contents = contents.replace(_domAttrPotReg, '$1').replace(_domAttrOnlyReg, '$1');
                //dot = dot || dot1;
                domAttrs[name] = contents;
                has = true;
                return '';// 'bg-' + findAttr;
            });
            if (has) {
                findR = findR.replace(_domNodeRPReg, [_domAttrVirSt, _attrEncode(JSON.stringify(domAttrs)), _domAttrVirEn].join(''));
                //console.log('findR', findR);
            }
            //virtual
            return isV ?find : findR;
        });
        return tmpl;
    }, _virtualAttr = function (cp, nodes) {
        var list = [], ltemp;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                if (item.hasAttribute(_domAttrVirName))
                    list.push(item);
                if (item.hasChildNodes) {
                    ltemp = _queryAll(_domAttrQuery, item);
                    if (ltemp.length > 0)
                        list = list.concat(bingo.sliceArray(ltemp));
                }
            }
        });
        console.log('_virtualAttr', list);
    };
    //console.log(_renderAttr(tmpl));
    //console.log('domAttrReg', _domAttrList);


    var _rootView = _newView({
        $name: '',
        $app: bingo.app('')
    });
    _compile({
        tmpl: tmpl,
        view: _rootView,
        context: '#context1'
    });

    //测试
    var attrMethod = true;
    attrMethod = attrMethod && ('hasChildNodes' in document.body);
    attrMethod = attrMethod && ('hasAttribute' in document.body);
    attrMethod = attrMethod && ('getAttribute' in document.body);
    console.log('attrMethod====>', attrMethod);

    //测试各浏览器删除script节点兼容性
    //var ns = _query('script');
    //bingo.linkNode(ns, function () { console.log('okkkkkk'); });
    //ns.parentNode.removeChild(ns);

    //测试是否支持comment
    //var nodes = _parseHTML('<option>asdfasf</option><!--test-->', 'select');
    //var _isComment = nodes.length > 1;
    //console.log('_parseHTML', _isComment, nodes);


    //var tmpl2 = document.getElementById('tmpl2').innerHTML;
    //_domAttrReg = /\s*(\S+)\s*=\s*(\"(?:\\\"|[^"])*?\[.*?\](?:\\\"|[^"])*\"|\'(?:\\\'|[^'])*?\[.*?\](?:\\\'|[^'])*\')/gi;
    //console.log(_domAttrReg.exec(tmpl2));

    //console.log('tmpl ===> ', (regEx.exec(tmpl)));

})();

//render-->comp-->create-->ctrl-->layout-->ready
//render-->comp-->create-->子comp-->子create-->ctrl-->layout-->子ctrl-->子layout-->ready
//cp <---> view

//todo: comp
(function () {
    return;

    var view = {
        //拥有的节点
        _bgNode: null,
        $name: ''
    };

    var compItem = {
        name: '',
        //拥有的节点
        _bgNode: null,
        view: view,
        children: [],
        //编译前的nodes, 包括cmd节点
        _bgNodes: [],
        //编译后的nodes
        nodes: [],
        command: null,
        content: '',
        attrs: function () {
            if (this._bgOldCtn != this.content) {
                this._bgOldCtn = this.content;
                this._bgAttrs = tranAtrr;//分析
            }
            return this._bgAttrs;
        },
        value: function () { },
        result: function () {
        },
        eval: function () {
        },
        render: function () {
        },
        observe: function () {
        },
        layout: function () {
        }
    };

    bingo.command('name', function (cp, attrs) {

        return cp.render(function (context) {
            return context;
            return bingo.tmpl(url);
        }).layout(function (c) {
            return '';
        });

    });

})();

//todo: route
(function () {
    return;
    var app = bingo.app('demo');

    //设置tmpl资源路由
    app.route('tmpl', {
        type: 'tmpl',
        //路由url, 如: view/system/user/list
        url: '{tmpl*}',
        //路由到目标url, 生成:modules/system/user/list.html
        to: '{tmpl*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: 'demo', tmpl: '' }
    });

    //设置actionS资源路由
    app.route('ctrl', {
        type: 'controller',
        url: 'ctrl/{controller*}',
        to: '{controller*}.js',
        defaultValue: { controller: '' }
    });

    //设置component资源路由
    app.route('component', {
        type: 'component',
        url: 'comp/{component*}',
        to: 'comps/{component*}.js',
        defaultValue: { component: '' }
    });

    //设置service资源路由
    app.route('service', {
        type: 'service',
        url: '{service*}',
        to: '{service*}.js',
        defaultValue: { service: '' }
    });


})();
