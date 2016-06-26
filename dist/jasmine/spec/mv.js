/// <reference path="../src/helper.js" />

describe('mv --- bingoJS ' + bingo.version, function () {

    var undefined;
    function fnTTTT() { };

    var app = bingo.app('test');

    var _complile = function (id, fn) {
        bingo.ready(function () {
            var p = bingo.compile(document.getElementById(id));
            fn && p.then(fn);
        });
    };

    app.command('content', function (cp) {
        cp.$tmpl(function () {
            var src = cp.$attrs.$getAttr('src');
            return !src ? cp.$contents : cp.$loadTmpl(src);
        });
    });


    describe('view ======>', function () {

        it('controller', function () {
            var isOk = false, viewName,viewApp;
            app.controller('viewTest', function ($view) {
                $view.isOk = true;
                isOk = true;
                viewName = $view.$name;
                viewApp = $view.$app.name;
            });

            waitsFor(function () { return isOk; });

            runs(function () {
                expect(isOk).toEqual(true);
                expect(viewName).toEqual('viewTest1');
                expect(app.view(viewName).$name).toEqual('viewTest1');
                expect(viewApp).toEqual('test');
            });

            _complile('viewTestContain');

        });

        it('view init default', function () {

            var list = [];
            app.controller('childMain', function ($view, $cache) {
                list.push('childMain');
                $cache('childMainList', list);

                $view.$init(function () {
                    list.push('childMain init');

                });

                $view.$ready(function () {
                    list.push('childMain ready');

                });
            });

            app.controller('child', function ($view, testSrv) {
                list.push('child');

                $view.$init(function () {
                    list.push('child init');

                });

                $view.$ready(function () {
                    list.push('child ready');
                    return bingo.Promise.timeout(300);

                });
            });

            app.controller('child1', function ($view, testSrv) {
                list.push('child1');

                $view.$init(function () {
                    list.push('child1 init');
                    return bingo.Promise.timeout(300);

                });

                $view.$ready(function () {
                    list.push('child1 ready');
                });
            });
            waitsFor(function () {
                return list.length == 12;
            });

            runs(function () {
                expect(list).toEqual(['childMain', 'child', 'child1', 'child3', 'child3 init', 'child3 ready', 'child1 init', 'child1 ready', 'child init', 'child ready', 'childMain init', 'childMain ready']);
            });

            _complile('viewInitNormal');

        });

        xit('view init content', function () {
            //这个事件顺序不在稳定

            var list = [];
            app.controller('childMain_html', function ($view, $cache) {
                $cache('childMainListHtml', list);
                list.push('childMain');

                $view.$init(function () {
                    list.push('childMain1 init');

                });

                $view.$ready(function () {
                    list.push('childMain ready');
                });
            });

            app.controller('child_html', function ($view, testSrv) {
                list.push('child');

                $view.$init(function () {
                    list.push('child init');

                });

                $view.$ready(function () {
                    list.push('child ready');
                });
            });

            app.controller('child1_html', function ($view, testSrv) {
                list.push('child1');

                $view.$init(function () {
                    list.push('child1 init');
                    return bingo.Promise.timeout(300);
                });

                $view.$ready(function () {
                    list.push('child1 ready');
                    return bingo.Promise.timeout(300);
                });
            });
            waitsFor(function () { return list.length == 12; });

            runs(function () {
                console.log(list);
                //expect(list).toEqual(["childMain1", "child", "child1", "child3", "childMain init", "child init", "child1 init", "child3 init", "childMain ready", "child ready", "child1 ready", "child3 ready"]);
                expect(list).toEqual(['childMain1', 'child3', 'child', 'child1', 'childMain init', 'child init', 'child1 init', 'child3 init', 'childMain ready', 'child ready', 'child1 ready', 'child3 ready']);
            });
            _complile('viewInitHtml');

        });

    }); //end describe view


});
