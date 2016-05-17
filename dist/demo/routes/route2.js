
demoApp.controller('route2', function ($view, $location) {
    $view.title = 'route2';
    $view.desc = 'route2 OK' + new Date();

    $view.$ready(function () {
        console.log('route2 ready');
    });

    $view.$readyAll(function () {
        console.log('route2 readyall');
    });

    $view.reload = function () {
        $location('main').reload();
    };
    $view.route1 = function () {
        $location('main').href('route1');
    };

    $view.bgOnDispose(function () {
        console.log('dispose route2');
    });

});
