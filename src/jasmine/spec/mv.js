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
        cp.$init(function () {
            return cp.$html(cp.$contents);
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

        it('view init normal', function () {

            var count = 0, list = [];
            app.controller('childMain', function ($view) {
                count++;
                list.push('childMain');

                $view.$init(function () {
                    count++;
                    list.push('childMain init');

                });

                $view.$ready(function () {
                    count++;
                    list.push('childMain ready');

                });
            });

            app.controller('child', function ($view, testSrv) {
                count++;
                list.push('child');

                $view.$init(function () {
                    count++;
                    list.push('child init');

                });

                $view.$ready(function () {
                    count++;
                    list.push('child ready');

                });
            });

            app.controller('child1', function ($view, testSrv) {
                count++;
                list.push('child1');

                $view.$init(function () {
                    count++;
                    list.push('child1 init');
                    return bingo.Promise.timeout(300);

                });

                $view.$ready(function () {
                    count++;
                    list.push('child1 ready');
                    return bingo.Promise.timeout(300);

                });
            });
            waitsFor(function () { return count == 9; });

            runs(function () {
                expect(list).toEqual(['childMain', 'child', 'child1', 'childMain init', 'child init', 'child1 init', 'childMain ready', 'child ready', 'child1 ready']);
            });
            _complile('viewInitNormal');

        });

        it('view init html', function () {

            var count = 0, list = [];
            app.controller('childMain_html', function ($view) {
                count++;
                list.push('childMain');

                $view.$init(function () {
                    count++;
                    list.push('childMain init');

                });

                $view.$ready(function () {
                    count++;
                    list.push('childMain ready');

                });
            });

            app.controller('child_html', function ($view, testSrv) {
                count++;
                list.push('child');

                $view.$init(function () {
                    count++;
                    list.push('child init');

                });

                $view.$ready(function () {
                    count++;
                    list.push('child ready');

                });
            });

            app.controller('child1_html', function ($view, testSrv) {
                count++;
                list.push('child1');

                $view.$init(function () {
                    count++;
                    list.push('child1 init');
                    return bingo.Promise.timeout(300);
                });

                $view.$ready(function () {
                    count++;
                    list.push('child1 ready');
                    return bingo.Promise.timeout(300);
                });
            });
            waitsFor(function () { return count == 9; });

            runs(function () {
                expect(list).toEqual(['childMain', 'child', 'child1', 'child1 init', 'child1 ready', 'child init', 'child ready', 'childMain init', 'childMain ready']);
            });
            _complile('viewInitHtml');

        });

    }); //end describe view


});
