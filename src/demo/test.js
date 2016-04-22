//tran command
(function () {

    var _Promise = bingo.Promise,
        _isPromise = _Promise.isPromise, _promisePush = function (promises, p) {
            _isPromise(p) && promises.push(p);
            return p;
        }, _retPromiseAll = function (promises) {
            return promises.length > 0 ? _Promise.always(promises) : undefined;
        };

    //新建view
    var _newView = function () {
        return {

        };
    };

    //新建CP, 编译context
    var _newCP = function () {
        return {
            view: null,
            id: '',
            cmd: '',
            attrs: '',
            content: '',
            childCmd: null,
            extend: function (p) {
                return bingo.extend(this, p);
            },
            _getContent: function () {
                if (this._tmplFn)
                    return this._tmplFn();
                else
                    return this.content;
            },
            tmpl: function (fn) {
                this._tmplFn = fn;
                return this;
            },
            render: function () {
                var ret = this._getContent();
                if (_isPromise(ret))
                    ret.then(function (s) {
                        this.childCmd = _traverseCmd(s);
                    }.bind(this));
                else
                    this.childCmd = _traverseCmd(ret);
            },
            laout: function (p, fn) {

            },
            controller: function (fn) {
                this._ctrl = fn;
            }
        };
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
            return bingo.tmpl(cp.attrs.src);
        });
        return cp;
    });



    var tmpl = document.getElementById('tmpl1').innerHTML;


    //指令解释:
    //{{cmd /}}
    //{{cmd attr="asdf" /}}
    //{{cmd attr="asdf"}} content {{/cmd}}
    var _commandReg = /\{\{\s*(\S+)\s*(.*?)\/\}\}|\{\{\s*(\S+)\s*?(.*?)\}\}((?:.|\n|\r)*)\{\{\/\3\}\}/gi,
        //解释else
        _checkElse = /\{\{\s*(\/?if|else)\s*(.*?)\}\}/gi,
        //解释指令属性: attr="fasdf"
        _cmdAttrReg = /(\S+)\s*=\s*(?:\"((?:\\\"|[^"])*?)\"|\'((?:\\\'|[^'])*?)\')/gi,
        //解释cmd过程同步动态加载
        _cmdPromises = [];

    //scriptTag
    var _scriptTag = '<' + 'script type="text/html" bg-id="{0}"></' + 'script>',
        _getIdTag = function (id) { return _scriptTag.replace('{0}', id); };

    var _traverseCmd = function (tmpl) {
        _commandReg.lastIndex = 0;
        var list = [];
        tmpl = tmpl.replace(_commandReg, function (find, cmd, attrs, cmd1, attrs1, content1) {
            //console.log('_commandEx', arguments);
            var id = bingo.makeAutoId(), tmCP = _newCP(), cmdDef;
            if (cmd) {
                cmdDef = _defCommand(cmd);
                tmCP.extend({
                    id: id,
                    cmd: cmd,
                    attrs: _traverseAttr(attrs),
                    content: '',
                    childCmd: null
                });
                if (cmdDef) {
                    cmdDef(tmCP);
                    _promisePush(_cmdPromises, tmCP.render());
                }
            } else {
                var elseList = null;
                if (cmd1 == 'if') {
                    var elseContent = _traverseElse(content1);
                    content1 = elseContent.content;
                    elseList = elseContent.elseList;
                }
                cmdDef = _defCommand(cmd1);
                tmCP.extend({
                    id: id,
                    cmd: cmd1,
                    attrs: _traverseAttr(attrs1),
                    content: content1,
                    elseList: elseList,
                    childCmd: null
                });
                if (cmdDef) {
                    cmdDef(tmCP);
                }
                _promisePush(_cmdPromises, tmCP.render());
            }

            list.push(tmCP);

            return _getIdTag(id);
        });
        return { tmpl: tmpl, cmdList: list };
    }, _traverseElse = function (content) {
        var lv = 0, item, cmd, index = -1, start = -1;
        _checkElse.lastIndex = 0;
        var elseList = [];
        while (item = _checkElse.exec(content)) {
            cmd = item[1];
            switch (cmd) {
                case 'if':
                    lv++;
                    break;
                case 'else':
                    if (lv <= 0) {
                        if (start == -1) start = item.index;
                        if (index >= 0) {
                            elseList.push(content.substr(index, item.index - index));
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
            elseList.push(content.substr(index));

            bingo.each(elseList, function (item, index) {
                elseList[index] = _traverseCmd(item);
            });

        }

        return { content: start > -1 ? content.substr(0, start) : content, elseList: elseList };
    }, _traverseAttr = function (s) {
        _cmdAttrReg.lastIndex = 0;
        var item, attrs = {};
        while (item = _cmdAttrReg.exec(s)) {
            attrs[item[1]] = item[2] || item[3];
        }
        return attrs;
    };
    var cmdList = _traverseCmd(tmpl);
    _Promise.always(_cmdPromises).then(function () {
        console.log('cmdList', cmdList);
    });


    //查找dom 节点 <div>
    var _domNodeReg = /\<[^>]+\>/gi,
        //解释可绑定的节点属性: attr="fasdf[user.name]"
        _domAttrReg = /(\S+)\s*=\s*(\"(?:\\\"|[^"])*?\[.+?\](?:\\\"|[^"])*\"|\'(?:\\\'|[^'])*?\[.+?\](?:\\\'|[^'])*\')/gi;

    var _domAttrList = [];
    var s = tmpl.replace(_domNodeReg, function (find, pos, content) {
        //console.log('domNodeReg', arguments);
        _domAttrReg.lastIndex = 0;
        return find.replace(_domAttrReg, function (findAttr, name, dot, content) {
            _domAttrList.push({
                name: name,
                content: content
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
