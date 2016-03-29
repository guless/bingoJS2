
(function (bingo) {
    "use strict";

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
    bingo.route('view', {
        //路由url, 如: view/system/user/list
        url: 'view/{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        to: 'modules/{controller*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: '', controller: 'user/list' }
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
    });


})(bingo);
