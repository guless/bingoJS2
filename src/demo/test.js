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
    _linkNodes = function (nodes, callback) {
        var count = 0;
        bingo.each(nodes, function (item) {
            if (_isLinkNodeType(item.nodeType)) {
                count++;
                item._cpLinkFn = function () {
                    count--;
                    if (count == 0 && callback) callback();
                };
                bingo.linkNode(item, item._cpLinkFn);
            }
        });
    },
    _unLinkNodes = function (nodes) {
        bingo.each(nodes, function (item) {
            bingo.unLinkNode(item, item._cpLinkFn);
        });
    };

    var _newBase = function (p) {
        //基础
        var o = {
            extend: function (p) {
                return bingo.extend(this, p);
            }
        };
        return o.extend(p);
    }, _newBindContext = function (p) {
        //绑定上下文

        return _newBase({
            contents: '',
            value: function () { },
            result: function () {
            },
            eval: function () {
            }
        }).extend(p);
    }, _newView = function (p) {
        //新建view
        var view = _newBase({
            controller: function (fn) {
                this._ctrl = fn;
            },
            _doneCtrl: function () {
                var ctrl = this._ctrl;
                if (ctrl) {
                    this._ctrl = null;
                    ctrl.call(this, this);
                }
            }
        }).extend(p);
        _addView(view);
        return view;
    }, _newCP = function (p) {
        //新建command的CP参数对象
        var cp = _newBindContext({
            view: null,
            childView:null,
            app:null,
            cmd: '',
            attrs: null,
            nodes: null,
            setNodes: function (nodes) {
                _unLinkNodes(this.nodes);
                this.nodes = nodes;
                _linkNodes(nodes, function () {
                    this.bgDispose();
                }.bind(this));
            },
            removeNodes: function () {
                if (this.nodes) {
                    _unLinkNodes(this.nodes);
                    bingo.each(this.nodes, function (item) {
                        _removeNode(item);
                    });
                    this.nodes = [];
                }
            },
            getAttr:function(name){
                return this.attrs.getAttr(name);
            },
            setAttr: function (name, contents) {
                this.attrs.setAttr(name, contents);
            },
            parent:null,
            children: null,
            removeChild: function (cp) {
                this.children = bingo.removeArrayItem(cp, this.children);
            },
            getChild: function (id) {
                var item;
                //console.log(id, this.children);
                bingo.each(this.children, function () {
                    if (this.id == id) {
                        item = this;
                        return false;
                    }
                });
                return item;
            },
            _getContent: function () {
                if (this._tmplFn)
                    return this._tmplFn();
                else
                    return this.contents;
            },
            html: function (s) {
                if (arguments.length > 0) {
                    this._clear();
                    this.contents = s;
                    _compile(this);
                } else {
                    var list = [];
                    bingo.each(this.nodes, function (item) {
                        list.push(item.nodeType == 1 ? item.outerHTML : item.textContent);
                    });
                    return list.join('');
                }
            },
            text: function (s) {
            },
            tmpl: function (fn) {
                this._tmplFn = bingo.isFunction(fn) ? fn : function () { return fn; };
                return this;
            },
            _render: function () {
                var ret = this._getContent();
                if (_isPromise(ret))
                    ret.then(function (s) {
                        _traverseCmd(s, this);
                    }.bind(this));
                else
                     _traverseCmd(ret, this);
                _promisePush(_renderPromise, ret)
                return this;
            },
            render: function () {
                this._render();
                return _renderThread();
            },
            layout: function (p, fn) {
                switch (arguments.length) {
                    case 0:
                        return this._layoutFn;
                    case 1:
                        this._layoutFn = p;
                        return this;
                    case 2:
                        return this;
                }
            },
            controller: function (fn) {
                this._ctrl = fn;
            },
            _doneCtrl: function () {
                var ctrl = this._ctrl;
                if (ctrl) {
                    this._ctrl = null;
                    ctrl.call(this, this.view);
                }
            },
            _clear: function () {
                this.removeNodes();
                bingo.each(this.children, function (item) {
                    item.bgDispose();
                });
                if (this.childView)
                    this.childView.bgDispose();
            }
        }).extend(p);

        cp.bgOnDispose(function () {
            var parent = this.parent;
            if (parent && !parent.bgIsDispose) {
                parent.removeChild(this);
            }
            this._clear();
        });

        _cpList.push(cp);
        return cp;
    }, _newCPAttr = function (contents) {
        return _newBindContext({
            contents: contents,
        });
    };


    var _commands = {}, _defCommand = function (name, fn) {
       
        if (arguments.length == 1)
            return _commands[name];
        else
            _commands[name] = fn;
    };

    bingo.controller('view1', function ($view) {
        console.log('view controller');
    });

    _defCommand('view', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var ctrl = cp.getAttr('controller');
        if (ctrl) {
            ctrl = bingo.controller(ctrl);
            ctrl && cp.view.controller(ctrl.fn);
        }

        return cp;
    });


    _defCommand('for', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var src = cp.getAttr('src');

        var itemName = 'item', dataName = 'datas';
        cp.contents = dataName;
        cp.tmpl('');

        cp.layout(function () {
            return cp.result();
        }, function (c) {
            cp.html(c.value);
        });

        return cp;
    });

    _defCommand('if', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.tmpl('');

        cp.layout(function () {
            return cp.attrs.result();
        }, function (c) {
            cp.html(c.value ? cp.contents : '') ;
        });

        bingo.each(cp.elseList, function (item) {
            cp.layout(function () {
                return item.attrs.result();
            }, function (c) {
                item.html(c.value ? item.contents : '');
            });
        });

        return cp;
    });

    _defCommand('include', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.tmpl(function () {
            return bingo.tmpl(cp.getAttr('src'));
        });

        return cp;
    });

    _defCommand('html', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.layout(function () {
            return cp.result();
        }, function (c) {
            cp.html(c.value);
        });

        return cp;
    });

    _defCommand('text', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.layout(function () {
            return cp.result();
        }, function (c) {
            cp.text(c.value);
        });

        return cp;
    });

    _defCommand('select', function (cp) {
        /// <param name="cp" value="_newCP()"></param>
        cp.tmpl('{{view /}}<select>{{for item in datas}}<option value="1"></option>{{/for}}</select>');

        cp.controller(function ($view) {
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
            var index = bingo.inArray(function (item) { return item.name == name; }, _allViews);
            return index > -1 ? _allViews[index] : null;
        };

    var _traverseCmd = function (tmpl, cp) {
        _commandReg.lastIndex = 0;
        var list = [], view, app;
        tmpl = tmpl.replace(_commandReg, function (find, cmd, attrs, cmd1, attrs1, content1) {
            //console.log('_commandEx', arguments);
            var id = bingo.makeAutoId(), elseList, item;
            if (cmd1 == 'if') {
                var elseContent = _traverseElse(content1);
                content1 = elseContent.contents;
                elseList = elseContent.elseList;
            }
            item = {
                id: id,
                cmd: cmd1 || cmd,
                attrs: _traverseAttr(attrs1 || attrs),
                contents: content1 || '',
                elseList: elseList
            };
            (item.cmd == 'view') && (view = item);
            list.push(item);

            return _getScriptTag(id);
        });

        if (view) {
            app = bingo.app(view.attrs.getAttr('app'));
            view = _newView({
                name: view.attrs.getAttr('name'),
                app: app
            });
            cp.childView = view;
        } else {
            app = cp.app;
            view = cp.view;
        }

        var children = [], tempCP, cmdDef, elseList;
        bingo.each(list, function (item) {
            tempCP = _newCP(item);
            tempCP.view = view;
            tempCP.app = app;
            tempCP.parent = cp;
            cmdDef = _defCommand(item.cmd);
            cmdDef && cmdDef(tempCP);
            elseList = item.elseList;
            if (elseList) {
                var cpT
                bingo.each(elseList, function (item, index) {
                    cpT = _newCP({
                        app: app,
                        view: view, contents: item
                    });
                    //_promisePush(promises, cpT.render());
                    elseList[index] = cpT;
                });
            }
            tempCP._render();
            //_promisePush(promises, tempCP.render());
            children.push(tempCP);
        });
        cp.children = children;
        cp.tmplTag = tmpl;
        //return _retPromiseAll(promises);
    }, _traverseElse = function (contents) {
        var lv = 0, item, cmd, index = -1, start = -1;
        _checkElse.lastIndex = 0;
        var elseList = [];
        while (item = _checkElse.exec(contents)) {
            cmd = item[1];
            switch (cmd) {
                case 'if':
                    lv++;
                    break;
                case 'else':
                    if (lv <= 0) {
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

        return { contents: start > -1 ? contents.substr(0, start) : contents, elseList: elseList };
    }, _traverseAttr = function (s) {
        _cmdAttrReg.lastIndex = 0;
        var item, attrs = _newBindContext({
            contents: s,
            getAttr: function (name) {
                return this[name] ? this[name].contents : '';
            },
            setAttr: function (name, contents) {
                if (this[name])
                    this[name].contents = contents;
                else
                    this[name] = _newCPAttr(contents);
            }
        });
        while (item = _cmdAttrReg.exec(s)) {
            attrs.setAttr(item[1], item[2] || item[3]);
        }
        return attrs;
    }, _renderPromise = [], _renderThread = function () {
        var promises = _renderPromise;
        _renderPromise = [];
        return _Promise.all(promises).then(function () {
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
                ['<!--', _commentPrefix, cp.id, '-->'].join('') :
                _getScriptTag(cp.id);
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
                empty = (bingo.inArray(function (item) {
                    return _isLinkNodeType(item.nodeType);
                }, nodes) < 0);
            }
            empty && nodes.push(_getCpEmptyNode(cp));
        };

    var _traverseCP = function (node, cp, fName) {
        var nodes = _parseHTML(cp.tmplTag, node, true);
        //console.log(cp.cmd, nodes.length);
        if (nodes.length > 0) {
            var pNode = nodes[0].parentNode;
            _traverseNodes(nodes, cp);
            nodes = bingo.sliceArray(pNode.childNodes);
        }

        _checkEmptyNodeCp(nodes, cp);
        _insertDom(nodes, node, fName);
        cp.setNodes(nodes);
    }, _traverseNodes = function (nodes, cp) {

        var id, tempCP;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                id = _getEmptyRenderId(item);
                if (id) {
                    tempCP = cp.getChild(id);
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

    //_compile({view:view, tmpl:tmpl});
    //_compile({cp:cp});
    var _compile = function (p) {
        var view = p.view;
        var cp = p.cp || _newCP({
            app:view ? view.app : null,
            view: view, contents: p.tmpl
        });
        cp.render().then(function () {
            console.log('compile', cp);
            _ctrlStep();
            _ctrlStepView();
            var node = _query('#context1');
            var fr = _traverseCP(node, cp, 'appendTo');
            console.log('_traverseCP', node.innerHTML);

            console.log('render End', new Date());
        });
    };

    var _rootView = _newView({
        name: '',
        app: bingo.app('')
    });
    _compile({
        tmpl: tmpl,
        view: _rootView
    });

    //console.time('aaaa');
    //var _tranContext = _newTranContext(), cmdList = _traverseCmd(tmpl, _tranContext);
    //_tranContext.promise().then(function () {
    //    console.log('cmdList', cmdList);
    //    //console.timeEnd('aaaa');
    //});


    //查找dom 节点 <div>
    var _domNodeReg = /\<[^>]+\>/gi,
        //解释可绑定的节点属性: attr="fasdf[user.name]"
        _domAttrReg = /(\S+)\s*=\s*(\"(?:\\\"|[^"])*?\[.+?\](?:\\\"|[^"])*\"|\'(?:\\\'|[^'])*?\[.+?\](?:\\\'|[^'])*\')/gi;

    var _domAttrList = [];
    var s = tmpl.replace(_domNodeReg, function (find, pos, contents) {
        //console.log('domNodeReg', arguments);
        _domAttrReg.lastIndex = 0;
        return find.replace(_domAttrReg, function (findAttr, name, dot, contents) {
            _domAttrList.push({
                name: name,
                contents: contents
            });
            return 'bg-' + findAttr;
        });
        return find;
    });
    console.log(s);
    console.log('domAttrReg', _domAttrList);

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
        name: ''
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
