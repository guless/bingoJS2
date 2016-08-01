
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
        defaultValue: { controller: '' }
    });

    //设置route资源路由
    demoApp.route('view', {
        type: 'view',
        url: '{view*}',
        toUrl: 'routes/{view*}.html',
        defaultValue: { view: '' }
    });

    //设置tmpl资源路由
    demoApp.route('tmpl', {
        type: 'tmpl',
        url: '{tmpl*}',
        toUrl: 'tmpls/{tmpl*}.html',
        defaultValue: { tmpl: '' }
    });

    //设置command资源路由
    demoApp.route('command', {
        type: 'command',
        url: '{command*}',
        toUrl: 'commands/{command*}.js',
        defaultValue: { command: '' }
    });

    //设置ajax资源路由
    demoApp.route('ajax', {
        type: 'ajax',
        url: '{ajax*}',
        toUrl: '{ajax*}',
        defaultValue: { ajax: '' }
    });

    //设置service资源路由
    demoApp.route('service', {
        type: 'service',
        url: '{service*}',
        toUrl: 'services/{service*}.js',
        defaultValue: { service: '' }
    });

    //设置controller资源路由
    demoApp.route('test', {
        priority: 20,
        //路由url, 如: user/list
        url: 'test/{controller*}/{page}',
        //路由到目标url, 生成:routes/user/list.js
        //toUrl: function (url, p) {
        //    console.log(url, p);
        //},
        toUrl: 'services/{controller*}.js',
        promise: function (url, p) {
            console.log('promise', url, p);
        },
        //变量默认值, 框架提供内部用的变量: app, controller, service
        defaultValue: { controller: '' }
    });


})(bingoV2);
