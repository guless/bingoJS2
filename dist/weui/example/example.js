/**
 * Created by jf on 2015/9/11.
 */

$(function () {

    var app = bingo.app('demo'), _pageManager = {
        action:'',
        pageList:[],
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
            var view = bingo.view('main'), node = view.$getNode();
            var tmpl = '<div bg-route="' + name + '" bg-name="' + name + '"></div>';
            bingo.compile(view).tmpl(tmpl).appendTo(node).compile();
        },
        back: function () {
            this.action = 'back';
            history.back();
        },
        close: function (name) {
            var view = bingo.view(name);
            if (!view) return;
            this.pageList.pop();
            var node = view.$getNode();
            var jo = $(node);
            jo.children('.page').addClass('slideOut').on('animationend', function () {
                jo.remove();
            }).on('webkitAnimationEnd', function () {
                jo.remove();
            });
        },
        hash: function () {
            return bingo.location.hash(location + '');
        },
        init: function () {
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
                                    _pageManager.close(_pageManager.pageList.pop());
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

    app.service('$ui', ['$view', 'node', '$compile', function ($view, node, $compile) {

        if ($view.$ui) return $view.$ui;
        var $ui = $view.$ui = {
            go: function (name) {
                _pageManager.go(name);
            },
            back: function () {
                _pageManager.back();
            }
        };
        $view.$ready(function () {
            $view.$name != 'main' && $(node).children('.page').addClass('slideIn ' + $view.$name);
        });
        return $ui;
    }]);//end service $ui

    app.controller('main', ['$view', '$ui', function ($view, $ui) {
        _pageManager.init();

    }]); //end main

    app.controller('home', ['$view', '$ui', function ($view, $ui) {
        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end home

    app.controller('button', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end button

    app.controller('cell', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end cell

    app.controller('toast', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end toast

    app.controller('dialog', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end dialog

    app.controller('progress', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end progress

    app.controller('msg', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end msg

    app.controller('article', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end article

    app.controller('actionsheet', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end actionsheet

    app.controller('icons', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end icons

    app.controller('panel', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end panel

    app.controller('tab', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end tab

    app.controller('searchbar', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

    }]);//end searchbar


});