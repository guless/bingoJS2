
(function (bingo) {
    "use strict";

    var defualtApp = bingo.defualtApp;

    defualtApp.command('view', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var ctrl = cp.$attrs.$getAttr('controller');
        if (ctrl) {
            ctrl = cp.$app.controller(ctrl);
            ctrl && cp.$view.$controller(ctrl.fn);
        }

        return cp;
    });
    defualtApp.command('splice', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('<div class="splice">{{view /}} {{text title /}}==============================</div>');

        cp.$controller(function ($view) {
            $view.title = cp.$name;
        });

        //cp.$export = { test: '' };
        //cp.$init(function () {
        //    setTimeout(function () { cp.$remove(); }, 1000);
        //});
        return cp;
    });

    defualtApp.command('controller', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$view.$controller(function () {
            cp.$eval();
        });

        return cp;
    });


    var _forItemReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/;


    defualtApp.command('with', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

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

        return cp;
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
        /// <param name="cp" value="_newCP()"></param>

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

        return cp;
    });

    defualtApp.command('if', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

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

        return cp;
    });

    defualtApp.command('include', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl(function () {
            return bingo.tmpl(cp.$attrs.$getAttr('src'));
        });

        return cp;
    });

    defualtApp.command('html', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$html(c.value);
        });

        return cp;
    });

    defualtApp.command('text', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$text(c.value);
        });

        return cp;
    });

    defualtApp.command('select', function (cp) {
        /// <param name="cp" value="_newCP()"></param>
        cp.$tmpl('{{view /}}<select>{{for item in datas}}<option value="1"></option>{{/for}}</select>');

        cp.$controller(function ($view) {

            $view.idName = '';
            $view.textName = '';
            $view.id = '';
            $view.datas = '';

        });

        return cp;
    });

    defualtApp.command('cp', function (cp) {
        cp.$tmpl(cp.$contents);
        cp.$export = cp;
        return cp;
    });
    
})(bingo);
