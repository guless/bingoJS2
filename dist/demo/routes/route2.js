
bingo.app('demo').controller('routes/route2', function ($view, $comp, $location) {
    $location('routeTest')
    $view.title = 'route2';
    $view.desc = 'route2 OK';
    console.log('route2 cp select1', $comp('select1'), $comp('select1').datas);

    $view.$ready(function () {
        console.log('route2 ready');
    });

    $view.$readyAll(function () {
        console.log('route2 readyall');
    });

    $view.reload = function () {
        $location().reload();
    };
    $view.route1 = function () {
        $location().href('routes/route1');
    };

});