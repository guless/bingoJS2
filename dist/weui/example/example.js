/**
 * Created by jf on 2015/9/11.
 */

$(function () {

    var app = bingo.app('demo');

    app.service('$ui', ['$view', 'node', '$compile', function ($view, node, $compile) {
        if ($view.$ui) return $view.$ui;
        var $ui = $view.$ui = {
            show: function () {
                $view.$ctrlname != 'main' && $(node).find('.page').addClass('slideIn '+$view.$ctrlname);
            },
            go: function (name) {
                var tmpl = '<div bg-route="'+name+'"></div>';
                $compile(tmpl).appendTo(node).compile();
            }
        };
        $view.$ready(function () {
            $ui.show();
        });
        return $ui;
    }]);

    app.controller('main', ['$view', '$ui', function ($view, $ui) {

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