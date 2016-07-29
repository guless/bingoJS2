
(function (bingo, app) {
    "use strict";

    //app默认 route, 但priority最大（最后）
    app.route('**', {
        priority: 99999,
        url: '**',
        toUrl: function (url, param) { return url; }
    });

    //设置controller资源路由
    app.route('controller', {
        //优先级, 越小越前, 默认100
        //priority: 200,
        type: 'controller',
        //路由url, 如: user_list
        url: '{controller*}',
        //路由到目标url, 生成:user_list
        toUrl: '{controller*}',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { controller: '' }
    });

    //设置route资源路由
    app.route('route', {
        type: 'route',
        url: '{routes*}',
        toUrl: '{routes*}',
        promise: function (url, p) {
            var id = '#tpl_' + url;
            return app.tmpl(id, p, false);
        },
        defaultValue: { routes: '' }
    });

    //设置tmpl资源路由
    app.route('tmpl', {
        type: 'tmpl',
        url: '{tmpl*}',
        toUrl: '{tmpl*}',
        promise: function (url, p) {
            var id = '#tpl_' + url;
            return app.tmpl(id, p, false);
        },
        defaultValue: { tmpl: '' }
    });

    //设置service资源路由
    app.route('service', {
        type: 'service',
        url: '{service*}',
        toUrl: '{service*}.js',
        defaultValue: { service: '' }
    });


})(bingoV2, bingo.app('weiui'));
