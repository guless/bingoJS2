
(function (bingo) {
    "use strict";

    var demoApp = window.demoApp = bingo.app('demo');

    //设置viewS资源路由
    demoApp.route('route-demo', {
        //优先级, 越小越前, 默认100
        priority: 200,
        type:'controller',
        //路由url, 如: view/system/user/list
        url: '{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: '{controller*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置tmpl资源路由
    demoApp.route('route', {
        //路由url, 如: view/system/user/list
        type: 'route',
        url: '{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: '{controller*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置tmpl资源路由
    demoApp.route('tmpl', {
        //路由url, 如: view/system/user/list
        type: 'tmpl',
        url: '{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: 'tmpls/{controller*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置actionS资源路由
    demoApp.route('ctrl', {
        url: 'ctrl/{controller*}',
        toUrl: '{controller*}.js',
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置component资源路由
    demoApp.route('component', {
        url: 'comp/{component*}',
        toUrl: 'comps/{component*}.js',
        defaultValue: { app: 'demo', component: '' }
    });

    //设置service资源路由
    demoApp.route('service', {
        type: 'service',
        url: '{service*}',
        toUrl: 'services/{service*}.js',
        defaultValue: { app: 'demo', service: '' }
    });

})(bingoV2);
