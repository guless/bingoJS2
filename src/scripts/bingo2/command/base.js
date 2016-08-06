
(function (bingo) {
    "use strict";

    var defualtApp = bingo.defualtApp;

    var _addCtrl = function (cp) {


        var ctrlAttr = cp.$attrs.$getAttr('controller');

        if (!bingo.isNullEmpty(ctrlAttr)) {
            var ctrl, view = cp.$view, pView = view.$parent,
                app = view.$app;
            if (pView.bgTestProps(ctrlAttr))
                ctrl = pView.bgDataValue(ctrlAttr);
            else if (window.bgTestProps(ctrlAttr))
                ctrl = window.bgDataValue(ctrlAttr);

            if (bingo.isFunction(ctrl) && bingo.isFunction(ctrl)) {
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
    };

    defualtApp.command('view', function (cp) {
        return _addCtrl(cp);
    });

    defualtApp.command('controller', function (cp) {

        var src = cp.$attrs.$getAttr('src');

        if (!src) cp.$view.$controller(function () {
            cp.$eval();
        });
        else return _addCtrl(src);

    });

    defualtApp.command('using', function (cp) {
        var src = cp.$attrs.$getAttr('src');
        return src && cp.$app.using(src);
    });

    defualtApp.command('service', function (cp) {
        var src = cp.$attrs.$getAttr('src'),
            name = cp.$attrs.$getAttr('name');
        return src && name && cp.$inject(src).then(function (srv) { cp.$view[name] = srv; });
    });

    var _forItemReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/;


    defualtApp.command('with', function (cp) {
        cp.$isAFrame = false;

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

        cp.$isAFrame = false;

        var contents = cp.$attrs.$contents;
        var withListName = '_bg_for_datas_' + bingo.makeAutoId();

        if (_forItemReg.test(contents)) {
            var itemName = RegExp.$1, dataName = RegExp.$2 || RegExp.$4, tmpl = bingo.trim(RegExp.$3);
            if (itemName && dataName) {
                cp.$attrs.$contents = dataName;
                var render = function (html, datas) {
                    if (tmpl)
                        return cp.$loadTmpl(tmpl).then(function (html) { return renHtml(html, datas); });
                    else
                        return renHtml(html, datas);
                }, renHtml = function (html, datas) {
                    html = _makeForTmpl(html, datas, itemName, cp.$withData(), withListName);
                    return cp.$html(html);
                };
                cp.$layout(function () {
                    return cp.$attrs.$result();
                }, function (c) {
                    var t = c.value,
                        isL = bingo.isArray(t),
                        datas = isL ? t : bingo.sliceArray(t);
                    (!isL) && datas.length == 0 && (datas = t ? [t] : []);

                    return render(cp.$contents, datas);

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
            }, _tid, _html = function (c, index) {
                if (_tid) return;
                _tid = true;
                return bingo.Promise.timeout(1).then(function () { _tid = false; return cp.$html && cp.$html(_getContent(index, c.value)); });
            };
        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return _html(c, -1);
        });

        bingo.each(_elseList, function (item, index) {
            item.$attrs.$contents && cp.$layout(function () {
                return item.$attrs.$result();
            }, function (c) {
                return _html(c, index);
            });
        });

    });

    defualtApp.command('include', function (cp) {
        var src = cp.$attrs.$getAttr('src');

        cp.$init(function () {
            return !src ? cp.$html(cp.$contents) : cp.$loadTmpl(src).then(function (tmpl) { return cp.$html(tmpl); });
        });
        cp.$export = cp;
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
            app = cp.$app,
            rId = 0;

        src && cp.$init(function () {
            location.href(src);
        });

        var location = {
            bgNoObserve: true,
            url: src,
            name: cp.$name,
            href: function (src, ctrl) {
                var id = (++rId);//加载最后一个src
                this.url = src;
                return cp.$loadTmpl('view::' + src).then(function (html) {
                    return (id == rId) ? cp.$html(html, ctrl) : '';
                });
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
            reload: function (ctrl) {
                return this.href(src, ctrl);
            },
            toString: function () {
                return this.url;
            },
            close: function () {
                this.bgDispose();
                cp.$remove();
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
