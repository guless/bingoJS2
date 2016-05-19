(function (bingo, app) {


    var _pageManager = {
        bgNoObserve: true,
        action: '',
        pageList: [],
        isBack: function (name) {
            var list = this.pageList, len = list.length;
            return this.action !== 'go' && len > 1 && list[len - 2] == name;
        },
        go: function (name) {
            this.action = 'go';
            location.hash = name;
        },
        open: function (name) {
            this.pageList.push(name);
            var view = app.view('home');
            var tmpl = '{{include src="' + name + '" /}}';
            view.$insertAfter(tmpl);
        },
        back: function () {
            this.action = 'back';
            history.back();
        },
        close: function (name) {
            var view = app.view(name);
            if (!view) return;
            this.pageList.pop();
            var node = view.$getNodes()[0];
            var jo = $(node);
            jo.addClass('slideOut').on('animationend', function () {
                view.$ownerCP.$parent.$remove();
            }).on('webkitAnimationEnd', function () {
                view.$ownerCP.$parent.$remove();
            });
        },
        _hashReg: /#([^#]*)$/,
        hash: function () {
            return this._hashReg.test(location + '') ? RegExp.$1 : '';
        },
        _init:false,
        init: function () {
            if (this._init) return;
            this._init = true;
            $(window).on('hashchange', function () {

                var name = _pageManager.hash();
                if (name) {
                    try {
                        switch (_pageManager.action) {
                            case 'go':
                                _pageManager.open(name);
                                break;
                            default:
                                if (_pageManager.isBack(name))
                                    _pageManager.close(_pageManager.pageList[_pageManager.pageList.length-1]);
                                else
                                    _pageManager.open(name);
                                break;
                        }
                    } finally {
                        _pageManager.action = '';
                    }
                } else if (_pageManager.pageList.length > 0) {
                    _pageManager.close(_pageManager.pageList.pop());
                }
            });

            var hash = this.hash();
            if (hash)
                this.open(hash);
        }
    };//end _pageManager

    app.service('$ui', ['$view', function ($view) {
        if ($view.$ui) return $view.$ui;

        $view.$ready(function () {
            _pageManager.init();
        });

        var $ui = $view.$ui = {
            bgNoObserve:true,
            go: function (name) {
                _pageManager.go(name);
            },
            back: function () {
                _pageManager.back();
            },
            showLoading: function (msg, timeout) {
                var pNode = _getPageNode[0];
                return $component.create({
                    context: pNode, src: 'comp/loading', name: '',
                    msg: msg || '数据加载中',
                    timeout: timeout || 10000
                });
            },
            showComplete: function (msg, time) {
                var pNode = _getPageNode[0];
                return $component.create({
                    context: pNode, src: 'comp/complete', name: '',
                    msg: msg || '操作成功',
                    time: time || 2000
                });
            },
            $params: function () {
                return this.$dialog().params;
            },
            $dialog: function (name, p) {
                if (arguments.length == 0)
                    return $view.__dlg;

                var dlg = {
                    params: p,
                    send: function (p) {
                        return this.bgTrigger('receive', arguments);
                    },
                    receive: function (fn) {
                        return this.bgOn('receive', fn);
                    }
                };

                var node = _getPageNode()[0];
                var tmpl = '<div bg-route="' + name + '" bg-name="' + name + '"></div>';
                bingo.compile($view).tmpl(tmpl).controller(['$view', function ($view) {

                    dlg.close = function (p) {
                        if (arguments.length > 0)
                            this.send.apply(this, arguments);
                        $view.$remove();
                    };
                    $view.__dlg = dlg;
                }]).appendTo(node).compile();

                return dlg;
            }
        };
        var _getPageNode = function () { return $($view.$getNodes()[0]);};
        $view.$ready(function () {
            $view.$name != 'main' && _getPageNode().addClass('slideIn ' + $view.$name);
        });
        return $ui;
    }]);//end service $ui

    //app.component('loading', {
    //    //模板
    //    $tmpl: 'comp/loading',
    //    msg: '', timeout: -1,
    //    //编译阶段, node还是原始的node, 这里可以分析原始node内容
    //    $compile: ['$compCfg', function (p) {
    //    }],
    //    //初始化
    //    $init: ['$compCfg', function (p) {
    //        var tFn = function () {
    //            tid = null;
    //            this.$remove();
    //        }.bind(this);
    //        var tid;
    //        this.$observe('timeout', function (c) {
    //            tid && clearTimeout(tid);
    //            tid = setTimeout(tFn, c.value);
    //        }.bind(this));
    //        this.msg = p.msg;
    //        this.timeout = p.timeout;
    //    }]
    //});

    //app.component('complete', {
    //    $tmpl: 'comp/complete',
    //    msg: '', time: -1,
    //    $init: ['$compCfg', function (p) {
    //        var tFn = function () {
    //            tid = null;
    //            this.$remove();
    //        }.bind(this);
    //        var tid;
    //        this.$observe('time', function (c) {
    //            tid && clearTimeout(tid);
    //            tid = setTimeout(tFn, c.value);
    //        });
    //        this.msg = p.msg;
    //        this.time = p.time;
    //    }]
    //});

})(bingoV2, bingo.app('weiui'));