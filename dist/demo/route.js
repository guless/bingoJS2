
(function (bingo) {
    "use strict";

    var demoApp = window.demoApp = bingo.app('demo');

    //设置controller资源路由
    demoApp.route('controller', {
        //优先级, 越小越前, 默认100
        //priority: 200,
        type:'controller',
        //路由url, 如: user/list
        url: '{controller*}',
        //路由到目标url, 生成:routes/user/list.js
        toUrl: 'routes/{controller*}.js',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置route资源路由
    demoApp.route('route', {
        type: 'route',
        url: '{routes*}',
        toUrl: 'routes/{routes*}.html',
        defaultValue: { app: 'demo', routes: '' }
    });

    //设置tmpl资源路由
    demoApp.route('tmpl', {
        type: 'tmpl',
        url: '{tmpl*}',
        toUrl: 'tmpls/{tmpl*}.html',
        defaultValue: { app: 'demo', tmpl: '' }
    });

    //设置service资源路由
    demoApp.route('service', {
        type: 'service',
        url: '{service*}',
        toUrl: 'services/{service*}.js',
        defaultValue: { app: 'demo', service: '' }
    });

})(bingoV2);
