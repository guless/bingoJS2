
(function (bingo) {
    "use strict";

    var defualtApp = bingo.defualtApp;

    defualtApp.command('view', function (cp) {

        var ctrlAttr = cp.$attrs.$getAttr('controller');

        if (!bingo.isNullEmpty(ctrlAttr)) {
            var ctrl, view = cp.$view, pView = view.$parent,
                app = view.$app;
            if (pView.bgTestProps(ctrlAttr))
                ctrl = pView.bgDataValue(ctrlAttr);
            else if (window.bgTestProps(ctrlAttr))
                ctrl = window.bgDataValue(ctrlAttr);

            if (ctrl) {
                cp.$view.$controller(ctrl);
            } else {
                var url = 'controller::' + ctrlAttr;
                var routeContext = app.routeContext(url);
                var context = routeContext.context();

                if (context.controller) {
                    view.$controller(context.controller)
                } else {
                    //如果找不到controller, 加载js
                    return app.using(url).then(function () {
                        if (cp.bgIsDispose) return;
                        var context = routeContext.context();
                        if (context.controller) {
                            view.$controller(context.controller)
                        }
                    });
                }
            }

        }

    });

    defualtApp.command('controller', function (cp) {

        cp.$view.$controller(function () {
            cp.$eval();
        });

    });

    defualtApp.command('using', function (cp) {
        var src = cp.$attrs.$getAttr('src');
        return src && cp.$app.using(src);
    });

    defualtApp.command('service', function (cp) {
        var src = cp.$attrs.$getAttr('src'),
            name = cp.$attrs.$getAttr('name');
        return src && name && cp.$inject(src);
    });

    var _forItemReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/;


    defualtApp.command('with', function (cp) {

        var contents = cp.$attrs.$contents;

        var itemName, dataName;
        if (_forItemReg.test(contents)) {
            itemName = RegExp.$1,
            dataName = RegExp.$2 || RegExp.$4;
        } else {
            dataName = contents;
        }
        
        if (dataName) {
            cp.$init(function () {
                var bindContext = cp.$attrs.$bindContext(dataName, true),
                    data = bindContext() || {};
                var withData = bingo.extend({}, cp.$withData());
                if (itemName)
                    cp.$withData(itemName, data);
                else
                    cp.$withData(data);

                return cp.$html(cp.$contents);
            });
        }

    });

    var _makeForTmpl = function (tmpl, datas, itemName, pWithData, withListName) {
        datas = bingo.extend([], datas);
        pWithData = pWithData || {};
        var withDataList = [],
            count = datas.length, tmplList = [];

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

            tmplList.push(['{{with ', withListName, '[', index ,'] }}', tmpl, '{{/with}}'].join(''));

            //htmls.push(_compiles.injWithTmpl(tmpl, index, pIndex));
        }, this);
        pWithData[withListName] = withDataList;

        return tmplList.join('');
    };

    defualtApp.command('for', function (cp) {

        var contents = cp.$attrs.$contents;
        var withListName = '_bg_for_datas_' + bingo.makeAutoId();

        if (_forItemReg.test(contents)) {
            var itemName = RegExp.$1, dataName = RegExp.$2 || RegExp.$4;
            if (itemName && dataName) {
                cp.$attrs.$contents = dataName;
                cp.$layout(function () {
                    return cp.$attrs.$result();
                }, function (c) {
                    var t = c.value,
                        isL = bingo.isArray(t),
                        datas = isL ? t : bingo.sliceArray(t);
                    (!isL) && datas.length == 0 && (datas = t ? [t] : []);

                    var html = _makeForTmpl(cp.$contents, datas, itemName, cp.$withData(), withListName);
                    return cp.$html(html);

                });
            }
        }

        cp.bgOnDispose(function () {
            var withData = cp.$withData();
            delete withData[withListName];
        });

    });

    defualtApp.command('if', function (cp) {

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
            return cp.$html(_getContent(-1, c.value));
        });

        bingo.each(_elseList, function (item, index) {
            item.$attrs.$contents && cp.$layout(function () {
                return item.$attrs.$result();
            }, function (c) {
                return cp.$html(_getContent(index, c.value));
            }, 0, false);
        });

    });

    defualtApp.command('include', function (cp) {

        cp.$init(function () {
            return cp.$loadTmpl(cp.$attrs.$getAttr('src')).then(function (tmpl) { return cp.$html(tmpl); });
        });

    });

    defualtApp.command('html', function (cp) {

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$html(c.value);
        });

    });

    defualtApp.command('text', function (cp) {

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$text(c.value);
        });

    });

    defualtApp.command('cp', function (cp) {
        cp.$tmpl(cp.$contents);
        cp.$export = cp;
    });

    //{{tmpl id="tmpl001" for="app"}} tmpl contents {{/tmpl}}
    defualtApp.command('tmpl', function (cp) {
        var id = cp.$attrs.$getAttr('id');
        if (id) {
            var isApp = /app/i.test(cp.$attrs.$getAttr('for'));
            cp.$saveTmpl(id, cp.$contents, isApp);
        }
        cp.$init(function () { cp.$remove(); });
    });

    defualtApp.command('route', function (cp) {

        var src = cp.$attrs.$getAttr('src'),
            app = cp.$app;

        src && cp.$init(function () {
            location.href(src);
        });

        var location = {
            bgNoObserve: true,
            url: src,
            name: cp.$name,
            href: function (src) {
                this.url = src;
                return cp.$loadTmpl('route::' + src).then(function (html) { return cp.$html(html); });
            },
            //路由query部分参数
            queryParams: function () {
                return this.routeParams().queryParams
            },
            //路由参数
            routeParams: function () {
                var url = this.url;
                var routeContext = app.routeContext('route::' + url);
                return routeContext.params;
            },
            reload: function () {
                return cp.$reload();
            },
            toString: function () {
                return this.url;
            },
            close: function () {
                cp.$remove();
                this.bgDispose();
            }
        };

        cp.$name && (cp.$app._location[cp.$name] = location);

        cp.$export = location;
    });

    bingo.app.extend({
        _location:{},
        location: function (name) {
            return this._location[name];
        }
    });
    
    
})(bingo);
