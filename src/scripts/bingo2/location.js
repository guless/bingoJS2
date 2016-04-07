
(function (bingo) {

    /*
        与bg-route同用, 取bg-route的url等相关
        $location.href('view/system/user/list');
        var href = $location.href();
        var params = $location.params();
    
    */
    var _routeCmdName = 'bg-route',
        _dataKey = '_bg_location_',
        _documentElement = document.documentElement;

    //bingo.location('main') 或 bingo.location($('#id')) 或 bingo.location(docuemnt.body)

    bingo.location = function (p) {
        /// <summary>
        /// location 没有给删除如果dom在一直共用一个
        /// </summary>
        /// <param name="p">可选，可以是字串、jquery和dom node, 默认document.documentElement</param>
        /// <returns value='_locationClass.NewObject()'></returns>
        bingo.isString(p) && (p = '[bg-name="' + p + '"]');
        var node = null;
        if (bingo.isString(p))
            node = document.querySelectorAll(p)[0];
        else if (p)
            node = p;

        var isRoute = node ? true : false;
        if (!isRoute)
            node = _documentElement;

        var o = node[_dataKey];
        if (!o) {
            o = new _locationClass().ownerNode(node).isRoute(isRoute).name(node.getAttribute('bg-name') || '');
            o.bgLinkNode(node);
            o.bgOnDispose(function () {
                node[_dataKey] = null;
                this.bgTrigger('onClosed');

            });
            node[_dataKey] = o;
        }
        return o;
    };

    bingo.location.bgEventDef('onHref onHrefBefore onLoadBefore onLoaded');

    var _hashReg = /#([^#]*)$/,
        _hash = function (url) {
            return _hashReg.test(url) ? RegExp.$1 : '';
        };
    bingo.extend(bingo.location, {
        href: function (url, target) {
            var loc = target instanceof _locationClass ? target : bingo.location(target);
            if (loc.isRoute()) {
                loc.ownerNode().setAttribute(_routeCmdName, url);
                loc.bgTrigger('onHref', [url]);
            }
        },
        hash: function (url) {
            return _hash(url);
        }
    });

    var _locationClass = bingo.location.Class = bingo.Class(function () {

        this.Prop({
            ownerNode: null,
            //是否路由出来的, 否则为window
            isRoute: false,
            name:''
        });

        this.Define({
            //路由query部分参数
            queryParams: function () {
                return this.routeParams().queryParams
            },
            //路由参数
            routeParams: function () {
                var url = this.url();
                var routeContext = bingo.routeContext(url);
                return routeContext.params;
            },
            href: function (url, target) {
                bingo.location.href(url, bingo.isNullEmpty(target) ? this : target);
            },
            reload: function (target) {
                return this.href(this.url(), target);
            },
            onLoaded: function(callback){
                return this.on('onLoaded', callback);
            },
            url: function () {
                if (this.isRoute())
                    return this.ownerNode().getAttribute(_routeCmdName);
                else
                    return window.location + '';
            },
            hash: function () {
                return bingo.location.hash(this.url());
            },
            toString: function () {
                return this.url();
            },
            views: function () {
                return bingo.view(this.ownerNode())._bgpri_.children;
            },
            close: function () {
                if (!this.isRoute()) return;
                if (this.bgTrigger('onCloseBefore') === false) return;
                var node = this.ownerNode();
                node.parentNode.removeChild(node);
            }
        });

        this.Event('onHref onCloseBefore onClosed');

    });

    //$location.href('view/demo/userlist')
    //$location.href('view/demo/userlist', 'main')
    bingo.service('$location', ['node', function (node) {
        return function (targer) { return bingo.location(targer || node); };
    }]);

    /*
        使用方法:
        bg-route="system/user/list"
    
        连接到system/user/list, 目标:main
        <a href="#system/user/list" bg-target="main">在main加载连接</a>
        设置frame:'main'
        <div bg-route="" bg-name="main"></div>
    */
    var _tagRoute = 'bg-route', _tagCtrl = 'bg-controller';
    bingo.command(_tagRoute, function () {
        return {
            priority: 1000,
            replace: false,
            view: true,
            compileChild: false,
            compilePre: ['node', function (node) {
                this.tmpl = node.getAttribute(_tagRoute);
                node.setAttribute(_tagCtrl, this.tmpl);
            }],
            compile: ['$compile', 'node', '$attr', '$location', function ($compile, node, $attr, $location) {

                //只要最后一次，防止连续点击链接
                var _node = node.cloneNode(false), _last = null, _href = function (url, type) {
                    if (bingo.location.bgTrigger('onLoadBefore', [url, $location]) === false) return;
                    _last && !_last.bgIsDispose && _last.stop();
                    _last = type == 0 ? $compile(url).htmlTo(node) : $compile(_node.outerHTML).replaceTo(node);
                    return _last.compile().then(function () {
                        _last = null;
                        if ($attr.bgIsDispose) return;
                        $location.bgTrigger('onLoaded', [$location, url]);
                        bingo.location.bgTrigger('onLoaded', [$location]);
                    });
                };

                $location().onHref(function (url) {
                    _node.setAttribute(_tagCtrl, url);
                    _node.setAttribute(_tagRoute, url);
                    _href(url, 1);
                });
                
                return _href($attr.content, 0);
            }]
        };
    }); //end bg-route

})(bingo);
