/**
 * Created by jf on 2015/9/11.
 */

$(function () {

    var app = bingo.app('demo');

    app.service('$ui', ['$view', 'node', '$compile', function ($view, node, $compile) {
        if ($view.$ui) return $view.$ui;
        var $ui = $view.$ui = {
            close: function (name) {
                var node = bingo.view('main').$getNode();
                var jo = $(node);
                jo.addClass('slideOut').on('animationend', function () {
                    jo.remove();
                }).on('webkitAnimationEnd', function () {
                    jo.remove();
                });
            },
            go: function (name) {
                location.hash = name;
                var tmpl = '<div bg-route="' + name + '" bg-name="' + name + '"></div>';
                var node = bingo.view('main').$getNode();
                $compile(tmpl).appendTo(node).compile();
            }
        };
        $view.$ready(function () {
            $view.$name != 'main' && $(node).find('.page').addClass('slideIn ' + $view.$name);
        });
        return $ui;
    }]);

    app.controller('main', ['$view', '$ui', '$compile', function ($view, $ui, $compile) {
        $view.$ready(function () {
            $ui.go('home');
        });

        var pageList = [];
        $(window).on('hashchange', function () {
            console.log('hashchange');
            var name = bingo.location.hash(location + '');
            pageList.push(name);
            $ui.go(name);
        });

    }]);

    app.controller('home', ['$view', '$ui', function ($view, $ui) {
        $view.open = function (name) {
            $ui.go(name);
        };

    }]);

    app.controller('button', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);


});