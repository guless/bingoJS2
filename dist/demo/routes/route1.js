
bingo.app('demo').controller('routes/route1', function ($view, $comp, $location) {
    $view.title = 'route1';
    $view.desc = 'route1 OK';
    console.log('route1 cp select1', $comp('select1'), $comp('select1').datas);

    $view.$ready(function () {
        console.log('route1 ready');
    });

    $view.$readyAll(function () {
        console.log('route1 readyall');
    });

    $view.reload = function () {
        $location().reload();
    };
    $view.route2 = function () {
        $location().href('routes/route2');
    };
});