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
            childCmd: null,
            tranContext:null,
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
                        this.childCmd = _traverseCmd(s, this.tranContext);
                    }.bind(this));
                else
                    this.childCmd = _traverseCmd(ret, this.tranContext);
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
        return _newBindContext({ contents: contents
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
        _cmdAttrReg = /(\S+)\s*=\s*(?:\"((?:\\\"|[^"])*?)\"|\'((?:\\\'|[^'])*?)\')/gi,
        _newTranContext = function () {
            //解释上下文

            return _newBase({
                view:null,
                _promises: [],
                promise: function (p) {
                    if (arguments.length > 0) {
                        _promisePush(this._promises, p);
                    } else {
                        var prs = this._promises;
                        this._promises = [];
                        return _Promise.always(prs);
                    }
                }
            });
        };

    //scriptTag
    var _scriptTag = '<' + 'script type="text/html" bg-id="{0}"></' + 'script>',
        _getIdTag = function (id) { return _scriptTag.replace('{0}', id); };

    var _traverseCmd = function (tmpl, tranContext) {
        _commandReg.lastIndex = 0;
        var list = [], view, app;
        tmpl = tmpl.replace(_commandReg, function (find, cmd, attrs, cmd1, attrs1, content1) {
            //console.log('_commandEx', arguments);
            var id = bingo.makeAutoId(), elseList, item;
            if (cmd1 == 'if') {
                var elseContent = _traverseElse(content1, tranContext);
                content1 = elseContent.contents;
                elseList = elseContent.elseList;
            }
            item = {
                id: id,
                cmd: cmd1 || cmd,
                tranContext: tranContext,
                attrs: _traverseAttr(attrs1 || attrs),
                contents: content1 || '',
                elseList: elseList,
                childCmd: null
            };
            (item.cmd == 'view') && (view = item);
            list.push(item);

            return _getIdTag(id);
        });

        var cmdList = [], tmCP, cmdDef;
        view && (tranContext.view = _newView({
            name: view.attrs.getContens('name'),
            app: bingo.app(view.attrs.getContens('app'))
        }));
        bingo.each(list, function (item) {
            tmCP = _newCP(item);
            tmCP.view = tranContext.view;
            tmCP.app = tmCP.view.app;
            cmdDef = _defCommand(item.cmd);
            cmdDef && cmdDef(tmCP);
            tranContext.promise(tmCP.render());
            cmdList.push(tmCP);
        });
        return { tmpl: tmpl, cmdList: cmdList };
    }, _traverseElse = function (contents, tranContext) {
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

            bingo.each(elseList, function (item, index) {
                elseList[index] = _traverseCmd(item, tranContext);
            });

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

    //console.time('aaaa');
    var _tranContext = _newTranContext(), cmdList = _traverseCmd(tmpl, _tranContext);
    _tranContext.promise().then(function () {
        console.log('cmdList', cmdList);
        //console.timeEnd('aaaa');
    });


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
