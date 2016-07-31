
demoApp.controller('route1', function ($view, $location) {
    $view.title = 'route1';
    $view.desc = 'route1 OK'+new Date();

    $view.$ready(function () {
        console.log('route1 ready');
    });

    $view.reload = function () {
        $location('main').reload();
    };
    $view.route2 = function () {
        $location('main').href('route2');
    };
    $view.bgOnDispose(function () {
        console.log('dispose route1');
    });

});
