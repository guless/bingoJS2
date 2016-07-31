
(function (bingo) {
    "use strict";

    var app = bingo.app('test');

    //app默认 route, 但priority最大（最后）
    app.route('**', {
        priority: 99999,
        url: '**',
        toUrl: function (url, param) { return url; }
    });

    //设置viewS资源路由
    app.route('controller', {
        //优先级, 越小越前, 默认100
        //priority: 200,
        type: 'controller',
        //路由url, 如: view/system/user/list
        url: '{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: 'spec/controllers/{controller*}.js',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { controller: '' }
    });

    //设置tmpl资源路由
    app.route('view', {
        //路由url, 如: view/system/user/list
        type: 'view',
        url: '{view*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: 'routes/{view*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { view: '' }
    });

    //设置tmpl资源路由
    app.route('tmpl', {
        //路由url, 如: view/system/user/list
        type: 'tmpl',
        url: '{tmpl*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: 'tmpls/{tmpl*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { controller: '' }
    });

    //设置service资源路由
    app.route('service', {
        type: 'service',
        url: '{service*}',
        toUrl: 'spec/services/{service*}.js',
        defaultValue: { service: '' }
    });


})(bingo);
