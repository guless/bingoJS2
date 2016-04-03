
(function (bingo) {
    "use strict";

    //设置route资源路由
    bingo.route('route-demo', {
        //优先级, 越小越前, 默认100
        priority: 200,
        //路由url, 如: view/system/user/list
        url: '{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        to: { tmpl: '{controller*}', using:'' },
        promise: {
            tmpl: function (p) {
                var id = 'tpl_' + this.tmpl;
                return bingo.tmpl(document.getElementById(id));
            }
        },
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置tmpl资源路由
    bingo.route('tmpl', {
        //路由url, 如: view/system/user/list
        url: 'tmpl/{controller*}',
        //路由到目标url, 生成:modules/system/user/list.html
        to: 'tmpls/{controller*}.html',
        //变量默认值, 框架提供内部用的变量: app, controller, component, service
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置ctrl资源路由
    bingo.route('ctrl', {
        url: 'ctrl/{controller*}',
        to: '{controller*}.js',
        defaultValue: { app: 'demo', controller: '' }
    });

    //设置component资源路由
    bingo.route('component', {
        url: 'comp/{component*}',
        to: 'comps/{component*}.js',
        defaultValue: { app: 'demo', component: '' }
    });

    //设置service资源路由
    bingo.route('service', {
        url: 'services/{service*}',
        to: 'services/{service*}.js',
        defaultValue: { app: 'demo', service: '' }
    });

})(bingoV2);
