//tran command
(function () {

    var _Promise = bingo.Promise,
        _isPromise = _Promise.isPromise, _promisePush = function (promises, p) {
            _isPromise(p) && promises.push(p);
            return p;
        }, _retPromiseAll = function (promises) {
            return promises.length > 0 ? _Promise.always(promises) : undefined;
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
        return _newBase({
        }).extend(p);
    }, _newCP = function (p) {
        //新建command的CP参数对象

        return _newBindContext({
            view: null,
            app:null,
            cmd: '',
            attrs: null,
            children: null,
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
            extend: function (p) {
                return bingo.extend(this, p);
            },
            _getContent: function () {
                if (this._tmplFn)
                    return this._tmplFn();
                else
                    return this.contents;
            },
            tmpl: function (fn) {
                this._tmplFn = fn;
                return this;
            },
            render: function () {
                var ret = this._getContent();
                if (_isPromise(ret))
                    ret.then(function (s) {
                        return _traverseCmd(s, this);
                    }.bind(this));
                else
                    ret = _traverseCmd(ret, this);
                return ret;
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
            }
        }).extend(p);
    }, _newCPAttr = function (contents) {
        return _newBindContext({
            contents: contents
        });
    };


    var _commands = {}, _defCommand = function (name, fn) {
       
        if (arguments.length == 1)
            return _commands[name];
        else
            _commands[name] = fn;
    };

    _defCommand('include', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.tmpl(function () {
            return bingo.tmpl(cp.attrs.getContens('src'));
        });

        cp.layout(function () {
            return cp.layout(function () {
                cp.re;
            }, function (c) { });
        });

        cp.controller(function ($view) {
            $view.title = '标题';
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
    var _scriptTag = '<' + 'script type="text/html" bg-id="{0}"></' + 'script>',
        _getIdTag = function (id) { return _scriptTag.replace('{0}', id); };

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

            return _getIdTag(id);
        });

        if (view) {
            app = bingo.app(view.attrs.getContens('app'));
            view = _newView({
                name: view.attrs.getContens('name'),
                app: app
            });
        } else {
            app = cp.app;
            view = cp.view;
        }

        var children = [], tempCP, cmdDef, elseList,
                promises = [];
        bingo.each(list, function (item) {
            tempCP = _newCP(item);
            tempCP.view = view;
            tempCP.app = app;
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
                    _promisePush(promises, cpT.render());
                    elseList[index] = cpT;
                });
            }
            _promisePush(promises, tempCP.render());
            children.push(tempCP);
        });
        cp.children = children;
        cp.tmplTag = tmpl;
        return _retPromiseAll(promises);
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
        var item, attrs = {
            getContens: function (name) {
                return this[name] ? this[name].contents : '';
            }
        };
        while (item = _cmdAttrReg.exec(s)) {
            attrs[item[1]] = _newCPAttr(item[2] || item[3]);
        }
        return attrs;
    };

    var _doc = document,
        _docEle = _doc.documentElement, _queryAll = function (selector, context) {
            context || (context = _docEle);
            return context.querySelectorAll(_qScope + selector);
        }, _query = function (selector, context) {
            context || (context = _docEle);
            return context.querySelector(_qScope + selector);
        };

    /* 检测 scope */
    var _qScope = ":scope ";
    try {
        _docEle.querySelector(":scope body");
    } catch (e) {
        _qScope = '';
    }


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
        var fr = document.createDocumentFragment();
        bingo.each(container.childNodes, function (item) {
            fr.appendChild(item);
        });
        _parseSrcipt(container, script);
        return fr.childNodes;
    }, _insertDom = function (nodes, refNode, fName) {
        //fName:appendTo, insertBefore
        bingo.each(nodes, function (item) {
            if (item) {
                if (fName == 'appendTo')
                    refNode.appendChild(item);
                else
                    refNode.parentNode[fName](item, refNode);
            }
        });
    };

    var _traverseCP = function (node, tmpl, fName, cp) {

        var nodes = _parseHTML(tmpl, node, true);
        _traverseNodes(nodes, cp);
        var fr = nodes.length > 0 ? nodes[0].parentNode : null
        _insertDom([fr], node, fName);

    }, _traverseNodes = function (nodes, cp) {

        var id, tempCP;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                id = _getBgTagId(item);
                if (id) {
                    tempCP = cp.getChild(id);
                    if (tempCP) {
                        console.log('tempCP', tempCP);
                        _traverseCP(item, tempCP.tmplTag, 'insertBefore', tempCP);
                        _removeNode(item);
                    }
                } else {
                    _traverseNodes(_queryAll('script', item), cp);
                }
            }
        });
    }, _isScriptTag = /script/i, _getBgTagId = function (node) {
        return (_isScriptTag.test(node.tagName)) ?
            node.getAttribute('bg-id') : null;
    };

    var _compile = function (p) {
        var view = p.view;
        var cp = _newCP({
            app:view ? view.app : null,
            view: view, contents: p.tmpl
        });
        _Promise.resolve().then(function () { return cp.render(); }).then(function () {
            console.log('compile', cp);
            var node = _query('#context1');
            var fr = _traverseCP(node, cp.tmplTag, 'appendTo', cp);
            console.log('_traverseCP', node.innerHTML);
        });
    };

    var _rootView = _newView({
        name: 'rootView',
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
