/// <reference path="lib.js" />

(function (bingo, app) {

    app.controller('main', ['$view', '$ui', function ($view, $ui) {


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

        $view.showLoading = function () {
            $ui.showLoading('数据加载中', 3000);
        };

        $view.showComplete = function () {
            $ui.showComplete('已完成', 2000);
        };

    }]);//end toast

    app.controller('dialog', ['$view', '$ui', function ($view, $ui) {
        $view.showDialog1 = false;

        $view.showDialog2 = function () {
            $ui.$dialog('dialog1', {title:'aaaa'}).receive(function (s) {
                $ui.showComplete(s);
            });
        };
    }]);//end dialog

    app.controller('dialog1', ['$view', '$ui', function ($view, $ui) {
        $view.params = $ui.$params();

        $view.close = function () {
            $ui.$dialog().close('关闭成功!');
        };
    }]);//end dialog

    app.controller('progress', ['$view', '$ui', function ($view, $ui) {

        var progress = 0;
        $view.progress = 0;
        $view.$layout('progress', function (c) {
            progress = ++progress % 100;
            $view.progress = progress + '%';
        },2);
        $view.start = function () {
            if ($(this).hasClass('weui_btn_disabled')) {
                return;
            }

            $(this).addClass('weui_btn_disabled');
            
            progress++;
            $view.progress = progress+'%';

        };


    }]);//end progress

    app.controller('msg', ['$view', '$ui', function ($view, $ui) {

        $view.open = function (name) {
            $ui.go(name);
        };

        $view.ok = function () {
            $ui.back();
        };

        $view.back = function () {
            $ui.back();
        };

    }]);//end msg

    app.controller('article', ['$view', '$ui', function ($view, $ui) {


    }]);//end article

    app.controller('actionsheet', ['$view', '$ui', function ($view, $ui) {
        $view.show = function () {
            var mask = $('#mask');
            var weuiActionsheet = $('#weui_actionsheet');
            weuiActionsheet.addClass('weui_actionsheet_toggle');
            mask.show().addClass('weui_fade_toggle').one('click', function () {
                hideActionSheet(weuiActionsheet, mask);
            });
            $('#actionsheet_cancel').one('click', function () {
                hideActionSheet(weuiActionsheet, mask);
            });
            weuiActionsheet.unbind('transitionend').unbind('webkitTransitionEnd');

            function hideActionSheet(weuiActionsheet, mask) {
                weuiActionsheet.removeClass('weui_actionsheet_toggle');
                mask.removeClass('weui_fade_toggle');
                weuiActionsheet.on('transitionend', function () {
                    mask.hide();
                }).on('webkitTransitionEnd', function () {
                    mask.hide();
                })
            }
        };

    }]);//end actionsheet

    app.controller('icons', ['$view', '$ui', function ($view, $ui) {


    }]);//end icons

    app.controller('panel', ['$view', '$ui', function ($view, $ui) {


    }]);//end panel

    app.controller('tab', ['$view', '$ui', function ($view, $ui) {

        $view.click = function () {
            var id = $(this).data('id');
            $ui.go(id);
        };

    }]);//end tab

    app.controller('navbar', ['$view', '$ui', function ($view, $ui) {


    }]);//end navbar

    app.controller('tabbar', ['$view', '$ui', function ($view, $ui) {


    }]);//end tabbar

    app.controller('searchbar', ['$view', '$ui', function ($view, $ui) {


    }]);//end searchbar


})(bingoV2, demoApp);