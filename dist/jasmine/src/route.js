
(function (bingo) {
    "use strict";

<<<<<<< HEAD
    //设置tmpl资源路由
    bingo.route('tmpl', {
        //路由url, 如: view/system/user/list
        url: 'tmpl/{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        to: { ajax: 'tmpls/{controller*}.html1111', tmpl: 'tmpls/{controller*}.html' },
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: '', controller: '' }
    });

    //设置viewS资源路由
    bingo.route('route-demo', {
        //路由url, 如: view/system/user/list
        url: 'demo/{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        to: {
            tmpl: 'demo/{controller*}.html',
            using: 'demo/{controller*}.js'
        },
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: 'demo', controller: 'user/list' }
    });

    //设置actionS资源路由
    bingo.route('ctrl', {
        url: 'ctrl/{controller*}',
        to: 'modules/{controller*}.js',
        defaultValue: { app: '', controller: 'user/list' }
    });

    //设置component资源路由
    bingo.route('component', {
        url: 'comp/{component*}',
        to: 'comp/{component*}.js',
        defaultValue: { app: '', component: 'component' }
    });

    //设置service资源路由
    bingo.route('service', {
        url: 'srvs/{service*}',
        to: 'services/{service*}.js',
        defaultValue: { app: '', service: 'user' }
=======
    var app = bingo.defualtApp;

    //设置viewS资源路由
    app.route('controller', {
        //优先级, 越小越前, 默认100
        //priority: 200,
        type: 'controller',
        //路由url, 如: view/system/user/list
        url: '{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: 'routes/{controller*}.js',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置tmpl资源路由
    app.route('route', {
        //路由url, 如: view/system/user/list
        type: 'route',
        url: '{routes*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: 'routes/{routes*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置tmpl资源路由
    app.route('tmpl', {
        //路由url, 如: view/system/user/list
        type: 'tmpl',
        url: '{tmpl*}',
        //路由到目标url, 生成:modules/system/user/list.html
        toUrl: 'tmpls/{tmpl*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置service资源路由
    app.route('service', {
        type: 'service',
        url: '{service*}',
        toUrl: 'services/{service*}.js',
        defaultValue: { app: 'demo', service: '' }
>>>>>>> master
    });


})(bingo);
